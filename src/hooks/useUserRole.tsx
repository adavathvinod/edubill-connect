import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UseUserRoleReturn {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isAccountant: boolean;
  isStaff: boolean;
  hasAccess: (allowedRoles: AppRole[]) => boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === "admin";
  const isAccountant = role === "accountant";
  const isStaff = role === "staff";

  const hasAccess = (allowedRoles: AppRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    role,
    loading,
    isAdmin,
    isAccountant,
    isStaff,
    hasAccess,
  };
}
