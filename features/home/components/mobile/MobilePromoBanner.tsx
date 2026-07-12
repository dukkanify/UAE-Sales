import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";

export function MobilePromoBanner() {
  return (
    <section className="px-4 pt-4">
      <div className="mobile-home-promo relative overflow-hidden rounded-[1.25rem] p-4 shadow-[var(--shadow-sm)]">
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            <AppImage
              alt="بيع سريع على سوقنا"
              className="object-cover"
              fallbackCategory="cars"
              fill
              sizes="112px"
              src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black leading-snug text-white">
              اعرض منتجاتك بسهولة
            </p>
            <p className="mt-1 text-xs font-medium text-white/85">وابدأ البيع الآن!</p>
            <Link
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full bg-secondary px-5 text-xs font-black text-primary shadow-[var(--shadow-glow)] transition active:scale-[0.98]"
              href="/listings/new"
            >
              بيع الآن
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
