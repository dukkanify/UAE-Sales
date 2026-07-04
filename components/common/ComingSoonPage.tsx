import { EmptyState } from "@/components/ui/EmptyState";

type ComingSoonPageProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  eyebrow: string;
  icon?: "wallet" | "shield" | "message" | "package" | "search";
  title: string;
};

export function ComingSoonPage({
  actionHref = "/",
  actionLabel = "العودة للرئيسية",
  description,
  eyebrow,
  icon = "package",
  title,
}: ComingSoonPageProps) {
  return (
    <section className="app-container page-padding">
      <EmptyState
        actionHref={actionHref}
        actionLabel={actionLabel}
        description={description}
        eyebrow={eyebrow}
        icon={icon}
        title={title}
      />
    </section>
  );
}
