import Link from "next/link";

const steps = [
  {
    description: "أنشئ حسابك في دقائق عبر البريد أو رقم الهاتف.",
    title: "سجّل حسابك",
  },
  {
    description: "اختر القسم، أضف الصور والتفاصيل، وانشر إعلانك.",
    title: "أضف إعلانك",
  },
  {
    description: "تواصل مع المشترين عبر الدردشة الآمنة.",
    title: "استقبل العروض",
  },
  {
    description: "أتمم البيع بضمان مالي يحمي الطرفين.",
    title: "بِع بثقة",
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="luxury-gradient overflow-hidden rounded-3xl p-8 text-white md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold text-secondary">كيف يعمل</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              أربع خطوات للبيع والشراء
            </h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              تجربة بسيطة وواضحة من التسجيل حتى إتمام المعاملة بأمان.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-sm font-black text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-secondary px-8 text-sm font-bold text-primary transition hover:-translate-y-px"
              href="/register"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
