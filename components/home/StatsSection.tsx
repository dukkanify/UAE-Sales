const stats = [
  { label: "إعلان نشط", value: "24,000+" },
  { label: "مستخدم موثق", value: "18,500+" },
  { label: "معاملة آمنة", value: "12,000+" },
  { label: "تقييم المستخدمين", value: "4.9/5" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="app-container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-ink md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-bold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
