import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ProfileRing from "@/components/ProfileRing";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudioHome from "./pages/StudioHome";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
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
          <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border px-5 py-3 flex items-center gap-3">
            <SidebarTrigger />
            <h1 className="text-sm font-display tracking-tight">
              <span className="text-gradient-primary">cauris</span>
              <span className="text-foreground">.ai</span>
            </h1>
            <div className="ml-auto">
              <ProfileRing />
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isPublic = location.pathname === "/" || location.pathname === "/auth";

  return (
    <div className="dark min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
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
          path="/community"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Community />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
