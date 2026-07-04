import type { HomeStat } from "@/types";
import { getHomeStats } from "@/services/content";

type StatsSectionProps = {
  stats?: HomeStat[];
};

export async function StatsSection(props: StatsSectionProps = {}) {
  const items = props.stats ?? (await getHomeStats());

  return (
    <section className="border-y border-border bg-surface">
      <div className="app-container section-padding">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold text-ink md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium tracking-wide text-muted uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
