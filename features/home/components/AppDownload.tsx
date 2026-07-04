import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

export function AppDownload() {
  return (
    <section className="section-padding bg-[var(--color-background)]">
      <div className="app-container">
        <div className="rounded-[var(--radius-2xl)] border border-border bg-surface p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-secondary">التطبيق قريباً</p>
            <h2 className="mt-3 text-3xl font-black text-ink">UAE Sales في جيبك</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              تطبيق iOS وAndroid قيد التطوير — أضف إعلاناتك وتابع معاملاتك من أي
              مكان.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border px-5 text-xs font-medium text-muted">
                <Icon name="package" size={14} />
                App Store — قريباً
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-border px-5 text-xs font-medium text-muted">
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
        </div>
      </div>
    </section>
  );
}
