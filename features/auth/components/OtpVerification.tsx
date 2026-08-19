"use client";

import type { OtpPurpose } from "@/types/domain/otp";
import type { UserProfile } from "@/types";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { maskEmail } from "@/shared/utils/mask-email";
import { trackAuthEventClient } from "@/services/analytics/auth-events";
import { useToast } from "@/shared/components/ToastProvider";
import { isDemoOtpClientEnabled } from "@/shared/constants/feature-flags";
import {
  clearOtpFallback,
  readOtpFallback,
  saveOtpFallback,
  subscribeOtpFallback,
} from "@/features/auth/lib/otp-fallback";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type OtpVerificationProps = {
  email: string;
  emailDeliveryFailed?: boolean;
  fullName?: string;
  initialOtp?: string | null;
  maskedEmail?: string;
  nextPath?: string;
  onBack: () => void;
  onVerified?: (data?: {
    approved?: boolean;
    metadata?: Record<string, string>;
    ok?: boolean;
    redirectTo?: string;
    resetToken?: string;
    user?: UserProfile;
  }) => void | Promise<void>;
  purpose: OtpPurpose;
  verifyEndpoint?: string;
};

const COOLDOWN_SECONDS = 60;

function normalizeOtp(value: string | null | undefined): string | null {
  if (!value || !/^\d{6}$/.test(value)) return null;
  return value;
}

const DEFAULT_VERIFY_ENDPOINTS: Partial<Record<OtpPurpose, string>> = {
  REGISTER: "/api/auth/register/verify-otp",
  LOGIN: "/api/auth/login/verify-otp",
  PASSWORD_RESET: "/api/auth/password/reset/verify-otp",
  SET_PASSWORD: "/api/auth/password/set/verify-otp",
};

export function OtpVerification({
  email,
  emailDeliveryFailed = false,
  fullName,
  initialOtp = null,
  maskedEmail,
  nextPath,
  onBack,
  onVerified,
  purpose,
  verifyEndpoint,
}: OtpVerificationProps) {
  const { showToast } = useToast();
  const demoOtpEnabled = isDemoOtpClientEnabled();
  const serverOtp = demoOtpEnabled ? normalizeOtp(initialOtp) : null;
  const storedOtp = useSyncExternalStore(
    subscribeOtpFallback,
    () => (demoOtpEnabled ? readOtpFallback(email) ?? serverOtp : null),
    () => serverOtp,
  );
  const fallbackOtp = demoOtpEnabled ? storedOtp ?? serverOtp : null;
  const [digits, setDigits] = useState(() =>
    serverOtp ? serverOtp.split("") : ["", "", "", "", "", ""],
  );
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const autoSubmittedRef = useRef(serverOtp ?? "");
  const toastedRef = useRef(false);
  const displayEmail = maskedEmail ?? maskEmail(email);
  const endpoint = verifyEndpoint ?? DEFAULT_VERIFY_ENDPOINTS[purpose] ?? "/api/auth/otp/verify";

  useEffect(() => {
    if (demoOtpEnabled && serverOtp) saveOtpFallback(email, serverOtp);
  }, [demoOtpEnabled, email, serverOtp]);

  useEffect(() => {
    if (!demoOtpEnabled || !fallbackOtp || toastedRef.current) return;
    toastedRef.current = true;
    showToast(`رمز التحقق: ${fallbackOtp}`);
  }, [demoOtpEnabled, fallbackOtp, showToast]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const { error, isLoading, run: verifyOtp } = useAsyncAction(
    useCallback(async () => {
      const code = digits.join("");
      if (code.length !== 6) {
        setOtpError("أدخل رمز التحقق المكوّن من 6 أرقام.");
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code, purpose, next: nextPath }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "SESSION_FAILED") {
          setOtpError(data.message ?? "تعذر إنشاء الجلسة. يرجى المحاولة مرة أخرى.");
          return;
        }
        const attempts =
          typeof data.attemptsRemaining === "number"
            ? ` (المحاولات المتبقية: ${data.attemptsRemaining})`
            : "";
        setOtpError(`${data.message ?? "رمز التحقق غير صحيح."}${attempts}`);
        return;
      }

      setOtpError("");
      clearOtpFallback();
      await onVerified?.(data);
    }, [digits, email, endpoint, nextPath, onVerified, purpose]),
  );

  useEffect(() => {
    if (purpose === "SET_PASSWORD") return;
    const code = digits.join("");
    if (code.length !== 6 || isLoading) return;
    if (autoSubmittedRef.current === code) return;
    autoSubmittedRef.current = code;
    void verifyOtp();
  }, [digits, isLoading, purpose, verifyOtp]);

  const { isLoading: isResending, run: resendOtp } = useAsyncAction(
    useCallback(async () => {
      if (cooldown > 0) return;
      const response = await fetch("/api/auth/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, purpose, fullName }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 503 || data.error === "EMAIL_SEND_FAILED") {
          setOtpError(data.message ?? "تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.");
          return;
        }
        if (response.status === 429 && data.retryAfterSeconds) {
          const waitMsg = data.message
            ? String(data.message)
            : "\u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631 " +
              String(data.retryAfterSeconds) +
              " \u062b\u0627\u0646\u064a\u0629 \u0642\u0628\u0644 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644.";
          setOtpError(waitMsg);
          setCooldown(data.retryAfterSeconds);
          return;
        }
        setOtpError("تعذر إعادة إرسال الرمز. حاول لاحقًا.");
        return;
      }
      setCooldown(COOLDOWN_SECONDS);
      setOtpError("");
      if (data.emailDelivered === false) {
        setOtpError(
          data.message ?? "تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.",
        );
      }
      if (demoOtpEnabled && typeof data.otp === "string" && /^\d{6}$/.test(data.otp)) {
        saveOtpFallback(email, data.otp);
        toastedRef.current = false;
        autoSubmittedRef.current = data.otp;
        setDigits(data.otp.split(""));
      }
      trackAuthEventClient("otp_resend", { purpose });
    }, [cooldown, demoOtpEnabled, email, fullName, purpose]),
  );

  function applyDigits(nextDigits: string[]) {
    setDigits(nextDigits);
    setOtpError("");
    autoSubmittedRef.current = "";
  }

  function handleDigitChange(index: number, value: string) {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    applyDigits(nextDigits);

    if (nextDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = [...digits];
    for (let i = 0; i < 6; i += 1) {
      nextDigits[i] = pasted[i] ?? "";
    }
    applyDigits(nextDigits);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <LocalizedTree>
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-secondary uppercase">
          {purpose === "REGISTER" ? "التحقق من الشخص" : "التحقق بالبريد الإلكتروني"}
        </p>
        <h2 className="mt-1 text-xl font-black text-ink">أدخل رمز التحقق</h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {purpose === "REGISTER"
            ? fallbackOtp
              ? "البريد قد يتأخر. الرمز ظاهر أدناه — أدخله أو اضغط تأكيد."
              : "أرسلنا رمزًا مكوّنًا من 6 أرقام. بعد التحقق يُعتمد حسابك بسهولة."
            : "أرسلنا رمز تحقق مكوّنًا من 6 أرقام إلى بريدك الإلكتروني"}
        </p>
        <p className="mt-1 text-sm font-bold text-ink" dir="ltr">
          {displayEmail}
        </p>
        {fallbackOtp ? (
          <div className="auth-otp-fallback">
            <p className="auth-otp-fallback__label">رمز التحقق — البريد قد لا يصل</p>
            <p className="auth-otp-fallback__code" dir="ltr">
              {fallbackOtp}
            </p>
            <p className="auth-otp-fallback__hint">
              استخدم هذا الرمز الآن لإكمال التحقق. لا تنتظر رسالة البريد.
            </p>
            <button
              className="auth-otp-fallback__fill"
              onClick={() => {
                autoSubmittedRef.current = fallbackOtp;
                setDigits(fallbackOtp.split(""));
                setOtpError("");
              }}
              type="button"
            >
              تعبئة الرمز
            </button>
          </div>
        ) : null}
      </div>

      {emailDeliveryFailed ? (
        <FormMessage variant="error">
          تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.
        </FormMessage>
      ) : null}

      <div className="grid grid-cols-6 gap-2" dir="ltr" role="group" aria-label="رمز التحقق">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            aria-label={`رقم ${index + 1}`}
            autoComplete="one-time-code"
            className="focus-ring h-12 rounded-[var(--radius-xl)] border border-border bg-surface text-center text-lg font-semibold text-ink shadow-[var(--shadow-xs)]"
            inputMode="numeric"
            maxLength={1}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={handlePaste}
            pattern="[0-9]*"
            type="text"
            value={digit}
          />
        ))}
      </div>

      {otpError ? <FormMessage variant="error">{otpError}</FormMessage> : null}

      <Button
        fullWidth
        loading={isLoading}
        onClick={verifyOtp}
        type="button"
        variant="primary"
      >
        تأكيد الرمز
      </Button>

      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      <div className="flex items-center justify-between text-sm font-medium">
        <button
          className="text-primary disabled:opacity-50"
          disabled={cooldown > 0 || isResending}
          onClick={resendOtp}
          type="button"
        >
          {cooldown > 0 ? `إعادة الإرسال خلال ${cooldown}ث` : "إعادة إرسال الرمز"}
        </button>
        <button
          className="text-muted transition hover:text-ink"
          onClick={onBack}
          type="button"
        >
          تغيير البريد الإلكتروني
        </button>
      </div>
    </div>
    </LocalizedTree>
  );
}
