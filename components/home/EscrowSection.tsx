import { Card } from "@/components/ui/Card";

const escrowSteps = [
  {
    title: "ادفع بأمان",
    description: "المبلغ محجوز في الضمان المالي",
  },
  {
    title: "استلم المنتج",
    description: "تستلم المنتج وتتحقق منه",
  },
  {
    title: "أكد الاستلام",
    description: "تأكد أن كل شيء مطابق",
  },
  {
    title: "يتم تحويل المبلغ",
    description: "تحويل المبلغ للبائع بأمان",
  },
];

export function EscrowSection() {
  return (
    <section className="app-container py-8">
      <div className="overflow-hidden rounded-2xl border border-secondary/25 bg-[linear-gradient(135deg,#fff8ed,#fffdf8)] p-5 shadow-[var(--shadow-soft)] md:p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary">
              كيف يعمل الضمان المالي؟
            </h2>
            <p className="mt-1 text-sm font-bold text-muted">
              حمايتك في كل خطوة من عملية الشراء
            </p>
          </div>
          <span className="rounded-full bg-secondary-soft px-4 py-2 text-xs font-black text-primary">
            ضمان مالي 100%
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {escrowSteps.map((step, index) => (
            <Card key={step.title} className="border-white bg-white p-5 text-center shadow-sm">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-secondary text-sm font-black text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-black text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
