import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { getAuthTrustPoints } from "@/services/content";

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

export async function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  const trustPoints = await getAuthTrustPoints();

  return (
    <section className="app-container page-padding grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-2 lg:items-center">
      <div className="luxury-gradient relative overflow-hidden rounded-[var(--radius-2xl)] p-8 text-white md:p-10">
        <div className="relative">
          <BrandLogo showTagline={false} size="md" theme="dark" />

          <h1 className="mt-10 text-3xl font-black leading-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-base font-medium leading-8 text-white/80">
            {description}
          </p>

          <div className="mt-8 grid gap-3">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium backdrop-blur"
              >
                <Icon className="text-secondary" name="check" size={16} />
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
            className="font-semibold text-primary transition hover:text-secondary"
            href={footerAction.href}
          >
            {footerAction.label}
          </Link>
        </div>
      </Card>
    </section>
  );
}
