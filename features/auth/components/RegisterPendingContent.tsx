"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountGatePath, isMarketplaceAccountReady } from "@/services/auth/account-access";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { getSessionUser, setSessionUser } from "@/services/storage";
import type { UserProfile } from "@/types";
import { Button } from "@/shared/ui/Button";

export function RegisterPendingContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    void fetch("/api/auth/me", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (data) => {
        if (cancelled) return;
        const nextUser = (data?.user as UserProfile | undefined) ?? session;
        setSessionUser(nextUser);
        await persistSessionCookie(nextUser);
        if (isMarketplaceAccountReady(nextUser)) {
          router.replace("/profile");
          return;
        }
        if (!nextUser.emailVerifiedAt) {
          router.replace(getAccountGatePath(nextUser));
          return;
        }
        setUser(nextUser);
      })
      .catch(() => {
        if (cancelled) return;
        if (isMarketplaceAccountReady(session)) {
          router.replace("/profile");
          return;
        }
        if (!session.emailVerifiedAt) {
          router.replace(getAccountGatePath(session));
          return;
        }
        setUser(session);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!user) {
    return <p className="text-sm text-muted">جاري تحميل حالة الحساب...</p>;
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="auth-form__eyebrow">حساب جديد</p>
        <h2 className="auth-form__title">تم التحقق منك</h2>
        <p className="auth-form__subtitle">
          أكملت التحقق من الشخص. حسابك في سوقنا بانتظار اعتماد سريع من الإدارة.
        </p>
      </div>

      <ol className="grid gap-3">
        <li className="rounded-[var(--radius-2xl)] border border-success/20 bg-success-soft p-4">
          <p className="text-sm font-black text-ink">1. التحقق من الشخص</p>
          <p className="mt-1 text-sm text-muted">تم تأكيد بريدك الإلكتروني بنجاح.</p>
        </li>
        <li className="rounded-[var(--radius-2xl)] border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm font-black text-ink">2. اعتماد الحساب</p>
          <p className="mt-1 text-sm text-muted">
            يعتمد الإدارة الحساب بضغطة واحدة. يصلك إشعار في حسابك فور التفعيل.
          </p>
        </li>
      </ol>

      <p className="text-sm text-muted" dir="ltr">
        {user.email}
      </p>

      <div className="grid gap-2">
        <Button href="/search" variant="primary">
          تصفّح الإعلانات
        </Button>
        <Button
          onClick={() => window.location.reload()}
          type="button"
          variant="secondary"
        >
          تحقّق من حالة الاعتماد
        </Button>
        <Link className="text-center text-sm font-semibold text-primary" href="/profile">
          الذهاب للملف الشخصي
        </Link>
      </div>
    </div>
  );
}
