import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type ComingSoonPageProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  eyebrow: string;
  icon?: "wallet" | "shield" | "message" | "package" | "search";
  title: string;
  children?: ReactNode;
};

export function ComingSoonPage({
  actionHref = "/",
  actionLabel = "العودة للرئيسية",
  children,
  description,
  eyebrow,
  icon = "package",
  title,
}: ComingSoonPageProps) {
  return (
    <section className="app-container page-padding">
      <Card className="mx-auto max-w-lg p-10 text-center" variant="elevated">
        <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-lg)] bg-surface-muted text-secondary">
          <Icon name={icon} size={24} />
        </span>
        <p className="mt-5 text-xs font-bold tracking-wide text-secondary uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">{title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-muted">
          {description}
        </p>
        {children}
        <Link className="mt-6 inline-block" href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      </Card>
    </section>
  );
}
