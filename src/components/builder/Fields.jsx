import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { checkSpellAndGrammar, applyCorrection, applyAllCorrections } from "@/lib/grammarEngine";
import { Check, Sparkles, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";

export function Field({ label, children, className = "" }) {
  return (
    <label className={cn("block", className)}>
      {label ? <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span> : null}
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function TextInput({ className = "", spellCheckEnabled = true, value, onChange, ...props }) {
  const [showMenu, setShowMenu] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const issues = useMemo(() => {
    if (!spellCheckEnabled || typeof value !== "string" || value.length < 3) return [];
    return checkSpellAndGrammar(value).filter((issue) => !dismissed.has(issue.word.toLowerCase()));
  }, [value, spellCheckEnabled, dismissed]);

  const handleFix = (issue, suggestion) => {
    if (!onChange) return;
    const fixed = applyCorrection(value, issue, suggestion);
    onChange({ target: { value: fixed } });
  };

  const handleFixAll = () => {
    if (!onChange || !issues.length) return;
    const fixed = applyAllCorrections(value, issues);
    onChange({ target: { value: fixed } });
    setShowMenu(false);
  };

  const handleDismiss = (word) => {
    setDismissed((prev) => new Set([...prev, word.toLowerCase()]));
  };

  return (
    <div className="relative w-full">
      <input
        spellCheck="true"
        value={value}
        onChange={onChange}
        className={cn(
          inputBase,
          issues.length > 0 && "border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/20 pr-10",
          className
        )}
        {...props}
      />

      {issues.length > 0 && (
        <div className="absolute right-2 top-2.5 z-10">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            title={`${issues.length} spelling/grammar suggestions available`}
            className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition font-semibold"
          >
            <AlertCircle size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{issues.length}</span>
          </button>
        </div>
      )}

      {/* Popover suggestions */}
      {showMenu && issues.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 p-2.5 rounded-xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles size={13} className="text-amber-500" />
              <span>Real-Time Corrections</span>
            </div>
            <div className="flex items-center gap-1.5">
              {issues.length > 1 && (
                <button
                  type="button"
                  onClick={handleFixAll}
                  className="text-[11px] font-semibold text-primary hover:underline px-1.5 py-0.5"
                >
                  Fix All
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/50 text-xs"
              >
                <div className="min-w-0">
                  <span className="line-through text-destructive font-medium mr-1.5">{issue.word}</span>
                  <span className="text-muted-foreground">➔</span>
                  {issue.suggestions?.map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleFix(issue, sugg)}
                      className="ml-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-white transition"
                    >
                      {sugg}
                    </button>
                  ))}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{issue.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismiss(issue.word)}
                  title="Ignore"
                  className="text-[10px] text-muted-foreground hover:text-foreground p-1"
                >
                  Ignore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TextArea({ className = "", spellCheckEnabled = true, value, onChange, ...props }) {
  const [showDetails, setShowDetails] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  const issues = useMemo(() => {
    if (!spellCheckEnabled || typeof value !== "string" || value.length < 3) return [];
    return checkSpellAndGrammar(value).filter((issue) => !dismissed.has(issue.word.toLowerCase()));
  }, [value, spellCheckEnabled, dismissed]);

  const handleFix = (issue, suggestion) => {
    if (!onChange) return;
    const fixed = applyCorrection(value, issue, suggestion);
    onChange({ target: { value: fixed } });
  };

  const handleFixAll = () => {
    if (!onChange || !issues.length) return;
    const fixed = applyAllCorrections(value, issues);
    onChange({ target: { value: fixed } });
  };

  const handleDismiss = (word) => {
    setDismissed((prev) => new Set([...prev, word.toLowerCase()]));
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="relative">
        <textarea
          spellCheck="true"
          value={value}
          onChange={onChange}
          className={cn(
            inputBase,
            "resize-y min-h-[80px]",
            issues.length > 0 && "border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/20",
            className
          )}
          {...props}
        />
        {issues.length > 0 && (
          <div className="absolute right-2 bottom-2.5">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition font-semibold"
            >
              <AlertCircle size={11} className="text-amber-500 shrink-0" />
              <span>{issues.length} suggestion{issues.length > 1 ? "s" : ""}</span>
              {showDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        )}
      </div>

      {/* Inline Context-Aware Correction Strip */}
      {issues.length > 0 && showDetails && (
        <div className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 text-[11px]">
              <Sparkles size={12} />
              <span>Real-Time Spell & Grammar Check ({issues.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {issues.length > 1 && (
                <button
                  type="button"
                  onClick={handleFixAll}
                  className="text-[11px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10"
                >
                  Fix All ({issues.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground p-0.5"
                title="Hide suggestions"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border shadow-2xs text-[11px]"
              >
                <span className="line-through text-destructive font-medium">{issue.word}</span>
                <span className="text-muted-foreground">➔</span>
                {issue.suggestions?.map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleFix(issue, sugg)}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
                    title={`Click to replace "${issue.word}" with "${sugg}"`}
                  >
                    <Check size={10} />
                    <span>{sugg}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleDismiss(issue.word)}
                  title="Ignore"
                  className="text-muted-foreground hover:text-destructive p-0.5 ml-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DateInput({ className = "", ...props }) {
  return <input type="month" className={cn(inputBase, className)} {...props} />;
}

export function YearInput({ className = "", ...props }) {
  return <input type="text" inputMode="numeric" placeholder="YYYY" className={cn(inputBase, className)} {...props} />;
}
