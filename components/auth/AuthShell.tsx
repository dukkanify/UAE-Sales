import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  footerAction: {
    href: string;
    label: string;
    prompt: string;
  };
  title: string;
};

const trustPoints = [
  "ضمان مالي يحمي حقوق المشتري والبائع.",
  "حسابات موثقة وتجربة جاهزة لـ OTP وUAE PASS.",
  "إعلانات موثوقة داخل الإمارات مع تجربة استخدام آمنة.",
];

export function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  return (
    <section className="app-container grid gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-primary p-8 text-white shadow-[0_28px_90px_rgb(17_24_39/22%)]">
        <div className="uae-flag-strip absolute left-0 top-0 h-full w-3" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(200,164,93,0.28),transparent_22rem),linear-gradient(135deg,rgba(17,24,39,0.98),rgba(3,7,18,0.96))]" />
        <div className="uae-pattern absolute inset-0 opacity-35" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-white/10 text-lg font-black text-white shadow-[var(--shadow-soft)]">
              <span className="uae-flag-strip absolute inset-0" />
              <span className="relative rounded-xl bg-uae-black/90 px-2 py-1 text-xs">
                UAE
              </span>
            </span>
            <span>
              <span className="block text-lg font-black text-white">
                UAE Sales
              </span>
              <span className="block text-xs font-black text-secondary">
                سوق إماراتي بضمان آمن
              </span>
            </span>
          </Link>

          <h1 className="mt-10 text-4xl font-black leading-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base font-bold leading-9 text-white/88">
            {description}
          </p>

          <div className="mt-8 grid gap-3">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-white/16 bg-white/10 p-4 text-sm font-bold text-white backdrop-blur"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs text-primary shadow-[var(--shadow-glow)]">
                  ✓
                </span>
                <span className="leading-7">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="uae-flag-strip h-2 w-full" />
        <div className="p-6 md:p-8">
          {children}
          <div className="mt-6 grid gap-2 rounded-3xl bg-surface-muted p-4 text-xs font-black text-muted sm:grid-cols-3">
            <span>ضمان مالي</span>
            <span>حساب موثق</span>
            <span>سوق إماراتي</span>
          </div>
          <div className="mt-8 border-t border-border pt-5 text-center text-sm font-bold text-muted">
            {footerAction.prompt}{" "}
            <Link
              href={footerAction.href}
              className="text-primary transition hover:text-secondary"
            >
              {footerAction.label}
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}
