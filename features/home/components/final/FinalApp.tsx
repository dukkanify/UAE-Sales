import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

function PhoneMockup() {
  return (
    <div className="w-44 rounded-[1.75rem] border-[4px] border-ink bg-ink p-1.5 shadow-[var(--shadow-lg)] sm:w-48">
      <div className="overflow-hidden rounded-[1.35rem] bg-white">
        <div className="bg-ink px-4 py-2.5">
          <div className="flex items-center justify-between text-white">
            <span className="text-[0.65rem] font-bold">UAE Sales</span>
            <Icon name="bell" size={12} />
          </div>
        </div>
        <div className="space-y-2.5 p-3">
          <div className="rounded-[var(--radius-lg)] bg-surface-muted p-2.5">
            <p className="text-[0.6rem] font-bold text-ink">بحث في السوق</p>
            <div className="mt-1.5 h-1.5 rounded-full bg-border" />
          </div>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-2 rounded-[var(--radius-lg)] border border-border p-2"
            >
              <div className="size-8 rounded-[var(--radius-md)] bg-surface-muted" />
              <div className="flex-1 space-y-1 py-0.5">
                <div className="h-1 rounded-full bg-surface-muted" />
                <div className="h-1 w-2/3 rounded-full bg-secondary/25" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinalApp() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="app-container">
        <div className="grid items-center gap-10 rounded-[var(--radius-2xl)] border border-border bg-surface-muted/40 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs font-semibold text-secondary">قريباً</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              تطبيق UAE Sales للجوال
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted md:text-base">
              ابحث، تواصل، وأدر إعلاناتك من أي مكان. التطبيق قادم قريباً مع
              دعم كامل للضمان المالي والإشعارات الفورية.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-white px-4 text-xs font-bold text-ink">
                <Icon name="package" size={15} />
                App Store
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-white px-4 text-xs font-bold text-ink">
                <Icon name="package" size={15} />
                Google Play
              </span>
            </div>

            <Button className="mt-6" href="/register" variant="primary">
              سجّل للحصول على إشعار الإطلاق
            </Button>
          </div>

          <div className="flex justify-center md:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
