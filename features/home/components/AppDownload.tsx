import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

export function AppDownload() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted p-8 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-wide text-secondary uppercase">
                التطبيق قريباً
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink md:text-3xl">
                UAE Sales في جيبك
              </h2>
              <p className="mt-3 max-w-md text-sm font-medium leading-7 text-muted">
                تطبيق iOS وAndroid قيد التطوير — أضف إعلاناتك وتابع معاملاتك
                من أي مكان.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 text-xs font-medium text-muted">
                  <Icon name="package" size={14} />
                  App Store — قريباً
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 text-xs font-medium text-muted">
                  <Icon name="package" size={14} />
                  Google Play — قريباً
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative h-52 w-36 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-primary shadow-[var(--shadow-lg)]">
                <div className="grid h-full place-items-center text-white">
                  <span className="text-lg font-semibold">UAE</span>
                  <span className="text-xs font-medium text-white/70">Sales</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button href="/register" variant="primary">
              سجّل للحصول على إشعار الإطلاق
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
