import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { getListingSafetyTips } from "@/services/content";

export async function ListingSafetyTips() {
  const tips = await getListingSafetyTips();

  return (
    <Card className="mt-8 p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-[var(--radius-xl)] bg-accent-soft text-accent">
          <Icon name="shield" size={18} />
        </span>
        <h2 className="text-lg font-black text-ink">نصائح الأمان</h2>
      </div>
      <ul className="mt-4 grid gap-2">
        {tips.map((tip) => (
          <li
            key={tip}
            className="flex gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-muted"
          >
            <Icon className="mt-0.5 shrink-0 text-success" name="check" size={14} />
            {tip}
          </li>
        ))}
      </ul>
    </Card>
  );
}
