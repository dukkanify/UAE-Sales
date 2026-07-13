import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";

export function MarketPromoBanner() {
  return (
    <section aria-label="بيع سيارتك" className="border-b border-border/50 bg-white py-8 md:py-10">
      <div className="app-container px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#1e293b] to-primary p-6 shadow-[0_16px_40px_rgb(15_23_42/18%)] md:p-8">
          <span
            aria-hidden
            className="absolute top-4 end-4 z-10 grid size-9 place-items-center rounded-full border border-secondary/35 bg-primary/85 text-secondary"
          >
            <Icon name="shield" size={16} />
          </span>

          <div className="grid items-center gap-6 md:grid-cols-[1fr_minmax(10rem,14rem)] md:gap-8">
            <div className="max-w-xl">
              <p className="text-xl font-bold text-secondary md:text-2xl">بيع سيارتك خلال دقائق</p>
              <p className="mt-2 text-sm leading-7 text-white/78 md:text-base">
                وصل لمشتري جادين بسرعة وأمان
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center gap-1 rounded-full bg-secondary px-5 text-sm font-bold text-primary transition hover:bg-[#d4b87a]"
                href="/listings/new"
              >
                ابدأ الآن
                <Icon name="chevron-left" size={16} />
              </Link>
            </div>

            <div className="relative mx-auto aspect-[16/10] w-full max-w-xs overflow-hidden rounded-xl md:max-w-none">
              <AppImage
                alt="مرسيدس G-Class للبيع على سوقنا"
                className="object-cover"
                fallbackCategory="cars"
                fill
                sizes="(max-width: 768px) 280px, 320px"
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
