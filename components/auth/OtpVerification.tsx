"use client";

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
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-bold text-primary">التحقق بخطوتين</p>
        <h2 className="mt-2 text-2xl font-black text-ink">أدخل رمز OTP</h2>
        <p className="mt-3 leading-8 text-muted">
          واجهة جاهزة للربط لاحقاً. سيتم إرسال الرمز إلى:
          <span className="mx-1 font-black text-ink">{identifier}</span>
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            aria-label={`OTP digit ${index + 1}`}
            className="focus-ring h-14 rounded-2xl border border-border bg-white text-center text-xl font-black text-ink"
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9]*"
            type="text"
          />
        ))}
      </div>

      <button
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
        onClick={onVerified}
        type="button"
      >
        تأكيد الرمز
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-muted">
        <button className="text-primary" type="button">
          إعادة إرسال الرمز
        </button>
        <button
          className="text-muted transition hover:text-primary"
          onClick={onBack}
          type="button"
        >
          تعديل البيانات
        </button>
      </div>
    </div>
  );
}
