import React, { useState } from "react";
import { Sparkles, Loader2, Check, X, Copy, ArrowRight, Wand2 } from "lucide-react";
import { useAiAssist } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";

export default function AiTextImprover({
  text = "",
  type = "bullet", // "bullet" | "description"
  context = {},
  onApply,
  className = "",
  compact = false
}) {
  const t = useT();
  const { aiAssist } = useAiAssist();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [appliedIndex, setAppliedIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const trimmed = (text || "").trim();

  const handleImprove = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!trimmed) {
      setError("Please enter some text first so AI can suggest enhancements.");
      setOpen(true);
      return;
    }

    setOpen(true);
    setLoading(true);
    setError("");
    setAppliedIndex(null);

    try {
      const action = type === "bullet" ? "improve_bullet" : "improve_description";
      const res = await aiAssist(action, {
        text: trimmed,
        context
      });

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (typeof res === "string" && res.trim()) {
        items = [{ type: "impact", label: "Professional Edit", text: res.trim() }];
      } else if (res && typeof res === "object") {
        items = res.suggestions || res.options || [res];
      }

      if (!items || items.length === 0) {
        throw new Error("No suggestions returned");
      }

      setSuggestions(items);
    } catch (err) {
      console.warn("AI assistance fallback:", err);
      // Fallback heuristics: elevate the phrasing without inventing facts
      const fallbackSuggestions = getFallbackImprovements(trimmed, type);
      setSuggestions(fallbackSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (suggestedText, idx) => {
    onApply?.(suggestedText);
    setAppliedIndex(idx);
    setTimeout(() => {
      setOpen(false);
      setAppliedIndex(null);
    }, 450);
  };

  const handleCopy = (suggestedText, idx) => {
    navigator.clipboard?.writeText(suggestedText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {compact ? (
        <button
          type="button"
          onClick={handleImprove}
          title="Enhance with AI"
          disabled={loading}
          className="p-1.5 rounded-md text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin text-primary" /> : <Sparkles size={13} />}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleImprove}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all disabled:opacity-60 shadow-xs"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          <span>Improve with AI</span>
        </button>
      )}

      {open && (
        <div
          className="absolute z-50 right-0 mt-2 w-80 sm:w-96 p-3.5 rounded-xl bg-card border border-border shadow-xl text-left text-foreground animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "calc(100vw - 32px)" }}
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles size={13} />
              <span>AI Text Improvement</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={14} />
            </button>
          </div>

          {loading && (
            <div className="py-6 text-center text-muted-foreground space-y-2">
              <Loader2 size={20} className="animate-spin mx-auto text-primary" />
              <p className="text-xs">Crafting professional ATS-optimized suggestions...</p>
            </div>
          )}

          {error && !loading && (
            <div className="py-2 text-xs text-amber-600 dark:text-amber-400">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg">
                <span className="font-medium text-foreground">Original: </span>
                <span className="italic">"{trimmed}"</span>
              </div>

              <div className="space-y-2">
                {suggestions.map((s, idx) => {
                  const textVal = typeof s === "string" ? s : s.text;
                  const label = s.label || (idx === 0 ? "Action & Impact" : idx === 1 ? "Concise & Direct" : "Executive");
                  const isApplied = appliedIndex === idx;
                  const isCopied = copiedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-border/70 hover:border-primary/50 bg-background/50 hover:bg-background transition group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                          {label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(textVal, idx)}
                            title="Copy to clipboard"
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] inline-flex items-center gap-1"
                          >
                            {isCopied ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApply(textVal, idx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-primary text-white hover:bg-primary/90 transition shadow-xs"
                          >
                            {isApplied ? (
                              <>
                                <Check size={12} /> Applied
                              </>
                            ) : (
                              <>
                                Apply <ArrowRight size={12} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{textVal}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1.5 flex justify-between items-center text-[10.5px] text-muted-foreground border-t border-border">
                <span>Preserves your true experience without fake metrics.</span>
                <button
                  type="button"
                  onClick={handleImprove}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Wand2 size={10} /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Offline high-quality heuristic improvements if network or API key is unavailable
function getFallbackImprovements(text, type) {
  let cleaned = text.replace(/^[-\*\u2022]\s*/, "").trim();
  
  // Action verb enhancement
  const actionVerbStarters = [
    { match: /^(i |my |we )?worked on /i, replace: "Spearheaded development of " },
    { match: /^(i |my |we )?helped with /i, replace: "Collaborated on delivering " },
    { match: /^(i |my |we )?was responsible for /i, replace: "Orchestrated and managed " },
    { match: /^(i |my |we )?handled /i, replace: "Supervised and executed " },
    { match: /^(i |my |we )?did /i, replace: "Executed " }
  ];

  let actionOriented = cleaned;
  for (const rule of actionVerbStarters) {
    if (rule.match.test(actionOriented)) {
      actionOriented = actionOriented.replace(rule.match, rule.replace);
      break;
    }
  }

  // If first word isn't capitalized or is passive, give it punch
  if (!/^[A-Z]/.test(actionOriented)) {
    actionOriented = actionOriented.charAt(0).toUpperCase() + actionOriented.slice(1);
  }

  const concise = cleaned
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bas well as\b/gi, "and")
    .replace(/\bdue to the fact that\b/gi, "because")
    .replace(/\bresponsible for\b/gi, "led")
    .trim();

  return [
    {
      type: "impact",
      label: "Action & Impact",
      text: actionOriented.endsWith(".") ? actionOriented : `${actionOriented}.`
    },
    {
      type: "concise",
      label: "Concise & Direct",
      text: concise.endsWith(".") ? concise : `${concise}.`
    },
    {
      type: "executive",
      label: "Executive & Formal",
      text: `Directed initiatives regarding ${cleaned.toLowerCase().replace(/^(directed|led|managed|did|worked on)\s+/i, "")}.`
    }
  ];
}
