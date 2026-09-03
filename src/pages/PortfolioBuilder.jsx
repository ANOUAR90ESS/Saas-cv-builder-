import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Github,
  Edit2,
  Trash2,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import { loadAllCVs } from "@/lib/cvStorage";
import {
  getPortfolioProjects,
  savePortfolioProjects,
  addPortfolioProject,
  deletePortfolioProject,
  importProjectFromCv,
  getCareerProfile
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";

export default function PortfolioBuilder() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [role, setRole] = useState("");
  const [achievements, setAchievements] = useState("");

  useEffect(() => {
    setProjects(getPortfolioProjects());
    setProfile(getCareerProfile());
    setCvs(loadAllCVs() || []);
  }, []);

  const openAddModal = () => {
    setEditingProj(null);
    setName("");
    setDescription("");
    setTechnologies("");
    setImageUrl("");
    setDemoUrl("");
    setGithubUrl("");
    setRole("");
    setAchievements("");
    setIsModalOpen(true);
    triggerHaptic("selection");
  };

  const openEditModal = (proj) => {
    setEditingProj(proj);
    setName(proj.name || "");
    setDescription(proj.description || "");
    setTechnologies(proj.technologies || "");
    setImageUrl(proj.imageUrl || "");
    setDemoUrl(proj.demoUrl || "");
    setGithubUrl(proj.githubUrl || "");
    setRole(proj.role || "");
    setAchievements(proj.achievements || "");
    setIsModalOpen(true);
    triggerHaptic("selection");
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const list = getPortfolioProjects();
    if (editingProj) {
      const idx = list.findIndex((p) => p.id === editingProj.id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          name,
          description,
          technologies,
          imageUrl,
          demoUrl,
          githubUrl,
          role,
          achievements,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      list.unshift({
        id: `proj_${Date.now()}`,
        name,
        description,
        technologies,
        imageUrl,
        demoUrl,
        githubUrl,
        role,
        achievements,
        updatedAt: new Date().toISOString()
      });
    }

    savePortfolioProjects(list);
    setProjects(getPortfolioProjects());
    setIsModalOpen(false);
    triggerHaptic("success");
  };

  const handleDelete = (id) => {
    if (confirm("Delete this portfolio project?")) {
      deletePortfolioProject(id);
      setProjects(getPortfolioProjects());
      triggerHaptic("selection");
    }
  };

  const handleImportFromCv = () => {
    const activeCv = cvs[0];
    if (!activeCv) return;

    if (Array.isArray(activeCv.projects) && activeCv.projects.length > 0) {
      activeCv.projects.forEach((p) => importProjectFromCv(p));
      setProjects(getPortfolioProjects());
      triggerHaptic("success");
    } else if (Array.isArray(activeCv.experience) && activeCv.experience.length > 0) {
      const firstExp = activeCv.experience[0];
      addPortfolioProject({
        name: `${firstExp.company} Architecture`,
        description: firstExp.description || "Core platform initiatives and engineering achievements.",
        technologies: "React, TypeScript, CSS, REST APIs",
        role: firstExp.job_title || "Engineer"
      });
      setProjects(getPortfolioProjects());
      triggerHaptic("success");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-2">
                <FolderGit2 size={14} />
                <span>Showcase & Work Samples</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Portfolio Builder
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Curate standout projects, code repositories, live demos, and case studies linked directly to your professional profile.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {profile?.username && (
                <Link
                  to={`/u/${profile.username}/portfolio`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
                >
                  <ExternalLink size={14} />
                  <span>View Public Portfolio</span>
                </Link>
              )}
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Plus size={15} />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick CV Import Bar */}
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Have projects on your CV?</h3>
              <p className="text-[11px] text-muted-foreground">
                Import project sections or prominent past roles directly into your visual portfolio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleImportFromCv}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition shrink-0"
          >
            Import from Active CV
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/40 transition flex flex-col justify-between group"
            >
              <div>
                {/* Image / Thumbnail */}
                {proj.imageUrl ? (
                  <div className="h-44 w-full overflow-hidden bg-muted">
                    <img
                      src={proj.imageUrl}
                      alt={proj.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-full bg-gradient-to-tr from-muted/80 to-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={24} className="opacity-40" />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {proj.name}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(proj)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(proj.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {proj.role && (
                    <span className="text-[11px] font-semibold text-primary block">
                      {proj.role}
                    </span>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Technologies tags */}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.split(",").map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {proj.achievements && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic pt-1">
                      ★ {proj.achievements}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Links */}
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Live Demo</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <Github size={12} />
                      <span>Code</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(proj)}
                  className="text-muted-foreground hover:text-foreground text-[11px]"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {/* Add New Project Card */}
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-card/40 hover:bg-primary/5 p-8 min-h-[300px] flex flex-col items-center justify-center text-center transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center mb-3 transition">
              <Plus size={24} />
            </div>
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition">
              Add New Showcase Project
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
              Feature case studies, open source repos, or design system components.
            </p>
          </button>
        </div>
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 max-w-lg w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingProj ? "Edit Showcase Project" : "Add Showcase Project"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Orchestrator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Your Role / Title in Project
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Frontend Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Project Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What problem did it solve? What was your technical approach?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Technologies Used (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind CSS, PostgreSQL"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    GitHub / Code URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Key Deliverable / Measurable Impact (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reduced render latency by 35% across 20k daily sessions"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  {editingProj ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
