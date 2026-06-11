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
  "حساب واحد لإدارة الإعلانات والمشتريات.",
  "جاهز لاحقاً لتسجيل الدخول عبر OTP وUAE PASS.",
  "مصمم لرحلات الضمان المالي والمحفظة.",
];

export function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  return (
    <section className="app-container grid gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-16">
      <div className="rounded-[var(--radius-xl)] bg-ink p-8 text-white shadow-[var(--shadow-card)]">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-lg font-black text-white">
            US
          </span>
          <span>
            <span className="block text-lg font-black">UAE Sales</span>
            <span className="block text-xs font-bold text-white/65">
              سوق الإمارات الآمن
            </span>
          </span>
        </Link>

        <h1 className="mt-10 text-3xl font-black leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl leading-9 text-white/72">{description}</p>

        <div className="mt-8 grid gap-3">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold"
            >
              <span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-white">
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
