import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight, Wrench, Check, Loader2, X } from "lucide-react";

const STATUS = {
  pending: { icon: Loader2, cls: "text-amber-500 animate-spin", label: "Pending" },
  running: { icon: Loader2, cls: "text-amber-500 animate-spin", label: "Running" },
  in_progress: { icon: Loader2, cls: "text-amber-500 animate-spin", label: "Working" },
  completed: { icon: Check, cls: "text-green-600", label: "Done" },
  success: { icon: Check, cls: "text-green-600", label: "Done" },
  failed: { icon: X, cls: "text-red-500", label: "Failed" },
  error: { icon: X, cls: "text-red-500", label: "Error" },
};

function ToolCall({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS[toolCall.status] || STATUS.pending;
  const Icon = st.icon;
  let parsed = null;
  try { parsed = typeof toolCall.results === "string" ? JSON.parse(toolCall.results) : toolCall.results; } catch { parsed = toolCall.results; }
  const failed = toolCall.status === "failed" || toolCall.status === "error" || (parsed && parsed.success === false);
  const dp = toolCall.display_projection || {};
  if (dp.hide_details && dp.details_redacted) {
    const label = failed ? (dp.error_label || "Error") : (toolCall.status && ["pending", "running", "in_progress"].includes(toolCall.status) ? (dp.active_label || "Working…") : (dp.label || "Done"));
    return <div className="mt-1.5 text-xs text-gray-400">{label}</div>;
  }
  let args = null;
  try { args = JSON.parse(toolCall.arguments_string); } catch { args = toolCall.arguments_string; }
  return (
    <div className="mt-2 text-xs rounded-lg border border-border bg-muted/40 overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-muted/70">
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Wrench size={13} className="text-gray-400" />
        <span className="font-medium text-gray-700">{toolCall.name}</span>
        <span className={`ml-auto flex items-center gap-1 ${failed ? "text-red-500" : st.cls}`}><Icon size={12} />{failed ? "Failed" : st.label}</span>
      </button>
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Parameters</div>
              <pre className="bg-white rounded p-2 overflow-x-auto text-[10.5px]">{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {parsed != null && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Result</div>
              <pre className="bg-white rounded p-2 overflow-x-auto text-[10.5px]">{JSON.stringify(parsed, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-primary text-white" : "bg-muted text-gray-800"}`}>
        {message.content ? (
          isUser ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                 : <div className="prose prose-sm max-w-none text-sm"><ReactMarkdown>{message.content}</ReactMarkdown></div>
        ) : null}
        {message.tool_calls?.map((tc, i) => <ToolCall key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}