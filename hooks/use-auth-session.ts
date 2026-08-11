"use client";

import { useAuth } from "@/providers/auth-provider";

/**
 * Convenience hook for authentication state.
 */
export function useAuthSession() {
  const auth = useAuth();
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    signOut: auth.signOut,
  };
}
