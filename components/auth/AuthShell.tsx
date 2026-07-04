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
  "ضمان مالي يحمي كل معاملة",
  "تحقق عبر OTP وUAE PASS",
  "دعم احترافي على مدار الساعة",
];

export function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  return (
    <section className="app-container grid min-h-[calc(100vh-8rem)] gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className="luxury-gradient relative overflow-hidden rounded-3xl p-8 text-white md:p-10">
        <div className="uae-pattern absolute inset-0 opacity-20" />
        <div className="relative">
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-xs font-black backdrop-blur">
              UAE
            </span>
            <span className="text-lg font-black">UAE Sales</span>
          </Link>

          <h1 className="mt-10 text-3xl font-black leading-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-base leading-8 text-white/80">
            {description}
          </p>

          <div className="mt-8 grid gap-3">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold backdrop-blur"
              >
                <span className="text-secondary">✓</span>
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6 md:p-8" variant="elevated">
        {children}
        <div className="mt-8 border-t border-border pt-6 text-center text-sm font-medium text-muted">
          {footerAction.prompt}{" "}
          <Link
            className="font-bold text-primary transition hover:text-secondary"
            href={footerAction.href}
          >
            {footerAction.label}
          </Link>
        </div>
      </Card>
    </section>
  );
}
