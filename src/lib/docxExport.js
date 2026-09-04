import { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType } from "docx";

/**
 * Creates an editable Word (.docx) document from structured text or CV content
 */
export async function createDocxFromText(text, title = "Document") {
  const lines = text.split("\n");
  const paragraphs = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 240 }
    })
  );

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      continue;
    }

    // Detect headings
    const isHeading1 = /^(education|experience|work history|skills|summary|projects|certifications|languages|contact|objective)/i.test(rawLine);
    const isBullet = /^([•\-\*]|\d+\.)\s+/.test(rawLine);

    if (isHeading1 && rawLine.length < 50) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: rawLine.toUpperCase(),
              bold: true,
              size: 26,
              color: "1F2937"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    } else if (isBullet) {
      const cleanBullet = rawLine.replace(/^([•\-\*]|\d+\.)\s+/, "");
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cleanBullet,
              size: 22,
              color: "374151"
            })
          ],
          bullet: { level: 0 },
          spacing: { after: 80 }
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: rawLine,
              size: 22,
              color: "374151"
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size
  };
}

/**
 * Exports a CV object to a .docx file and downloads it in browser
 */
export async function exportDocx(cv) {
  const name = cv?.personal?.full_name || cv?.name || "CV";
  const title = `${name} - Curriculum Vitae`;
  
  const textLines = [
    name,
    [cv?.personal?.email, cv?.personal?.phone, cv?.personal?.location].filter(Boolean).join(" | "),
    "",
    cv?.summary ? `PROFESSIONAL SUMMARY\n${cv.summary}\n` : "",
    Array.isArray(cv?.experience) && cv.experience.length > 0
      ? `WORK EXPERIENCE\n` + cv.experience.map(e => `${e.job_title || "Role"} at ${e.company || "Company"} (${e.start_date || ""} - ${e.end_date || "Present"})\n${e.description || ""}`).join("\n\n")
      : "",
    Array.isArray(cv?.education) && cv.education.length > 0
      ? `\nEDUCATION\n` + cv.education.map(e => `${e.degree || "Degree"} - ${e.school || "Institution"} (${e.graduation_year || ""})`).join("\n")
      : "",
    Array.isArray(cv?.skills) && cv.skills.length > 0
      ? `\nSKILLS\n` + cv.skills.map(s => typeof s === "string" ? s : s.name).filter(Boolean).join(", ")
      : ""
  ].filter(Boolean).join("\n");

  const { blob, url } = await createDocxFromText(textLines, title);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}_CV.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return { blob, url };
}

/**
 * Native export fallback for mobile / Capacitor
 */
export async function exportDocxNative(cv) {
  return exportDocx(cv);
}

