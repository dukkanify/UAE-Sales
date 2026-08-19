import { EmptyState } from "@/shared/ui/EmptyState";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

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
<LocalizedTree>
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
  </LocalizedTree>
);
}
