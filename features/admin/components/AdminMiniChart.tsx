"use client";

type AdminMiniChartProps = {
  color?: string;
  data: { label: string; value: number }[];
  title: string;
};

export function AdminMiniChart({
  color = "var(--color-primary)",
  data,
  title,
}: AdminMiniChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-4 flex h-36 items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[var(--radius-lg)] transition-all"
              style={{
                background: `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 55%, transparent) 100%)`,
                height: `${Math.max(12, (item.value / max) * 100)}%`,
              }}
              title={`${item.value}`}
            />
            <span className="text-[10px] font-medium text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
