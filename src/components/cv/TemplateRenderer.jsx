import { setActiveCvLang, cvLangDir } from "@/lib/cvSchema";
import { getTemplate } from "@/lib/templates/registry";

export default function TemplateRenderer({ cv }) {
  setActiveCvLang(cv.language || "en");
  const tpl = getTemplate(cv.template_id);
  const Cmp = tpl.component;
  return (
    <div dir={cvLangDir(cv.language)}>
      <Cmp cv={cv} />
    </div>
  );
}