import { Card } from "@/components/ui/Card";

const protectionSteps = [
  "يدفع المشتري قيمة المنتج عبر صفحة الدفع.",
  "يتم حجز المبلغ في الضمان المالي حتى تأكيد الاستلام.",
  "يتم تحرير المبلغ للبائع عند تأكيد مطابقة المنتج.",
];

export function EscrowProtectionCard() {
  return (
    <Card className="overflow-hidden p-6">
      <div className="uae-flag-strip -mx-6 -mt-6 mb-6 h-2" />
      <h2 className="text-xl font-black text-ink">حماية الدفع</h2>
      <p className="mt-3 leading-8 text-muted">
        هذه الواجهة جاهزة لربط رحلة الشراء مع نظام الضمان المالي والمحفظة في
        المراحل القادمة.
      </p>
      <ol className="mt-5 grid gap-3">
        {protectionSteps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-2xl border border-secondary/30 bg-secondary-soft p-4 text-sm font-bold text-primary"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
