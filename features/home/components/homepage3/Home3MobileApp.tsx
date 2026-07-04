import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

function PhoneMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[2rem] border-[5px] border-primary bg-primary p-2 shadow-[0_24px_70px_rgb(15_20_25/18%)] ${compact ? "w-40" : "w-48"}`}
    >
      <div className="overflow-hidden rounded-[1.45rem] bg-white">
        <div className="bg-primary px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">UAE Sales</span>
            <Icon name="bell" size={14} />
          </div>
        </div>
        <div className="space-y-3 p-3">
          <div className="rounded-[1rem] bg-secondary-soft p-3">
            <p className="text-xs font-black text-ink">بحث سريع</p>
            <div className="mt-2 h-2 rounded-full bg-white" />
          </div>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-2 rounded-[1rem] border border-border p-2">
              <div className="size-10 rounded-[0.8rem] bg-surface-muted" />
              <div className="flex-1 space-y-1.5 py-1">
                <div className="h-1.5 rounded-full bg-surface-muted" />
                <div className="h-1.5 w-2/3 rounded-full bg-secondary/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Home3MobileApp() {
  return (
    <section className="overflow-hidden bg-[#fffbf4] py-28">
      <div className="app-container">
        <div className="relative rounded-[2.5rem] border border-border bg-white p-8 shadow-[0_28px_90px_rgb(15_20_25/10%)] md:p-12">
          <div className="absolute end-10 top-10 h-60 w-60 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-black tracking-[0.24em] text-secondary uppercase">
                Mobile App
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-ink md:text-5xl">
                السوق الإماراتي في جيبك
              </h2>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-muted">
                تطبيق UAE Sales القادم سيجمع البحث، الرسائل، الإعلانات، والضمان
                المالي في تجربة واحدة مصممة للموبايل.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex min-h-12 items-center gap-2 rounded-[1rem] border border-border bg-surface px-5 text-sm font-black text-ink">
                  <Icon name="package" size={16} />
                  App Store
                </span>
                <span className="inline-flex min-h-12 items-center gap-2 rounded-[1rem] border border-border bg-surface px-5 text-sm font-black text-ink">
                  <Icon name="package" size={16} />
                  Google Play
                </span>
              </div>

              <Button className="mt-8" href="/register" size="lg" variant="primary">
                سجّل للحصول على إشعار الإطلاق
              </Button>
            </div>

            <div className="flex items-end justify-center gap-5 lg:justify-end">
              <div className="hidden sm:block">
                <PhoneMockup compact />
              </div>
              <PhoneMockup />
              <div className="rounded-[1.5rem] border border-border bg-[#fffbf4] p-4 shadow-[var(--shadow-card)]">
                <div className="grid size-24 grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={`rounded-sm ${index % 3 === 0 || index % 7 === 0 ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-xs font-black text-ink">QR قريباً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
