import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Compass,
  Layers,
  List
} from "lucide-react";
import {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";

const STAGES = [
  { key: "Saved", label: "Saved", color: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10" },
  { key: "Applied", label: "Applied", color: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
  { key: "Screening", label: "Screening", color: "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10" },
  { key: "Interview", label: "Interview", color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { key: "Offer", label: "Offer", color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
  { key: "Rejected", label: "Archived / Rejected", color: "border-border text-muted-foreground bg-muted" }
];

export default function ApplicationTracker() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formCompany, setFormCompany] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSalary, setFormSalary] = useState("");
  const [formJobUrl, setFormJobUrl] = useState("");
  const [formStatus, setFormStatus] = useState("Saved");
  const [formAppDate, setFormAppDate] = useState("");
  const [formInterviewDate, setFormInterviewDate] = useState("");
  const [formFollowUpDate, setFormFollowUpDate] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const openAddModal = (initialStatus = "Saved") => {
    setEditingApp(null);
    setFormCompany("");
    setFormJobTitle("");
    setFormLocation("");
    setFormSalary("");
    setFormJobUrl("");
    setFormStatus(initialStatus);
    setFormAppDate(new Date().toISOString().slice(0, 10));
    setFormInterviewDate("");
    setFormFollowUpDate("");
    setFormContact("");
    setFormNotes("");
    setIsModalOpen(true);
    triggerHaptic("selection");
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setFormCompany(app.company || "");
    setFormJobTitle(app.jobTitle || "");
    setFormLocation(app.location || "");
    setFormSalary(app.salary || "");
    setFormJobUrl(app.jobUrl || "");
    setFormStatus(app.status || "Saved");
    setFormAppDate(app.applicationDate || "");
    setFormInterviewDate(app.interviewDate || "");
    setFormFollowUpDate(app.followUpDate || "");
    setFormContact(app.contactPerson || "");
    setFormNotes(app.notes || "");
    setIsModalOpen(true);
    triggerHaptic("selection");
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formCompany.trim() || !formJobTitle.trim()) return;

    if (editingApp) {
      updateApplication(editingApp.id, {
        company: formCompany,
        jobTitle: formJobTitle,
        location: formLocation,
        salary: formSalary,
        jobUrl: formJobUrl,
        status: formStatus,
        applicationDate: formAppDate,
        interviewDate: formInterviewDate,
        followUpDate: formFollowUpDate,
        contactPerson: formContact,
        notes: formNotes
      });
    } else {
      addApplication({
        company: formCompany,
        jobTitle: formJobTitle,
        location: formLocation,
        salary: formSalary,
        jobUrl: formJobUrl,
        status: formStatus,
        applicationDate: formAppDate,
        interviewDate: formInterviewDate,
        followUpDate: formFollowUpDate,
        contactPerson: formContact,
        notes: formNotes
      });
    }

    setApplications(getApplications());
    setIsModalOpen(false);
    triggerHaptic("success");
  };

  const handleDelete = (id) => {
    if (confirm("Delete this job application?")) {
      deleteApplication(id);
      setApplications(getApplications());
      triggerHaptic("selection");
    }
  };

  const handleMoveStatus = (id, newStatus) => {
    updateApplication(id, { status: newStatus });
    setApplications(getApplications());
    triggerHaptic("selection");
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
                <Briefcase size={14} />
                <span>Job Pipeline & Tracking</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Job Application Tracker
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Organize your hiring pipeline from initial bookmark to final offer with interview schedules and follow-up reminders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openAddModal("Saved")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Plus size={15} />
                <span>Add Application</span>
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-xl border border-border bg-background transition"
              >
                <Compass size={14} />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Search, Filter & View Toggle Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search company, title, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Stages ({applications.length})</option>
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label} ({applications.filter((a) => a.status === s.key).length})
                  </option>
                ))}
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                  viewMode === "kanban"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers size={13} />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List size={13} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "kanban" ? (
          /* Kanban Board Columns */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageApps = filteredApps.filter((a) => a.status === stage.key);
              return (
                <div
                  key={stage.key}
                  className="rounded-2xl border border-border bg-card/60 p-3 min-w-[260px] flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stage.color}`}>
                        {stage.label}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {stageApps.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAddModal(stage.key)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-3 flex-1">
                    {stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl border border-border bg-background hover:border-primary/50 transition shadow-2xs group space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {app.company}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.jobTitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => openEditModal(app)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app.id)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {app.salary && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                            {app.salary}
                          </span>
                        )}

                        {/* Badges for Dates / Reminders */}
                        <div className="space-y-1">
                          {app.interviewDate && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold">
                              <Calendar size={11} />
                              <span>Interview: {app.interviewDate}</span>
                            </div>
                          )}
                          {app.followUpDate && (
                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              <Clock size={11} />
                              <span>Follow-up: {app.followUpDate}</span>
                            </div>
                          )}
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-muted-foreground/90 line-clamp-2 italic">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Footer Move Selector */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                          <select
                            value={app.status}
                            onChange={(e) => handleMoveStatus(app.id, e.target.value)}
                            className="text-[11px] py-0.5 px-1.5 rounded-lg border border-border bg-card text-muted-foreground focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                Move: {s.label}
                              </option>
                            ))}
                          </select>

                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageApps.length === 0 && (
                      <div className="h-28 rounded-xl border border-dashed border-border/80 flex items-center justify-center text-[11px] text-muted-foreground">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Salary</th>
                    <th className="py-3 px-4">Interview / Follow-up</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div>
                          <span>{app.company}</span>
                          <span className="block text-muted-foreground font-normal text-[11px]">
                            {app.jobTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleMoveStatus(app.id, e.target.value)}
                          className="text-xs font-semibold py-1 px-2 rounded-lg border border-border bg-background focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {app.salary || "–"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {app.interviewDate ? (
                          <span className="text-amber-600 font-semibold block">
                            Interview: {app.interviewDate}
                          </span>
                        ) : null}
                        {app.followUpDate ? (
                          <span className="text-indigo-600 text-[11px] block">
                            Follow-up: {app.followUpDate}
                          </span>
                        ) : null}
                        {!app.interviewDate && !app.followUpDate && "–"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                        {app.notes || "–"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(app)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredApps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                        No applications found matching your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 max-w-lg w-full shadow-lg space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingApp ? "Edit Job Application" : "New Job Application"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Stage / Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $130,000 - $160,000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Interview Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formInterviewDate}
                    onChange={(e) => setFormInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Follow-Up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formFollowUpDate}
                    onChange={(e) => setFormFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Job Posting URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/..."
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Contact Person (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Recruiter)"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Interview questions prepared, referral details, or compensation notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
                >
                  {editingApp ? "Save Changes" : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
