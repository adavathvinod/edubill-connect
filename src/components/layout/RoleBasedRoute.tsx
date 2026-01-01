import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleBasedRouteProps) {
  const { role, loading, hasAccess } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!role || !hasAccess(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
