import React, { useRef, useState } from "react";
import { Upload, Loader2, X, User } from "lucide-react";
import { uploadFile } from "@/api/backend";
import { useT } from "@/lib/i18n";

export default function PhotoUpload({ value, onChange }) {
  const t = useT();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("builder.photo.errType"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      onChange(await uploadFile(file));
    } catch {
      setError(t("builder.photo.errUpload"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border border-border bg-muted grid place-items-center">
          {loading ? (
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          ) : value ? (
            <img src={value} alt={t("builder.field.photo")} className="w-full h-full object-cover" />
          ) : (
            <User className="text-muted-foreground" size={22} />
          )}
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition disabled:opacity-60"
          >
            <Upload size={14} /> {value ? t("builder.photo.change") : t("builder.photo.upload")}
          </button>
          {value && !loading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X size={12} /> {t("builder.photo.remove")}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}