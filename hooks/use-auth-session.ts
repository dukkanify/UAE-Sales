"use client";

import { useAuth } from "@/providers/auth-provider";

export function useAuthSession() {
  const auth = useAuth();
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    permissions: auth.permissions,
    hasPermission: auth.hasPermission,
    signOut: auth.signOut,
    refresh: auth.refresh,
  };
}
