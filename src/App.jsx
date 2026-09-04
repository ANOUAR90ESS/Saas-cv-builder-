import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react'
import { dismissBootScreen } from '@/lib/bootScreen'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
// The landing route is NOT lazy, and that is deliberate. Every other route is:
// they are only reachable after the app is running, so their chunks cost
// nothing up front. The landing page is different — it is where almost every
// visit starts, and as a lazy import the browser could not even ask for it
// until the entry chunk had downloaded and executed. That second round trip
// measured ~370 ms on a throttled mobile profile with the network idle
// throughout. Preloading it via <link rel="modulepreload"> was tried instead
// and was worse on both counts (2462 ms ready, first paint pushed 572→748 ms),
// because ten parallel preloads starve the render-blocking stylesheet.
import Home from '@/pages/Home';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ScrollSaver from './components/ScrollSaver';
import { NavigationTracker } from '@/hooks/useSmartBack';
import Layout from '@/components/Layout';
import PageSlide from "@/components/PageSlide";
import { LanguageProvider } from '@/lib/i18n';
import CookieConsent from '@/components/CookieConsent';
import { initGlobalHaptics } from '@/lib/haptics';

const Builder = lazy(() => import('@/pages/Builder'));
const Templates = lazy(() => import('@/pages/Templates'));
const CVExamples = lazy(() => import('@/pages/CVExamples'));
const Guides = lazy(() => import('@/pages/Guides'));
const Projects = lazy(() => import('@/pages/Projects'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const SeoLanding = lazy(() => import('@/pages/SeoLanding'));
const CareerAdvice = lazy(() => import('@/pages/CareerAdvice'));
const CoverLetterGuide = lazy(() => import('@/pages/CoverLetterGuide'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Account = lazy(() => import('@/pages/Account'));
const Contact = lazy(() => import('@/pages/Contact'));
const FeaturedGallery = lazy(() => import('@/pages/FeaturedGallery'));
const CareerDashboard = lazy(() => import('@/pages/CareerDashboard'));
const JobMatcher = lazy(() => import('@/pages/JobMatcher'));
const CoverLetterGenerator = lazy(() => import('@/pages/CoverLetterGenerator'));
const InterviewCoach = lazy(() => import('@/pages/InterviewCoach'));
const ApplicationTracker = lazy(() => import('@/pages/ApplicationTracker'));
const ProfessionalProfile = lazy(() => import('@/pages/ProfessionalProfile'));
const PortfolioBuilder = lazy(() => import('@/pages/PortfolioBuilder'));
const PublicProfile = lazy(() => import('@/pages/PublicProfile'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Only a returning signed-in visitor waits here. AuthContext starts
  // isLoadingAuth false for everyone else, so the app is built and painted
  // while the Firebase Auth chunk is still downloading — which is the whole
  // point of an app that works without an account. The gate remains for a
  // visitor we expect to have a session, who would otherwise watch the header
  // flash from "Sign in" to their own account.
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app. BootScreenDismisser sits inside the Suspense boundary,
  // so it mounts only once the lazy route chunk has resolved — that is the
  // moment there is real content behind the boot screen to reveal.
  return (
    <Suspense fallback={<PageLoader />}>
      <BootScreenDismisser />
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/cv-examples" element={<CVExamples />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<Guides />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/account" element={<Account />} />
        <Route path="/user" element={<Account />} />
        <Route path="/profile" element={<Account />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/featured-templates" element={<FeaturedGallery />} />
        <Route path="/cv-maker" element={<SeoLanding slug="cv-maker" />} />
        <Route path="/resume-builder" element={<SeoLanding slug="resume-builder" />} />
        <Route path="/cv-maker-free" element={<SeoLanding slug="cv-maker-free" />} />
        <Route path="/resume-builder-free" element={<SeoLanding slug="resume-builder-free" />} />
        <Route path="/cv-without-experience" element={<SeoLanding slug="cv-without-experience" />} />
        <Route path="/student-cv" element={<SeoLanding slug="student-cv" />} />
        <Route path="/professional-cv" element={<SeoLanding slug="professional-cv" />} />
        <Route path="/ats-cv" element={<SeoLanding slug="ats-cv" />} />
        <Route path="/career-advice" element={<CareerAdvice />} />
        <Route path="/cover-letter-guide" element={<CoverLetterGuide />} />
        <Route path="/dashboard" element={<CareerDashboard />} />
        <Route path="/career" element={<CareerDashboard />} />
        <Route path="/career/job-matcher" element={<JobMatcher />} />
        <Route path="/career/cover-letter" element={<CoverLetterGenerator />} />
        <Route path="/career/interview-coach" element={<InterviewCoach />} />
        <Route path="/career/applications" element={<ApplicationTracker />} />
        <Route path="/tracker" element={<ApplicationTracker />} />
        <Route path="/profile/edit" element={<ProfessionalProfile />} />
        <Route path="/career/profile" element={<ProfessionalProfile />} />
        <Route path="/portfolio/edit" element={<PortfolioBuilder />} />
        <Route path="/career/portfolio" element={<PortfolioBuilder />} />
      </Route>
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/u/:username/portfolio" element={<PublicProfile />} />
      <Route path="/login" element={<PageSlide><Login /></PageSlide>} />
      <Route path="/register" element={<PageSlide><Register /></PageSlide>} />
      <Route path="/signup" element={<PageSlide><Register /></PageSlide>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/builder" element={<PageSlide><Builder /></PageSlide>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function BootScreenDismisser() {
  useEffect(() => { dismissBootScreen(); }, []);
  return null;
}


function PageLoader() {
  return (
    <div className="fixed inset-0 grid place-items-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function App() {
  useEffect(() => {
    initGlobalHaptics();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <Router>
            <NavigationTracker />
            <ScrollToTop />
            <ScrollSaver />
            <AuthenticatedApp />
          </Router>
          <CookieConsent />
        </LanguageProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App