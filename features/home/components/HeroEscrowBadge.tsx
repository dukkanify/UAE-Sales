import { Icon } from "@/shared/ui/Icon";

export function HeroEscrowBadge() {
  return (
    <div
      aria-hidden
      className="hero-float-slow absolute -bottom-2 end-4 z-30 hidden rounded-[var(--radius-2xl)] border border-secondary/25 bg-white/92 px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-md motion-reduce:animate-none lg:flex lg:end-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
          <Icon name="shield" size={20} />
        </span>
        <div>
          <p className="text-xs font-bold text-ink">ضمان مالي شامل</p>
          <p className="text-[0.65rem] font-medium text-muted">
            حماية كاملة لكل معاملة
          </p>
        </div>
      </div>
    </div>
  );
}
