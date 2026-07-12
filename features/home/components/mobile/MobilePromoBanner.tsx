import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";

export function MobilePromoBanner() {
  return (
    <section aria-label="بيع سيارتك" className="mobile-home-promo">
      <div className="mobile-home-promo__panel">
        <span aria-hidden className="mobile-home-promo__verified">
          <Icon name="shield" size={14} />
        </span>

        <div className="mobile-home-promo__layout">
          <div className="mobile-home-promo__media">
            <AppImage
              alt="مرسيدس G-Class للبيع على سوقنا"
              className="object-cover"
              fallbackCategory="cars"
              fill
              sizes="136px"
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mobile-home-promo__title">بيع سيارتك خلال دقائق</p>
            <p className="mobile-home-promo__desc">وصل لمشتري جادين بسرعة وأمان</p>
            <Link className="mobile-home-promo__cta" href="/listings/new">
              ابدأ الآن
              <Icon name="chevron-left" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
