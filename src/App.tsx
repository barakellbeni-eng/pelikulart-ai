import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileRing from "@/components/ProfileRing";
import PublicNavbar from "@/components/pelikulart/PublicNavbar";
import PublicFooter from "@/components/pelikulart/PublicFooter";
import ScrollToTop from "@/components/pelikulart/ScrollToTop";
import GlobalActiveJobs from "@/components/GlobalActiveJobs";
import CaurisHeaderBadge from "@/components/CaurisHeaderBadge";

import StudioSplash from "@/components/pelikulart/StudioSplash";

// Studio pages
import StudioHome from "./pages/StudioHome";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import Dashboard from "./pages/Dashboard";
import MultiPlan from "./pages/MultiPlan";
import MotionControl from "./pages/MotionControl";
import LensControl from "./pages/LensControl";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Pelikulart public pages
import HomePage from "./pages/pelikulart/HomePage";
import ComingSoon from "./pages/ComingSoon";
import CreationsPage from "./pages/pelikulart/CreationsPage";
import TrainingPage from "./pages/pelikulart/TrainingPage";
// DevisPage removed
import SecretPage from "./pages/pelikulart/SecretPage";
import LegalPage from "./pages/pelikulart/LegalPage";
import TermsOfUsePage from "./pages/pelikulart/TermsOfUsePage";
import PrivacyPolicyPage from "./pages/pelikulart/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/pelikulart/CookiePolicyPage";

import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isFullHeightPage = location.pathname === "/studio/create" || location.pathname === "/studio/multi-plan" || location.pathname === "/studio/motion-control" || location.pathname === "/studio/lens-control";
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <StudioSplash onFinish={handleSplashFinish} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className={isFullHeightPage ? "flex-1 flex flex-col h-screen overflow-hidden" : "flex-1 flex flex-col min-h-screen overflow-auto"}>
          <header className="shrink-0 sticky top-0 z-50 glass px-4 py-2 flex items-center gap-3">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <CaurisHeaderBadge />
              <ThemeToggle />
              <ProfileRing />
            </div>
          </header>
          <div className={isFullHeightPage ? "flex-1 min-h-0 overflow-hidden" : "flex-1 min-h-0"}>{children}</div>
          
        </main>
      </div>
    </SidebarProvider>
  );
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
      
    </>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Routes>
        {/* Public Pelikulart pages */}
        <Route path="/" element={<ComingSoon />} />
        <Route path="/previewbarakellsecret" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/creations" element={<PublicLayout><CreationsPage /></PublicLayout>} />
        <Route path="/training" element={<PublicLayout><TrainingPage /></PublicLayout>} />
        {/* Devis removed */}
        <Route path="/secret-page" element={<SecretPage />} />
        <Route path="/mentions-legales" element={<PublicLayout><LegalPage /></PublicLayout>} />
        <Route path="/conditions-utilisation" element={<PublicLayout><TermsOfUsePage /></PublicLayout>} />
        <Route path="/politique-confidentialite" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path="/politique-cookies" element={<PublicLayout><CookiePolicyPage /></PublicLayout>} />

        {/* Auth */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Studio (open to all, generation gated in Dashboard) */}
        <Route path="/studio" element={<AuthenticatedLayout><StudioHome /></AuthenticatedLayout>} />
        <Route path="/studio/create" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
        <Route path="/studio/multi-plan" element={<AuthenticatedLayout><MultiPlan /></AuthenticatedLayout>} />
        <Route path="/studio/motion-control" element={<AuthenticatedLayout><MotionControl /></AuthenticatedLayout>} />
        <Route path="/studio/lens-control" element={<AuthenticatedLayout><LensControl /></AuthenticatedLayout>} />
        <Route path="/pricing" element={<AuthenticatedLayout><Pricing /></AuthenticatedLayout>} />
        <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout><Profile /></AuthenticatedLayout></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
