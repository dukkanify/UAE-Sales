"use client";

import { useCallback, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { getSessionSnapshot } from "@/services/storage/external-store";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { setSessionUser } from "@/services/storage";
import { trackAuthEventClient } from "@/services/analytics/auth-events";

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function SecuritySettingsPanel() {
  const user = getSessionSnapshot();
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { isLoading, run: requestOtp } = useAsyncAction(
    useCallback(async () => {
      setError("");
      const response = await fetch("/api/auth/password/set/request-otp", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("تعذر إرسال رمز التحقق.");
      }
      setOtpRequested(true);
      setMessage("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
    }, []),
  );

  const { isLoading: isSaving, run: savePassword } = useAsyncAction(
    useCallback(async () => {
      setError("");
      setMessage("");
      if (otpCode.length !== 6) {
        setError("أدخل رمز التحقق المكوّن من 6 أرقام.");
        return;
      }
      if (!isStrongPassword(password)) {
        setError("كلمة المرور ضعيفة.");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمة المرور وتأكيدها غير متطابقين.");
        return;
      }

      const response = await fetch("/api/auth/password/set/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: otpCode, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "تعذر حفظ كلمة المرور.");
        return;
      }

      if (data.user) {
        setSessionUser(data.user);
        await persistSessionCookie(data.user);
      }
      trackAuthEventClient("password_added");
      setMessage("تم حفظ كلمة المرور بنجاح.");
      setOtpCode("");
      setPassword("");
      setConfirmPassword("");
      setOtpRequested(false);
    }, [confirmPassword, otpCode, password]),
  );

  if (!user) return null;

  return (
    <Card className="p-6" variant="flat">
      <h3 className="text-lg font-black text-ink">الأمان</h3>
      <p className="mt-2 text-sm text-muted">
        {user.hasPassword
          ? "يمكنك تسجيل الدخول بالبريد الإلكتروني أو كلمة المرور."
          : "كلمة المرور اختيارية. يمكنك إضافتها لتسجيل دخول أسرع."}
      </p>

      {message ? <FormMessage variant="success">{message}</FormMessage> : null}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {!otpRequested ? (
        <Button className="mt-4" loading={isLoading} onClick={requestOtp} type="button">
          {user.hasPassword ? "تغيير كلمة المرور" : "إضافة كلمة مرور"}
        </Button>
      ) : (
        <div className="mt-4 grid gap-3">
          <Input
            label="رمز التحقق"
            maxLength={6}
            onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            value={otpCode}
          />
          <Input
            autoComplete="new-password"
            label="كلمة المرور"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <Input
            autoComplete="new-password"
            label="تأكيد كلمة المرور"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
          <Button loading={isSaving} onClick={savePassword} type="button">
            حفظ كلمة المرور
          </Button>
        </div>
      )}
    </Card>
  );
}
