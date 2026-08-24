"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
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

const RESEND_DEFAULT_SECONDS = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, setUser } = useAuth();
  const lockedEmail = sanitizeEmail(searchParams.get("email") ?? "");
  const [email] = React.useState(lockedEmail);
  const [token, setToken] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(RESEND_DEFAULT_SECONDS);
  const [demoHint, setDemoHint] = React.useState<string | null>(null);
  const purpose = (searchParams.get("purpose") ?? "login") as
    "login" | "register" | "reset_password" | "verify_email";

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

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
      toast.success(
        purpose === "register" ? "Account verified — welcome aboard" : "Signed in successfully",
      );
      router.replace(result.data.redirectTo);
      void refresh();
    } finally {
      setPending(false);
    }
  };

  const onResend = async () => {
    if (purpose !== "register" || resendIn > 0 || !email) return;
    setResending(true);
    try {
      const result = await authFetch<{
        demoOtp?: string;
        resendAvailableInSeconds?: number;
      }>(routes.api.auth.resendOtp, {
        method: "POST",
        body: JSON.stringify({ email, purpose: "register" }),
      });
      if (!result.success) {
        toast.error(result.error ?? "Unable to resend code");
        return;
      }
      setToken("");
      setResendIn(result.data?.resendAvailableInSeconds ?? RESEND_DEFAULT_SECONDS);
      if (result.data?.demoOtp) {
        setDemoHint(result.data.demoOtp);
        toast.message(`Demo OTP: ${result.data.demoOtp}`);
      } else {
        setDemoHint(null);
        toast.success("A new verification code was sent");
      }
    } finally {
      setResending(false);
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
          readOnly
          aria-readonly="true"
          className="bg-muted/40"
        />
        {!email ? (
          <p className="text-xs text-destructive" role="alert">
            Missing email. Please restart from the registration page.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="token">One-time code</Label>
        <OtpInput
          value={token}
          onChange={setToken}
          disabled={pending || !email}
          aria-label="One-time verification code"
        />
        <input id="token" type="hidden" value={token} readOnly />
        {demoHint ? (
          <p className="text-xs text-muted-foreground">
            Demo mode code: <span className="font-medium text-foreground">{demoHint}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email. Codes expire after a few minutes.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending || token.length !== 6 || !email}>
        {pending ? "Verifying..." : "Verify and continue"}
      </Button>

      {purpose === "register" ? (
        <div className="text-center text-sm text-muted-foreground">
          {resendIn > 0 ? (
            <p>
              Resend available in <span className="font-medium text-foreground">{resendIn}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => void onResend()}
              disabled={resending}
              className="font-medium text-primary underline-offset-2 hover:underline disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}

export { VerifyOtpForm };
