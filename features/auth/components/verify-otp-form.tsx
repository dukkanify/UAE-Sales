"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import {
  collectDeviceFingerprint,
  describeDeviceFromUserAgent,
} from "@/lib/security/device-fingerprint";
import type { UserProfile } from "@/types";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, setUser } = useAuth();
  const [email, setEmail] = React.useState(searchParams.get("email") ?? "");
  const [token, setToken] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const purpose = (searchParams.get("purpose") ?? "login") as
    "login" | "register" | "reset_password" | "verify_email";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyOtpSchema.safeParse({
      email: sanitizeEmail(email),
      token: token.trim(),
      purpose,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setPending(true);
    try {
      const deviceFingerprint = await collectDeviceFingerprint();
      const deviceLabel =
        typeof navigator !== "undefined" ? describeDeviceFromUserAgent(navigator.userAgent) : null;

      const result = await authFetch<{
        user: UserProfile;
        redirectTo: string;
        requiresProfile: boolean;
      }>(routes.api.auth.verifyOtp, {
        method: "POST",
        body: JSON.stringify({
          ...parsed.data,
          deviceFingerprint,
          deviceLabel,
        }),
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Verification failed");
        return;
      }

      if (purpose === "reset_password") {
        toast.success("Code verified. Set your new password.");
        router.replace(result.data.redirectTo);
        return;
      }

      setUser(result.data.user);
      await refresh();
      toast.success("Signed in successfully");
      router.replace(result.data.redirectTo);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">One-time code</Label>
        <Input
          id="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
        <p className="text-xs text-muted-foreground">
          Demo mode uses code <span className="font-medium text-foreground">123456</span>
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying..." : "Verify and continue"}
      </Button>
    </form>
  );
}

export { VerifyOtpForm };
