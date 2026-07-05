"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { isValidDemoOtp } from "@/services/auth";

type OtpVerificationProps = {
  identifier: string;
  onBack: () => void;
  onVerified?: (code: string) => void | Promise<void>;
};

export function OtpVerification({
  identifier,
  onBack,
  onVerified,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [statusMessage, setStatusMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { error, isLoading, run: verifyOtp } = useAsyncAction(
    useCallback(async () => {
      const code = digits.join("");
      if (!isValidDemoOtp(code)) {
        setOtpError("رمز التحقق غير صحيح. استخدم 123456 للحسابات التجريبية.");
        return;
      }

      setOtpError("");
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setStatusMessage("تم التحقق بنجاح.");
      await onVerified?.(code);
    }, [digits, onVerified]),
  );

  function handleDigitChange(index: number, value: string) {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);
    setOtpError("");

    if (nextDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-secondary uppercase">
          التحقق
        </p>
        <h2 className="mt-1 text-xl font-black text-ink">أدخل رمز OTP</h2>
        <p className="mt-2 text-sm font-medium text-muted">
          أرسلنا الرمز إلى{" "}
          <span className="font-bold text-ink">{identifier}</span>
        </p>
        <p className="mt-1 text-xs font-medium text-muted">
          للحسابات التجريبية استخدم: <span className="font-bold text-ink">123456</span>
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2" dir="ltr" role="group" aria-label="رمز التحقق">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            aria-label={`رقم ${index + 1}`}
            className="focus-ring h-12 rounded-[var(--radius-xl)] border border-border bg-surface text-center text-lg font-semibold text-ink shadow-[var(--shadow-xs)]"
            inputMode="numeric"
            maxLength={1}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
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

      {statusMessage ? (
        <FormMessage variant="success">{statusMessage}</FormMessage>
      ) : null}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      <div className="flex items-center justify-between text-sm font-medium">
        <button
          className="text-primary"
          onClick={() => setStatusMessage("تم إرسال رمز جديد.")}
          type="button"
        >
          إعادة الإرسال
        </button>
        <button
          className="text-muted transition hover:text-ink"
          onClick={onBack}
          type="button"
        >
          تعديل البيانات
        </button>
      </div>
    </div>
  );
}
