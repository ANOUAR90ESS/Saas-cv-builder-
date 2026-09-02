// Format a YYYY-MM or YYYY month string into a readable label.
import { getActiveCvLang } from "@/lib/cvSchema";

const PRESENT_BY_LANG = { en: "Present", es: "Presente", fr: "Présent", ar: "الحاضر" };

export function fmtDate(value) {
  if (!value) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = String(value).split("-");
  if (parts.length === 2) {
    const m = parseInt(parts[1], 10);
    const y = parts[0];
    if (m >= 1 && m <= 12) return `${months[m - 1]} ${y}`;
    return y;
  }
  return value;
}

export function dateRange(start, end, current) {
  const s = fmtDate(start);
  const e = current ? (PRESENT_BY_LANG[getActiveCvLang()] || "Present") : fmtDate(end);
  if (s && e) return `${s} — ${e}`;
  return s || e || "";
}