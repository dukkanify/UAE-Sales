import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";

export function MobilePromoBanner() {
  return (
    <section className="px-4 pt-5">
      <div className="mobile-home-promo relative overflow-hidden rounded-[1.25rem] p-4 shadow-[var(--shadow-md)]">
        <div className="relative z-10 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black leading-snug text-secondary">
              بيع سيارتك في دقائق
            </p>
            <p className="mt-1 text-xs font-medium text-white/80">
              أضف إعلانك ووصل لآلاف المشترين الموثقين
            </p>
            <Link
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full bg-secondary px-5 text-xs font-black text-primary shadow-[var(--shadow-glow)] transition active:scale-[0.98]"
              href="/listings/new"
            >
              ابدأ الآن
            </Link>
          </div>

          <div className="relative h-24 w-32 shrink-0">
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <AppImage
                alt="سيارة فاخرة للبيع على سوقنا"
                className="object-cover"
                fallbackCategory="cars"
                fill
                sizes="128px"
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=500&q=80"
              />
            </div>
            <span className="absolute -bottom-1 -start-2 grid size-8 place-items-center rounded-full border border-secondary/30 bg-primary text-secondary shadow-sm">
              <Icon name="shield" size={14} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
