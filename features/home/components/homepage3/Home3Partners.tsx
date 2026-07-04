const partners = [
  "Emirates ID",
  "UAE PASS",
  "Dubai SME",
  "ADGM",
  "Etihad",
  "Property Network",
];

export function Home3Partners() {
  return (
    <section className="bg-white py-24">
      <div className="app-container">
        <div className="rounded-[2.5rem] border border-border bg-[#fffbf4] p-8 shadow-[var(--shadow-card)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-black tracking-[0.24em] text-secondary uppercase">
                Partners
              </p>
              <h2 className="mt-3 text-3xl font-black text-ink">
                جاهز لمنظومة أعمال إماراتية
              </h2>
              <p className="mt-3 text-sm font-medium leading-7 text-muted">
                مساحة للشركاء، مزودي الدفع، التحقق، والخدمات المهنية التي تدعم
                تجربة سوق موثوقة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner}
                  className="grid min-h-24 place-items-center rounded-[1.5rem] border border-border bg-white px-4 text-center text-sm font-black text-muted shadow-[var(--shadow-xs)]"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
