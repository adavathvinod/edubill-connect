import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleBasedRoute } from "@/components/layout/RoleBasedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Fees from "./pages/Fees";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            {/* Dashboard - All roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Students - All roles can view */}
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            {/* Fee Structure - Admin and Accountant only */}
            <Route
              path="/fees"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin", "accountant"]}>
                    <Fees />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            {/* Invoices - Admin and Accountant can manage */}
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            {/* Payments - Admin and Accountant only */}
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin", "accountant"]}>
                    <Payments />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            {/* Reports - Admin and Accountant only */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin", "accountant"]}>
                    <Reports />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            {/* Settings - Admin only */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <Settings />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
