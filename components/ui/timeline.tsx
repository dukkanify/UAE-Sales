import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: "default" | "success" | "warning" | "danger";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusColor: Record<NonNullable<TimelineItem["status"]>, string> = {
  default: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-6 border-s border-border ms-3", className)}>
      {items.map((item) => (
        <li key={item.id} className="ms-6">
          <span
            className={cn(
              "absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-background",
              statusColor[item.status ?? "default"],
            )}
          />
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              {item.timestamp ? (
                <time className="text-xs text-muted-foreground">{item.timestamp}</time>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export { Timeline };
