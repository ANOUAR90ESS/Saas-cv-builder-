import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Copy, Trash2, Pencil, FileText, FileType, Search } from "lucide-react";
import { createEmptyCV } from "@/lib/cvSchema";
import { useLang } from "@/lib/i18n";
import { getTemplate } from "@/lib/templates/registry";
import { loadAllCVs, upsertCV, deleteCV, duplicateCV } from "@/lib/cvStorage";
// Loaded when a download is asked for, not when the list is opened — see the
// note in Builder.jsx.
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import PaywallDialog from "@/components/billing/PaywallDialog";
import PullToRefresh from "@/components/PullToRefresh";
import SheetSelect from "@/components/builder/SheetSelect";
import Seo from "@/components/Seo";

// Local-first projects: all CVs live in the browser (localStorage). No account, no sync.
export default function Projects() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);
  // Which CV and format the visitor was refused for, so the download can be
  // finished the moment it is paid for.
  const [paywall, setPaywall] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const refresh = () => setRecords(loadAllCVs() || []);

  useEffect(() => { refresh(); }, []);

  const items = useMemo(
    () =>
      records.map((r) => ({
        id: r.id,
        title: r.title || "Untitled CV",
        template_id: r.template_id || "modern",
        tags: r.tags || [],
        updated_at: r.updated_at || r.created_at,
        cv: { ...r },
      })),
    [records]
  );

  const createNew = () => {
    const fresh = createEmptyCV(lang);
    upsertCV(fresh);
    navigate("/builder", { state: { cvId: fresh.id } });
  };

  const open = (id) => navigate("/builder", { state: { cvId: id } });

  const dup = (item) => {
    duplicateCV(item.id);
    refresh();
  };

  const renameLocal = (id, title) => {
    const cvs = loadAllCVs() || [];
    const idx = cvs.findIndex((c) => c.id === id);
    if (idx >= 0) { cvs[idx] = { ...cvs[idx], title }; upsertCV(cvs[idx]); }
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, title } : r)));
  };

  const setTags = (id, tags) => {
    const cvs = loadAllCVs() || [];
    const idx = cvs.findIndex((c) => c.id === id);
    if (idx >= 0) { cvs[idx] = { ...cvs[idx], tags }; upsertCV(cvs[idx]); }
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, tags } : r)));
  };

  const remove = (id) => {
    deleteCV(id);
    setConfirmId(null);
    refresh();
  };

  // The file comes from the server now, so a refusal for want of payment is a
  // normal answer rather than a failure — see serverExport.js.
  const download = async (cv, format) => {
    try {
      const { exportPDF, exportDocx } = await import("@/lib/serverExport");
      await (format === "docx" ? exportDocx(cv) : exportPDF(cv));
    } catch (e) {
      if (e?.name === "PaymentRequiredError") {
        setPaywall({ cv, kind: format === "docx" ? "docx" : "pdf" });
        return;
      }
      console.error(`${format === "docx" ? "DOCX" : "PDF"} export failed`, e);
      setDownloadError(
        e?.name === "ExportUnavailableError"
          ? "Downloads are unavailable right now. Please try again shortly."
          : "That download did not work. Please try again."
      );
      setTimeout(() => setDownloadError(""), 5000);
    }
  };

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (tagFilter) list = list.filter((c) => (c.tags || []).map((t) => t.toLowerCase()).includes(tagFilter.toLowerCase()));
    if (q) list = list.filter((c) => (c.title || "").toLowerCase().includes(q) || (c.tags || []).some((t) => t.toLowerCase().includes(q)));
    list = [...list];
    if (sort === "title") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else list.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    return list;
  }, [items, query, sort, tagFilter]);

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Seo title="My Projects — DexaCV" description="View, edit and download your saved CVs. Stored locally in your browser." path="/projects" noindex />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-gray-500 mt-1">
            {items.length === 0
              ? "No CVs yet — create your first below."
              : `${items.length} saved CV${items.length === 1 ? "" : "s"} — stored in this browser.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={createNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
            <Plus size={18} /> Create new CV
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <p className="text-gray-500 mb-4">You don't have any CVs yet.</p>
          <button onClick={createNew} className="text-primary font-semibold hover:underline">Create your first CV</button>
        </div>
      ) : (
        <>
          {/* Search + sort */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <SheetSelect
              value={sort === "title" ? "Title (A–Z)" : "Last edited"}
              onChange={(label) => setSort(label === "Title (A–Z)" ? "title" : "updated")}
              options={["Last edited", "Title (A–Z)"]}
              label="Sort by"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              <button
                onClick={() => setTagFilter(null)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${!tagFilter ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t === tagFilter ? null : t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${tagFilter === t ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <p className="text-gray-500">No CVs match “{query}”.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const tpl = getTemplate(item.template_id);
                const confirming = confirmId === item.id;
                return (
                  <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <button onClick={() => open(item.id)} className="block w-full bg-muted/30" aria-label={`Edit ${item.title}`}>
                      <MiniCVPreview cv={item.cv} />
                    </button>
                    <div className="p-4 flex flex-col flex-1">
                      <input
                        value={item.title}
                        onChange={(e) => renameLocal(item.id, e.target.value)}
                        className="font-semibold text-base md:text-sm w-full bg-transparent focus:outline-none focus:bg-muted rounded px-1 py-0.5"
                      />
                      <div className="flex items-center justify-between mt-1 mb-3">
                        <span className="text-xs text-gray-400">{tpl.name} · {new Date(item.updated_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <TagEditor cv={item} onChange={(tags) => setTags(item.id, tags)} />
                      {confirming ? (
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-xs text-muted-foreground mr-auto">Delete this CV?</span>
                          <button onClick={() => remove(item.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-destructive text-white hover:bg-destructive/90">Delete</button>
                          <button onClick={() => setConfirmId(null)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-auto flex-wrap">
                          <ActionBtn title="Edit" onClick={() => open(item.id)}><Pencil size={15} /></ActionBtn>
                          <ActionBtn title="Duplicate" onClick={() => dup(item)}><Copy size={15} /></ActionBtn>
                          <button onClick={() => download(item.cv, "pdf")} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition">
                            <FileText size={13} /> PDF
                          </button>
                          <button onClick={() => download(item.cv, "docx")} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition">
                            <FileType size={13} /> DOCX
                          </button>
                          <ActionBtn title="Delete" danger onClick={() => setConfirmId(item.id)}><Trash2 size={15} /></ActionBtn>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      </div>

      {downloadError ? (
        <p className="fixed bottom-4 inset-x-4 z-40 text-center text-sm bg-background border border-border rounded-xl py-2 px-3 shadow" role="alert">
          {downloadError}
        </p>
      ) : null}

      <PaywallDialog
        open={paywall !== null}
        kind={paywall?.kind}
        onClose={() => setPaywall(null)}
        onPaid={() => {
          const pending = paywall;
          setPaywall(null);
          if (pending) download(pending.cv, pending.kind);
        }}
      />
    </PullToRefresh>
  );
}

function ActionBtn({ children, danger, ...props }) {
  return (
    <button className={`p-2 rounded-lg hover:bg-muted ${danger ? "text-gray-400 hover:text-destructive" : "text-gray-500"}`} {...props}>
      {children}
    </button>
  );
}

function TagEditor({ cv, onChange }) {
  const [val, setVal] = useState("");
  const tags = cv.tags || [];
  const add = () => {
    const t = val.trim().replace(/^#/, "");
    setVal("");
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  return (
    <div className="flex flex-wrap items-center gap-1 mb-3">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          #{t}
          <button onClick={() => remove(t)} className="text-primary/60 hover:text-primary" aria-label={`Remove tag ${t}`}>×</button>
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
        }}
        placeholder="+ tag"
        className="text-base md:text-xs px-2 py-0.5 rounded-full border border-dashed border-border bg-transparent focus:outline-none focus:border-primary w-20"
      />
    </div>
  );
}