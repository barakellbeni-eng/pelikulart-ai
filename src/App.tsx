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
import pelikulartLogo from "@/assets/pelikulart-logo.jpeg";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudioHome from "./pages/StudioHome";
import Dashboard from "./pages/Dashboard";

import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Training from "./pages/Training";
import Devis from "./pages/Devis";
import { Loader2, PanelLeft } from "lucide-react";

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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          {/* Top bar with sidebar trigger */}
          <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-2 flex items-center gap-3">
            <SidebarTrigger />
            <img src={pelikulartLogo} alt="Pelikulart AI" className="w-7 h-7 rounded-lg" />
            <h1 className="text-sm font-bold tracking-[0.15em] uppercase">
              PELIKULART<span className="text-primary">.</span>AI
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <ProfileRing />
            </div>
          </header>
          <div className="flex-1 min-h-0">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isPublic = ["/", "/auth", "/formation", "/devis"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/formation" element={<Training />} />
        <Route path="/devis" element={<Devis />} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <StudioHome />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/create"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <AuthenticatedLayout>
              <Pricing />
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
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
