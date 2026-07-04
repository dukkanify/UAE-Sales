"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";

type OtpVerificationProps = {
  identifier: string;
  onBack: () => void;
  onVerified?: () => void;
};

export function OtpVerification({
  identifier,
  onBack,
  onVerified,
}: OtpVerificationProps) {
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-bold tracking-wide text-secondary uppercase">
          التحقق
        </p>
        <h2 className="mt-1 text-xl font-black text-ink">أدخل رمز OTP</h2>
        <p className="mt-2 text-sm font-medium text-muted">
          أرسلنا الرمز إلى{" "}
          <span className="font-bold text-ink">{identifier}</span>
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            aria-label={`رقم ${index + 1}`}
            className="focus-ring h-12 rounded-[var(--radius-md)] border border-border bg-surface text-center text-lg font-black text-ink shadow-[var(--shadow-xs)]"
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9]*"
            type="text"
          />
        ))}
      </div>

      <Button
        fullWidth
        onClick={() => {
          setStatusMessage("تم التحقق بنجاح.");
          onVerified?.();
        }}
        type="button"
        variant="primary"
      >
        تأكيد الرمز
      </Button>

      {statusMessage ? (
        <FormMessage variant="success">{statusMessage}</FormMessage>
      ) : null}

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
