"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { PageHero } from "@/shared/ui/PageHero";
import { Card } from "@/shared/ui/Card";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import type { UserProfile } from "@/types";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { setSessionUser } from "@/services/storage";

type CompleteAccountContentProps = {
  token?: string;
};

export function CompleteAccountContent({ token }: CompleteAccountContentProps) {
  const router = useRouter();
  const [passwordError, setPasswordError] = useState("");

  const { error: submitError, isLoading, run: handleSubmit } = useAsyncAction(
    useCallback(
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token) {
          throw new Error("رابط إعداد الحساب غير صالح.");
        }

        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (password !== confirmPassword) {
          setPasswordError("كلمتا المرور غير متطابقتين.");
          return;
        }
        setPasswordError("");

        const response = await fetch("/api/complete-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, password, confirmPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message ?? "تعذر إعداد الحساب.");
        }

        setSessionUser(data.user as UserProfile);
        await persistSessionCookie(data.user);
        router.push(data.redirectTo ?? "/orders");
      },
      [router, token],
    ),
  );

  if (!token) {
    return (
      <section className="app-container page-padding">
        <FormMessage variant="error">
          رابط إعداد الحساب غير صالح. تحقق من بريدك الإلكتروني.
        </FormMessage>
      </section>
    );
  }

  return (
    <section className="app-container page-padding">
      <PageHero
        description="أنشئ كلمة مرور للوصول إلى حسابك ومتابعة طلباتك."
        eyebrow="إعداد الحساب"
        title="إنشاء كلمة مرور"
      />
      <Card className="mx-auto mt-6 max-w-md p-6" variant="flat">
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <Input
            autoComplete="new-password"
            error={passwordError}
            label="كلمة المرور"
            name="password"
            required
            type="password"
          />
          <Input
            autoComplete="new-password"
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            required
            type="password"
          />
          {submitError ? <FormMessage variant="error">{submitError}</FormMessage> : null}
          <Button fullWidth loading={isLoading} type="submit" variant="accent">
            حفظ كلمة المرور
          </Button>
        </form>
      </Card>
    </section>
  );
}
