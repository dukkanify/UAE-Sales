"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";

type ChatShellProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function ChatShell({ children, sidebar }: ChatShellProps) {
  return (
    <Suspense
      fallback={
        <section className="app-container page-padding">
          <Card className="p-8 text-center" variant="flat">
            <p className="text-sm font-medium text-muted">جاري التحميل...</p>
          </Card>
        </section>
      }
    >
      <ChatShellInner sidebar={sidebar}>{children}</ChatShellInner>
    </Suspense>
  );
}

function ChatShellInner({
  children,
  sidebar,
}: ChatShellProps) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        setDisplayUser(sessionUser);
        setIsAllowed(true);
        return;
      }

      const query = searchParams.toString();
      const returnPath = query ? `${pathname}?${query}` : pathname;
      router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchParams]);

  if (!isAllowed || !displayUser) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من الجلسة...</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container page-padding">
      <PageHero
        description="تواصل مع المشترين والبائعين بخصوص إعلاناتك النشطة."
        eyebrow="الرسائل"
        title="المحادثات"
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
        <div className="min-h-[28rem]">{children}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button href="/notifications" size="sm" variant="secondary">
          الإشعارات
        </Button>
        <Button href="/profile" size="sm" variant="ghost">
          الملف الشخصي
        </Button>
        <button
          className="text-sm font-medium text-muted transition hover:text-ink"
          onClick={() => {
            clearSessionUser();
            router.replace("/login");
          }}
          type="button"
        >
          تسجيل الخروج
        </button>
      </div>
    </section>
  );
}
