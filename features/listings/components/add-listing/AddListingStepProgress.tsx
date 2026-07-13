import { Card } from "@/shared/ui/Card";
import { ADD_LISTING_STEPS } from "./utils";

export function AddListingStepProgress() {
  return (
    <Card className="p-3 sm:p-4" variant="flat">
      <ol aria-label="خطوات إضافة الإعلان" className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {ADD_LISTING_STEPS.map((step, index) => (
          <li
            key={step}
            className="flex min-w-0 flex-col items-center gap-1 rounded-[var(--radius-lg)] border border-border bg-surface-muted px-1 py-2 text-center sm:gap-1.5 sm:px-2 sm:py-2.5"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white sm:size-7 sm:text-xs">
              {index + 1}
            </span>
            <span className="w-full truncate text-[10px] font-semibold leading-tight text-ink sm:text-xs">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
