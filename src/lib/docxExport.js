// Real DOCX export.
//
// This used to build an HTML document, hand it an application/msword MIME type
// and a .doc extension, and call it DOCX. Word opened it with a "the format and
// extension don't match" warning, Google Docs and LibreOffice mangled it, and
// applicant tracking systems that accept .docx often rejected it outright —
// while the UI offered it as DOCX. It is now a genuine OOXML package.
//
// This module now runs on the server, not in the browser. buildDocxBlob is
// the whole of it: renderDocx in src/server/exportFiles.ts calls it and sends
// the bytes back. The download helpers that used to live here -- a blob URL on
// an `<a download>`, and the Android share-sheet variant -- moved to
// serverExport.js, which is where a file that arrived over the network gets
// handed to the user.
import { dateRange, fmtDate } from "./dates";
import { SECTION_LABELS, getActiveCvLang, setActiveCvLang, levelLabel } from "./cvSchema";

const BODY = 22;      // half-points: 11pt
const NAME = 52;      // 26pt
const TITLE = 26;     // 13pt
const HEADING = 24;   // 12pt
const SMALL = 20;     // 10pt
const MUTED = "6E7482";
const INK = "1A202C";

// Word colours are hex without the leading #.
function hex(color, fallback) {
  const v = String(color || "").replace("#", "").trim();
  return /^[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : fallback;
}

export async function buildDocxBlob(cv) {
  const {
    Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, HeadingLevel, LevelFormat, convertInchesToTwip,
  } = await import("docx");

  // Section headings come from the CV's own language, exactly as they print on
  // the PDF, so the two exports never disagree.
  const previousLang = getActiveCvLang();
  setActiveCvLang(cv.language || "en");
  const lang = cv.language || "en";
  const rtl = lang === "ar";

  const pi = cv.personal_info || {};
  const primary = hex(cv.theme?.primary_color, "4F46E5");
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const children = [];

  const para = (runs, opts = {}) =>
    new Paragraph({ bidirectional: rtl, alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT, ...opts, children: runs });
  const run = (text, opts = {}) => new TextRun({ text: String(text ?? ""), rightToLeft: rtl, size: BODY, color: INK, ...opts });

  // ---- Header -------------------------------------------------------------
  children.push(para([run(pi.full_name || "Your Name", { bold: true, size: NAME })], { spacing: { after: 0 } }));
  if (pi.professional_title) {
    children.push(para([run(pi.professional_title, { size: TITLE, color: primary })], { spacing: { before: 40, after: 120 } }));
  }
  const contact = [pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github].filter(Boolean).join("  •  ");
  if (contact) {
    children.push(para([run(contact, { size: SMALL, color: MUTED })], {
      spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: primary, space: 6 } },
    }));
  }

  // ---- Helpers ------------------------------------------------------------
  // A real Word heading, so the document has an outline a reader can navigate
  // and a parser can use to find sections.
  const heading = (label) =>
    children.push(para([run(String(label).toUpperCase(), { bold: true, size: HEADING, color: primary })], {
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E6E8EC", space: 4 } },
    }));

  const entryTitle = (left, right) => {
    const runs = [run(left, { bold: true })];
    if (right) runs.push(run(`   ${right}`, { color: MUTED, size: SMALL }));
    children.push(para(runs, { spacing: { before: 140, after: 0 } }));
  };
  const meta = (text) => text && children.push(para([run(text, { italics: true, color: MUTED, size: SMALL })], { spacing: { after: 40 } }));
  const body = (text) => text && children.push(para([run(text)], { spacing: { after: 40 } }));
  // One numbering reference for every bullet, so Word shows a single continuous
  // list instead of the one-item lists the HTML version produced.
  const bullet = (text) =>
    children.push(para([run(text)], { numbering: { reference: "cv-bullets", level: 0 }, spacing: { after: 20 } }));
  const inline = (parts) => parts.length && children.push(para([run(parts.join("  •  "))], { spacing: { after: 40 } }));

  for (const key of order) {
    if (key === "summary" && cv.summary) {
      heading(SECTION_LABELS.summary);
      body(cv.summary);
    } else if (key === "experience" && cv.experience?.length) {
      heading(SECTION_LABELS.experience);
      for (const it of cv.experience) {
        entryTitle(it.job_title, dateRange(it.start_date, it.end_date, it.current));
        meta([it.company, it.location].filter(Boolean).join(" — "));
        body(it.description);
        (it.bullet_points || []).filter(Boolean).forEach(bullet);
      }
    } else if (key === "education" && cv.education?.length) {
      heading(SECTION_LABELS.education);
      for (const it of cv.education) {
        entryTitle(it.degree, dateRange(it.start_date, it.end_date, false));
        meta([it.institution, it.location].filter(Boolean).join(" — "));
        body(it.description);
      }
    } else if (key === "skills" && cv.skills?.length) {
      heading(SECTION_LABELS.skills);
      inline(cv.skills.map((s) => s.name).filter(Boolean));
    } else if (key === "languages" && cv.languages?.length) {
      heading(SECTION_LABELS.languages);
      inline(cv.languages.filter((l) => l.name).map((l) => (l.level ? `${l.name} (${levelLabel(l.level, lang)})` : l.name)));
    } else if (key === "projects" && cv.projects?.length) {
      heading(SECTION_LABELS.projects);
      for (const it of cv.projects) {
        entryTitle(it.name, "");
        meta(it.technologies);
        body(it.description);
        if (it.url) children.push(para([run(it.url, { color: "2563EB", size: SMALL })], { spacing: { after: 40 } }));
      }
    } else if (key === "certifications" && cv.certifications?.length) {
      heading(SECTION_LABELS.certifications);
      for (const it of cv.certifications) {
        entryTitle(it.name, [it.organization, fmtDate(it.date)].filter(Boolean).join(" — "));
      }
    } else if (key === "awards" && cv.awards?.length) {
      heading(SECTION_LABELS.awards);
      for (const it of cv.awards) {
        entryTitle(it.name, "");
        meta([it.organization, fmtDate(it.date)].filter(Boolean).join(" — "));
        body(it.description);
      }
    } else if (key === "courses" && cv.courses?.length) {
      heading(SECTION_LABELS.courses);
      for (const it of cv.courses) body([it.name, it.organization, fmtDate(it.date)].filter(Boolean).join(" — "));
    } else if (key === "volunteer" && cv.volunteer?.length) {
      heading(SECTION_LABELS.volunteer);
      for (const it of cv.volunteer) {
        entryTitle(it.role, "");
        meta([it.organization, it.location].filter(Boolean).join(" — "));
        body(it.description);
      }
    } else if (key === "interests" && cv.interests?.length) {
      heading(SECTION_LABELS.interests);
      inline(cv.interests.filter(Boolean));
    } else if (key === "references" && cv.references?.length) {
      heading(SECTION_LABELS.references);
      for (const it of cv.references) {
        entryTitle(it.name, "");
        meta([it.relationship, it.contact].filter(Boolean).join(" — "));
      }
    }
  }

  setActiveCvLang(previousLang);

  const doc = new Document({
    title: cv.title || "CV",
    styles: { default: { document: { run: { font: "Calibri", size: BODY, color: INK } } } },
    numbering: {
      config: [{
        reference: "cv-bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) } } },
        }],
      }],
    },
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children,
    }],
  });

  return Packer.toBlob(doc);
}
