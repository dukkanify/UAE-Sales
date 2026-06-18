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
    <section className="app-container py-12">
      <Card className="overflow-hidden p-8">
        <div className="uae-flag-strip mb-8 h-2 w-32 rounded-full" />
        <p className="text-sm font-black text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl leading-9 text-muted">{description}</p>
        <Link
          className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-black text-white"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </Card>
    </section>
  );
}
