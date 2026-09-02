import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useOutlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LayoutTemplate, FolderOpen, User, LogIn } from "lucide-react";
import Logo, { LogoMark } from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

// Brand name lives here so it can be renamed in one place.
export const BRAND = "DexaCV";

const NAV = [
  { key: "nav.builder", to: "/builder" },
  { key: "nav.templates", to: "/templates" },
  { key: "nav.cvExamples", to: "/cv-examples" },
  { key: "nav.guides", to: "/guides" },
  { key: "nav.projects", to: "/projects" },
];

export default function Layout() {
  const t = useT();
  const { user } = useAuth();
  const navItems = NAV;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="text-lg" />
            <span className="hidden xl:block text-[11px] uppercase tracking-widest text-muted-foreground border-l border-border pl-3">{t("footer.aiCvBuilder")}</span>
          </div>
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"}`
                }
              >
                {t(n.key)}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition"
                title={t("nav.account")}
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                  {(user.full_name || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{user.full_name || user.email?.split("@")[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  title={t("nav.account")}
                >
                  <User size={14} />
                  <span>{t("nav.account")}</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
                >
                  <LogIn size={13} />
                  <span>Log In</span>
                </Link>
              </div>
            )}
            <LanguageSwitcher />
          </div>
          <div className="lg:hidden flex items-center gap-1.5">
            <Link
              to="/account"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title={t("nav.account")}
            >
              <User size={18} />
            </Link>
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-16 lg:pb-0 overflow-x-hidden">
        <AnimatedOutlet />
      </main>
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold mb-3">
              <LogoMark size={22} />
              {BRAND}
            </div>
            <p className="text-gray-500 leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <FooterCol titleKey="footer.product" links={[["nav.builder", "/builder"], ["nav.templates", "/templates"], ["nav.cvExamples", "/cv-examples"], ["nav.guides", "/guides"], ["nav.account", "/account"]]} />
          <FooterCol titleKey="footer.popular" links={[["nav.cvMaker", "/cv-maker"], ["nav.resumeBuilder", "/resume-builder"], ["nav.atsCv", "/ats-cv"], ["nav.studentCv", "/student-cv"], ["nav.careerAdvice", "/career-advice"], ["nav.coverLetter", "/cover-letter-guide"]]} />
          <FooterCol titleKey="footer.legal" links={[["footer.privacy", "/privacy"], ["footer.terms", "/terms"], ["footer.contact", "/contact"]]} />
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {BRAND}. {t("footer.copyright")}
        </div>
      </footer>
      <MobileTabBar />
    </div>
  );
}

function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

const ACTIVE_TAB_KEY = "dexacv_active_tab";
const TAB_PATHS_KEY = "dexacv_tab_paths";

function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const allTabs = [
    { label: t("tabs.home"), to: "/", icon: Home, end: true },
    { label: t("nav.templates"), to: "/templates", icon: LayoutTemplate },
    { label: t("nav.projects"), to: "/projects", icon: FolderOpen },
    { label: t("nav.account"), to: "/account", icon: User },
  ];
  const tabs = allTabs;

  const [active, setActive] = useState(() => {
    const idx = tabs.findIndex((t2) => t2.to === location.pathname);
    return idx >= 0 ? idx : Number(localStorage.getItem(ACTIVE_TAB_KEY) || 0);
  });

  const [tabPaths, setTabPaths] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TAB_PATHS_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const idx = tabs.findIndex((t2) => t2.to === location.pathname);
    const tabForPath = idx >= 0 ? idx : active;
    if (idx >= 0) {
      setActive(idx);
      localStorage.setItem(ACTIVE_TAB_KEY, String(idx));
    }
    setTabPaths((prev) => {
      const next = { ...prev, [tabForPath]: location.pathname };
      localStorage.setItem(TAB_PATHS_KEY, JSON.stringify(next));
      return next;
    });
  }, [location.pathname]); // eslint-disable-line

  const onTap = (i, to) => {
    const alreadyActive = i === active;
    setActive(i);
    localStorage.setItem(ACTIVE_TAB_KEY, String(i));
    if (alreadyActive) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const remembered = tabPaths[i];
    navigate(remembered && remembered !== location.pathname ? remembered : to);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.to}
            type="button"
            onClick={() => onTap(i, tab.to)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] select-none ${i === active ? "text-primary" : "text-muted-foreground"}`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function FooterCol({ titleKey, links }) {
  const t = useT();
  return (
    <div>
      <h4 className="font-semibold mb-3 text-foreground">{t(titleKey)}</h4>
      <ul className="space-y-2">
        {links.map(([labelKey, to]) => (
          <li key={to}>
            <Link to={to} className="text-gray-500 hover:text-primary transition-colors">{t(labelKey)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}