import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const protectionSteps = [
  "يدفع المشتري عبر صفحة الدفع الآمنة.",
  "يُحجز المبلغ في الضمان المالي.",
  "يُحرَّر المبلغ للبائع بعد تأكيد الاستلام.",
];

export function EscrowProtectionCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-success-soft text-success">
          <Icon name="shield" size={18} />
        </span>
        <h2 className="text-base font-black text-ink">حماية الدفع</h2>
      </div>
      <p className="mt-3 text-sm font-medium leading-7 text-muted">
        كل معاملة محمية بنظام الضمان المالي لحماية حقوق الطرفين.
      </p>
      <ol className="mt-4 grid gap-2">
        {protectionSteps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-[var(--radius-md)] border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-ink"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary text-xs font-bold text-white">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Card>
  );
}
