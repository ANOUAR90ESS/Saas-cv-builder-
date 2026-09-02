import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, KeyRound, FolderOpen, LogOut, Trash2, Loader2, ChevronLeft, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile, changePassword as changeUserPassword } from "@/api/auth";
import { deleteAccount } from "@/api/backend";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { loadAllCVs } from "@/lib/cvStorage";

const LOCAL_KEYS = ["cvforge.cvs.v1", "cvforge.active.v1", "cvforge.activeid.v1"];

export default function Account() {
  const t = useT();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.full_name || "");
  const [savingName, setSavingName] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [localCvs, setLocalCvs] = useState([]);

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name);
    }
    try {
      setLocalCvs(loadAllCVs() || []);
    } catch {
      setLocalCvs([]);
    }
  }, [user]);

  const saveName = async () => {
    setSavingName(true);
    try {
      await updateProfile({ full_name: name });
      toast({ title: t("account.saved") });
    } catch (e) {
      toast({ title: t("account.saveFailed"), description: e?.message, variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async () => {
    if (newPw !== confirmPw) {
      toast({ title: t("account.pwMismatch"), variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: t("account.pwShort"), variant: "destructive" });
      return;
    }
    setSavingPw(true);
    try {
      await changeUserPassword(user.email, currentPw, newPw);
      toast({ title: t("account.pwChanged") });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e) {
      toast({ title: t("account.pwChangeFailed"), description: e?.message, variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      LOCAL_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
      toast({ title: t("account.deleted") });
      logout(false);
      window.location.href = "/";
    } catch (e) {
      toast({ title: t("account.deleteFailed"), description: e?.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Seo title={`${t("account.title")} · DexaCV`} description="Manage your DexaCV profile, password and saved CV projects." path="/account" noindex />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft size={16} /> {t("account.back")}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("account.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? t("account.description") : "View your profile, authentication status, and saved CVs"}
            </p>
          </div>
          {user && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={14} /> Signed In
            </span>
          )}
        </div>

        {!user ? (
          <div className="mt-6 space-y-5">
            {/* Guest session card */}
            <Card className="border-primary/20 bg-card shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Guest Session</CardTitle>
                    <CardDescription>No account required to build, edit, and export CVs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  DexaCV operates without mandatory accounts. Your CVs, formatting, and templates are saved locally in your browser's private storage.
                </p>
                <p>
                  Want to access your CVs from any computer or mobile device, sync projects securely, or manage cloud backups? Sign in to your existing account or create a new one.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button asChild className="h-11">
                    <Link to="/login?returnTo=/account">
                      <LogIn size={16} className="mr-2" /> Log In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11">
                    <Link to="/register?returnTo=/account">
                      <UserPlus size={16} className="mr-2" /> Create Free Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Local Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen size={16} /> Saved CV Projects
                </CardTitle>
                <CardDescription>
                  {localCvs.length > 0
                    ? `${localCvs.length} CV project${localCvs.length > 1 ? "s" : ""} saved locally in this browser`
                    : "No local CV projects created yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/projects">{t("account.openProjects")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/builder">Open CV Builder</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><User size={16} /> {t("account.profile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("account.email")}</Label>
                  <div className="flex items-center gap-2 h-12 px-3 rounded-lg border border-input bg-muted/40 text-sm">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("account.name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("account.namePlaceholder")}
                    className="h-12"
                  />
                </div>
                <Button onClick={saveName} disabled={savingName || name === (user?.full_name || "")}>
                  {savingName && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("account.save")}
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><KeyRound size={16} /> {t("account.security")}</CardTitle>
                <CardDescription>{t("account.changePassword")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curpw">{t("account.currentPassword")}</Label>
                  <Input id="curpw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-12" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newpw">{t("account.newPassword")}</Label>
                    <Input id="newpw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confpw">{t("account.confirmPassword")}</Label>
                    <Input id="confpw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-12" />
                  </div>
                </div>
                <Button
                  onClick={changePassword}
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                >
                  {savingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("account.update")}
                </Button>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><FolderOpen size={16} /> {t("account.projects")}</CardTitle>
                <CardDescription>{t("account.projectsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link to="/projects">{t("account.openProjects")}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><LogOut size={16} /> {t("account.logout")}</CardTitle>
                <CardDescription>{t("account.logoutDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => logout()}>{t("account.logout")}</Button>
              </CardContent>
            </Card>

            {/* Danger */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive"><Trash2 size={16} /> {t("account.danger")}</CardTitle>
                <CardDescription>{t("account.deleteDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{t("account.deleteConfirm")}</p>
                <Input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder="DELETE" autoComplete="off" className="h-12" />
                <Button variant="destructive" disabled={deleting || confirmDelete !== "DELETE"} onClick={doDelete}>
                  {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {deleting ? t("account.deleting") : t("account.delete")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}