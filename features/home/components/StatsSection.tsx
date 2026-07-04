import type { HomeStat } from "@/types";
import { getHomeStats } from "@/services/content";

type StatsSectionProps = {
  stats?: HomeStat[];
};

export async function StatsSection(props: StatsSectionProps = {}) {
  const items = props.stats ?? (await getHomeStats());

  return (
    <section className="border-b border-border bg-surface">
      <div className="app-container px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((stat) => (
            <div key={stat.label} className="text-center lg:text-start">
              <p className="text-3xl font-black text-ink">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
