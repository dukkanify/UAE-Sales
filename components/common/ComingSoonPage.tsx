import Link from "next/link";
import { Card } from "@/components/ui/Card";

type ComingSoonPageProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  eyebrow: string;
  title: string;
};

export function ComingSoonPage({
  actionHref = "/",
  actionLabel = "العودة للرئيسية",
  description,
  eyebrow,
  title,
}: ComingSoonPageProps) {
  return (
    <section className="app-container section-padding">
      <Card className="mx-auto max-w-2xl p-10 text-center" variant="elevated">
        <p className="text-sm font-bold text-secondary">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-ink md:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-8 text-muted">
          {description}
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:-translate-y-px"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </Card>
    </section>
  );
}
