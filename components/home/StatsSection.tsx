const stats = [
  { label: "إعلان نشط", value: "24,000+" },
  { label: "مستخدم موثق", value: "18,500+" },
  { label: "معاملة آمنة", value: "12,000+" },
  { label: "تقييم المستخدمين", value: "4.9" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="app-container py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-ink md:text-3xl">
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
