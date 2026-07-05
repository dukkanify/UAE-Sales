import { Card } from "@/shared/ui/Card";
import { ADD_LISTING_STEPS } from "./utils";

export function AddListingStepProgress() {
  return (
    <Card className="p-5" variant="flat">
      <div className="grid gap-3 sm:grid-cols-4">
        {ADD_LISTING_STEPS.map((step, index) => (
          <div
            key={step}
            className="rounded-[var(--radius-xl)] border border-border bg-surface-muted p-3"
          >
            <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-primary text-xs font-semibold text-white">
              {index + 1}
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{step}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
