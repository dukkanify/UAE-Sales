"use client";

import * as React from "react";

import type { Permission } from "@/constants/permissions";
import type { AuthSession, UserProfile } from "@/types";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";

interface AuthContextValue extends AuthSession {
  setUser: (user: UserProfile | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
  initialPermissions?: Permission[];
}

function AuthProvider({
  children,
  initialUser = null,
  initialPermissions = [],
}: AuthProviderProps) {
  const [user, setUser] = React.useState<UserProfile | null>(initialUser);
  const [permissions, setPermissions] = React.useState<Permission[]>(initialPermissions);
  const [isLoading, setIsLoading] = React.useState(!initialUser);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authFetch<{
        user: UserProfile | null;
        permissions: Permission[];
        isAuthenticated: boolean;
      }>(routes.api.auth.me);
      if (result.success && result.data) {
        setUser(result.data.user);
        setPermissions(result.data.permissions ?? []);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await authFetch(routes.api.auth.logout, { method: "POST", body: "{}" });
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken: null,
      isAuthenticated: Boolean(user),
      permissions,
      setUser,
      refresh,
      signOut,
      isLoading,
      hasPermission: (permission: Permission) => permissions.includes(permission),
    }),
    [user, permissions, refresh, signOut, isLoading],
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
