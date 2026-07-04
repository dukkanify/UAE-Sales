import { Icon } from "@/shared/ui/Icon";

export function HeroDeviceMockup() {
  return (
    <div
      aria-hidden
      className="hero-device-mockup relative mx-auto w-[10.5rem] sm:w-[11.5rem]"
    >
      <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-white/30 bg-primary p-2 shadow-[var(--shadow-xl)]">
        <div className="absolute start-1/2 top-2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/20" />

        <div className="overflow-hidden rounded-[1.5rem] bg-surface">
          <div className="flex items-center justify-between bg-primary px-3 py-2.5">
            <span className="text-[0.55rem] font-bold text-white">UAE Sales</span>
            <div className="flex gap-1">
              <span className="grid size-4 place-items-center rounded-full bg-white/15">
                <Icon className="text-white" name="bell" size={8} />
              </span>
              <span className="grid size-4 place-items-center rounded-full bg-white/15">
                <Icon className="text-white" name="heart" size={8} />
              </span>
            </div>
          </div>

          <div className="space-y-2 p-2.5">
            <div className="h-14 overflow-hidden rounded-xl bg-gradient-to-br from-secondary-soft to-surface-muted">
              <div className="flex h-full items-end p-2">
                <span className="text-[0.5rem] font-bold text-ink">إعلانات مميزة</span>
              </div>
            </div>

            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex gap-2 rounded-xl border border-border/70 bg-surface p-1.5 shadow-[var(--shadow-xs)]"
              >
                <div className="size-10 shrink-0 rounded-lg bg-surface-muted" />
                <div className="min-w-0 flex-1 space-y-1 py-0.5">
                  <div className="h-1.5 w-full rounded-full bg-surface-muted" />
                  <div className="h-1.5 w-2/3 rounded-full bg-secondary/30" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-around border-t border-border bg-surface px-2 py-2">
            {(["home", "search", "plus", "message", "user"] as const).map((icon) => (
              <span
                key={icon}
                className={`grid size-5 place-items-center rounded-md ${
                  icon === "home" ? "bg-secondary-soft text-secondary" : "text-muted"
                }`}
              >
                <Icon name={icon === "search" ? "search" : icon} size={10} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -end-3 top-1/4 z-20 rounded-2xl border border-secondary/30 bg-white/95 px-3 py-2 shadow-[var(--shadow-lg)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-xl bg-success-soft text-success">
            <Icon name="shield" size={14} />
          </span>
          <div>
            <p className="text-[0.55rem] font-bold text-ink">ضمان مالي</p>
            <p className="text-[0.5rem] font-medium text-muted">محمي 100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
