import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { HeroDeviceMockup } from "./HeroDeviceMockup";

export function AppDownload() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="cta-panel-premium relative overflow-hidden rounded-[var(--radius-2xl)] p-8 md:p-12">
          <div className="absolute -start-16 top-0 size-56 rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -end-10 bottom-0 size-48 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-bold tracking-wide text-secondary uppercase">
                التطبيق قريباً
              </p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                UAE Sales في جيبك
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium leading-8 text-white/78">
                تطبيق iOS وAndroid قيد التطوير — أضف إعلاناتك، تابع معاملاتك،
                وتواصل مع المشترين من أي مكان في الإمارات.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-white/20 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md">
                  <Icon name="package" size={16} />
                  App Store — قريباً
                </span>
                <span className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-xl)] border border-white/20 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md">
                  <Icon name="package" size={16} />
                  Google Play — قريباً
                </span>
              </div>

              <div className="mt-8">
                <Button className="gap-2" href="/register" size="lg" variant="accent">
                  <Icon name="bell" size={18} />
                  سجّل للحصول على إشعار الإطلاق
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroDeviceMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
