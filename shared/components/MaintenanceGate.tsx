"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/shared/constants/brand";
import { setGuestCheckoutOverride } from "@/shared/constants/feature-flags";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

const BYPASS_PREFIXES = ["/admin", "/login", "/api"];

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [maintenance, setMaintenance] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const settings = data?.settings;
        setMaintenance(Boolean(settings?.maintenanceMode));
        if (typeof settings?.allowGuestCheckout === "boolean") {
          setGuestCheckoutOverride(settings.allowGuestCheckout);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bypass = BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!ready || !maintenance || bypass) {
    return <LocalizedTree>{children}</LocalizedTree>;
  }

  return (
    <LocalizedTree>
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-bold tracking-wide text-primary">
        {BRAND.nameAr}
      </p>
      <h1 className="text-2xl font-bold text-ink">الموقع تحت الصيانة</h1>
      <p className="text-sm text-muted">
        نُجري تحسينات مؤقتة. يمكنك العودة بعد قليل، أو تسجيل الدخول إن كنت من
        فريق الإدارة.
      </p>
      <Link className="text-sm font-semibold text-primary" href="/login">
        تسجيل الدخول
      </Link>
    </main>
    </LocalizedTree>
  );
}
