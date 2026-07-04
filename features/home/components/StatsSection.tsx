import type { HomeStat } from "@/types";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeStats } from "@/services/content";

type StatsSectionProps = {
  stats?: HomeStat[];
};

export async function StatsSection(props: StatsSectionProps = {}) {
  const items = props.stats ?? (await getHomeStats());

  return (
    <section className="relative overflow-hidden pt-14 sm:pt-16 lg:pt-20">
      <SectionBackdrop variant="warm" />

      <div className="app-container relative section-padding">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((stat) => (
            <div
              key={stat.label}
              className="glass-stat-card interactive-lift rounded-[var(--radius-2xl)] p-5 text-center"
            >
              <span className="mx-auto grid size-11 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <Icon name={(stat.icon ?? "chart") as IconName} size={20} />
              </span>
              <p className="mt-4 text-2xl font-black text-ink md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-bold tracking-wide text-muted uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
