"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { cn } from "@/lib/utils";
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
const EXPIRY_DEFAULT_SECONDS = 10 * 60;

type OtpPurpose =
  | "login"
  | "register"
  | "reset_password"
  | "verify_email"
  | "booking"
  | "change_email"
  | "two_factor"
  | "sensitive_action";

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
  const [expiresIn, setExpiresIn] = React.useState(EXPIRY_DEFAULT_SECONDS);
  const [shake, setShake] = React.useState(false);
  const [successFlash, setSuccessFlash] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const purpose = (searchParams.get("purpose") ?? "login") as OtpPurpose;
  const changeHref =
    purpose === "register"
      ? routes.register
      : purpose === "reset_password"
        ? routes.forgotPassword
        : routes.login;

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  React.useEffect(() => {
    if (expiresIn <= 0) return;
    const id = window.setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [expiresIn]);

  const triggerError = (message: string) => {
    setErrorMsg(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
    toast.error(message);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = verifyOtpSchema.safeParse({
      email: sanitizeEmail(email),
      token: token.trim(),
      purpose,
    });

    if (!parsed.success) {
      triggerError(parsed.error.issues[0]?.message ?? "Invalid code");
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
        setToken("");
        triggerError(result.error ?? "Verification failed");
        return;
      }

      setSuccessFlash(true);

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
    } catch {
      triggerError("Network error. Please retry.");
    } finally {
      setPending(false);
    }
  };

  const onResend = async () => {
    if (resendIn > 0 || !email) return;
    setResending(true);
    setErrorMsg(null);
    try {
      const result = await authFetch<{
        demoOtp?: string;
        resendAvailableInSeconds?: number;
        expiresInMinutes?: number;
      }>(routes.api.auth.resendOtp, {
        method: "POST",
        body: JSON.stringify({ email, purpose }),
      });
      if (!result.success) {
        triggerError(result.error ?? "Unable to resend code");
        return;
      }
      setToken("");
      setResendIn(result.data?.resendAvailableInSeconds ?? RESEND_DEFAULT_SECONDS);
      setExpiresIn((result.data?.expiresInMinutes ?? 10) * 60);
      // Never surface OTP codes in the UI — even in demo, prefer email/outbox only.
      toast.success("A new verification code was sent");
    } catch {
      triggerError("Network error. Please retry.");
    } finally {
      setResending(false);
    }
  };

  const expiryLabel = `${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, "0")}`;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
        <p className="text-xs text-muted-foreground">
          Not you?{" "}
          <Link
            href={changeHref}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Change email
          </Link>
        </p>
        {!email ? (
          <p className="text-xs text-destructive" role="alert">
            Missing email. Please restart verification from the beginning.
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="token">One-time code</Label>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              expiresIn <= 60 ? "text-destructive" : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            Expires in {expiryLabel}
          </span>
        </div>
        <div
          className={cn(
            "rounded-xl transition",
            shake && "translate-x-[-4px]",
            successFlash && "scale-[1.02]",
          )}
          style={
            shake
              ? {
                  animation: "otp-shake 0.4s ease-in-out",
                }
              : undefined
          }
        >
          <OtpInput
            value={token}
            onChange={(v) => {
              setToken(v);
              setErrorMsg(null);
            }}
            disabled={pending || !email || expiresIn <= 0}
            aria-label="One-time verification code"
            className={cn(errorMsg && "ring-2 ring-destructive/40 rounded-xl p-1")}
          />
        </div>
        <input id="token" type="hidden" value={token} readOnly />
        {errorMsg ? (
          <p className="text-xs text-destructive" role="alert">
            {errorMsg}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email. Codes are single-use.
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="hero-cta-primary w-full"
        disabled={pending || token.length !== 6 || !email || expiresIn <= 0}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </span>
        ) : (
          "Verify and continue"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {resendIn > 0 ? (
          <p>
            Resend available in <span className="font-medium text-foreground">{resendIn}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={resending || !email}
            className="font-medium text-primary underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resending ? "Sending…" : "Resend verification code"}
          </button>
        )}
      </div>
    </form>
  );
}

export { VerifyOtpForm };
