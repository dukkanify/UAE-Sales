import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

export function AppDownload() {
  return (
    <section className="section-padding bg-[linear-gradient(180deg,#fff,var(--color-background))]">
      <div className="app-container">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface p-8 shadow-[var(--shadow-card)] md:p-12">
          <div className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full bg-secondary/12 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_22rem]">
            <div>
              <p className="text-sm font-bold text-secondary">التطبيق قريباً</p>
              <h2 className="mt-3 text-3xl font-black text-ink">
                UAE Sales في جيبك
              </h2>
              <p className="mt-4 max-w-xl text-base font-medium leading-8 text-muted">
                تطبيق iOS وAndroid قيد التطوير — أضف إعلاناتك وتابع معاملاتك من أي
                مكان في الإمارات.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-5 text-xs font-semibold text-muted">
                  <Icon name="package" size={14} />
                  App Store — قريباً
                </span>
                <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-5 text-xs font-semibold text-muted">
                  <Icon name="package" size={14} />
                  Google Play — قريباً
                </span>
              </div>

              <div className="mt-8">
                <Button href="/register" variant="primary">
                  سجّل للحصول على إشعار الإطلاق
                </Button>
              </div>
            </div>

            <div className="rounded-[var(--radius-2xl)] border border-border bg-[var(--color-background)] p-5">
              <div className="rounded-[var(--radius-xl)] bg-surface p-4 shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-ink">UAE Sales</span>
                  <Icon className="text-secondary" name="bell" size={18} />
                </div>
                <div className="mt-5 grid gap-3">
                  {["إعلان جديد", "رسالة من مشتري", "ضمان مالي"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface-muted px-3 py-3"
                    >
                      <span className="grid size-8 place-items-center rounded-[var(--radius-md)] bg-secondary-soft text-secondary">
                        <Icon name="check" size={14} />
                      </span>
                      <span className="text-xs font-semibold text-ink">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
