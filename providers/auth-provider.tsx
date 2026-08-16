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
  const hasResolvedRef = React.useRef(Boolean(initialUser));

  const refresh = React.useCallback(async () => {
    // Avoid full-screen blocking on background revalidation
    if (!hasResolvedRef.current) setIsLoading(true);
    try {
      const result = await authFetch<{
        user: UserProfile | null;
        permissions: Permission[];
        isAuthenticated: boolean;
      }>(routes.api.auth.me);
      // #region agent log
      void fetch("/api/public/__debug_log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hypothesisId: "D",
          location: "auth-provider.tsx:refresh",
          message: "AuthProvider.refresh /api/auth/me result",
          data: {
            success: result.success,
            userId: result.data?.user?.id ?? null,
            email: result.data?.user?.email ?? null,
            role: result.data?.user?.role ?? null,
            hadResolvedBefore: hasResolvedRef.current,
            prevUserId: null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => undefined);
      // #endregion
      if (result.success && result.data) {
        setUser(result.data.user);
        setPermissions(result.data.permissions ?? []);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } finally {
      hasResolvedRef.current = true;
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
