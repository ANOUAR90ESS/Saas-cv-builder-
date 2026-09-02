import React, { useState } from "react";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { Field, TextArea } from "./Fields";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";
import AiTextImprover from "./AiTextImprover";

// AI assistance is optional and abstracted through a single backend function
// so the provider can be swapped later without touching the UI.
export default function SummaryEditor({ cv, onChange }) {
  const t = useT();
  const { aiAssist } = useAiAssist();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const improve = async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await aiAssist("improve_summary", {
        text: cv.summary || cv.personal_info?.professional_title || "",
        context: cv.personal_info,
      });
      onChange(result || "");
    } catch (e) {
      setErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errSuggestions"));
    } finally {
      setLoading(false);
    }
  };

  // Generate a fresh professional summary from the entered job title and
  // skills — works even before any summary text exists.
  const generate = async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await aiAssist("generate_summary", {
        text: "",
        context: { ...cv.personal_info, skills: cv.skills || [] },
      });
      onChange(result || "");
    } catch (e) {
      setErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errSummary"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Field label={t("builder.field.summaryLabel")}>
        <TextArea
          value={cv.summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("builder.ph.summary")}
          rows={6}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {t("builder.ai.generateSummary")}
        </button>
        <button
          onClick={improve}
          disabled={loading || !cv.summary}
          className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          {t("builder.ai.improveSummary")}
        </button>
        {cv.summary && (
          <AiTextImprover
            text={cv.summary}
            type="description"
            context={cv.personal_info}
            onApply={(improved) => onChange(improved)}
          />
        )}
        {err ? <span className="text-xs text-destructive">{err}</span> : null}
      </div>
    </div>
  );
}