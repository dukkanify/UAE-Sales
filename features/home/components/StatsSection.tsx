import type { HomeStat } from "@/types";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeStats } from "@/services/content";

type StatsSectionProps = {
  stats?: HomeStat[];
};

export async function StatsSection(props: StatsSectionProps = {}) {
  const items = props.stats ?? (await getHomeStats());

  return (
    <section className="bg-surface">
      <div className="app-container py-10">
        <div className="rounded-[var(--radius-2xl)] border border-border bg-[var(--color-background)] p-5 shadow-[var(--shadow-xs)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-surface p-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                  <Icon name={(stat.icon ?? "chart") as IconName} size={19} />
                </span>
                <div>
                  <p className="text-2xl font-black text-ink">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
