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
  "تجربة مصممة للسوق الإماراتي من البداية.",
  "جاهز لاحقاً لتسجيل الدخول عبر OTP وUAE PASS.",
  "ضمان مالي ومحفظة تناسب البيع والشراء داخل الإمارات.",
];

export function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  return (
    <section className="app-container grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
      <div className="luxury-gradient uae-pattern relative overflow-hidden rounded-[var(--radius-xl)] p-8 text-white shadow-[var(--shadow-glow)]">
        <div className="uae-flag-strip absolute left-0 top-0 h-full w-3" />
        <div className="absolute -left-20 top-10 size-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/25 blur-3xl" />
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-white/10 text-lg font-black text-white shadow-[var(--shadow-soft)]">
            <span className="uae-flag-strip absolute inset-0" />
            <span className="relative rounded-xl bg-uae-black/80 px-2 py-1 text-xs">
              UAE
            </span>
          </span>
          <span>
            <span className="block text-lg font-black">UAE Sales</span>
            <span className="block text-xs font-bold text-white/65">
              هوية إماراتية وتجربة آمنة
            </span>
          </span>
        </Link>

        <h1 className="relative mt-10 text-3xl font-black leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="relative mt-5 max-w-xl leading-9 text-white/72">
          {description}
        </p>

        <div className="relative mt-8 grid gap-3">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold backdrop-blur"
            >
              <span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-white shadow-[var(--shadow-glow)]">
                ✓
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6 md:p-8">
        {children}
        <div className="mt-8 border-t border-border pt-5 text-center text-sm font-bold text-muted">
          {footerAction.prompt}{" "}
          <Link
            href={footerAction.href}
            className="text-primary transition hover:text-primary-dark"
          >
            {footerAction.label}
          </Link>
        </div>
      </Card>
    </section>
  );
}
