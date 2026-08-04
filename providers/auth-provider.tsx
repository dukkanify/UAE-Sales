"use client";

import * as React from "react";

import type { AuthSession, UserProfile } from "@/types";

interface AuthContextValue extends AuthSession {
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = React.useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken: null,
      isAuthenticated: Boolean(user),
      setUser,
      signOut,
      isLoading,
    }),
    [user, signOut, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
