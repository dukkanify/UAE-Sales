"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "@/components/ui/app-link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signOut } = useAuth();
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const switching = searchParams.get("switch") === "1";

  React.useEffect(() => {
    if (!switching || isLoading || !user) return;
    // #region agent log
    void fetch("/api/public/__debug_log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        hypothesisId: "B",
        location: "login-form.tsx:switchSignOut",
        message: "login?switch=1 forcing signOut of existing user",
        data: { userId: user.id, email: user.email, role: user.role },
        timestamp: Date.now(),
      }),
    }).catch(() => undefined);
    // #endregion
    void signOut();
  }, [switching, isLoading, user, signOut]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({
      email: sanitizeEmail(email),
      rememberMe,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setPending(true);
    try {
      if (user) {
        // #region agent log
        void fetch("/api/public/__debug_log", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            hypothesisId: "A",
            location: "login-form.tsx:preOtpSignOut",
            message: "signing out before student OTP request",
            data: {
              priorUserId: user.id,
              priorEmail: user.email,
              priorRole: user.role,
              loginEmail: parsed.data.email,
              switching,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => undefined);
        // #endregion
        await signOut();
      }
      const result = await authFetch<{ email: string; demoOtp?: string }>(
        routes.api.auth.requestOtp,
        {
          method: "POST",
          body: JSON.stringify({ ...parsed.data, purpose: "login" }),
        },
      );

      if (!result.success) {
        toast.error(result.error ?? "Unable to send OTP");
        return;
      }

      if (result.data?.demoOtp) {
        toast.message(`Demo OTP: ${result.data.demoOtp}`);
      } else {
        toast.success("Check your email for a one-time code");
      }

      const params = new URLSearchParams({
        email: parsed.data.email,
        purpose: "login",
      });
      router.push(`${routes.verifyOtp}?${params.toString()}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {switching ? (
        <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Switching accounts — sign in with the student, instructor, or admin email you want.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
        Remember me for 30 days
      </label>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code..." : "Continue with email"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.forgotPassword} className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        <Link href={`${routes.login}?switch=1`} className="text-primary hover:underline">
          Use a different account
        </Link>
      </p>
    </form>
  );
}

export { LoginForm };
