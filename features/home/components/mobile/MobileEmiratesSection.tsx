import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getUaeEmiratesCards } from "@/features/home/shared/uae-emirates";
import { listingCountLabel } from "@/shared/i18n/count-labels";
import { getRequestLocale } from "@/shared/i18n/locale";
import { MobileSectionHeader } from "./MobileSectionHeader";

export async function MobileEmiratesSection() {
  const [emirates, locale] = await Promise.all([
    getUaeEmiratesCards(),
    getRequestLocale(),
  ]);

  return (
    <section aria-label="الإمارات الأكثر شعبية" className="mobile-home-emirates">
      <MobileSectionHeader title="الإمارات الأكثر شعبية" />
      <p className="mobile-home-emirates__desc">
        من دبي إلى الفجيرة — تصفح الإعلانات في إمارتك.
      </p>

      <div className="mobile-home-emirates__grid">
        {emirates.map((emirate) => (
          <Link
            key={emirate.id}
            className="mobile-home-emirates__card group"
            href={emirate.href}
          >
            <AppImage
              alt={`${emirate.name} — ${emirate.landmark}`}
              className="mobile-home-emirates__image transition duration-500 group-active:scale-[1.02]"
              fallback="emirates"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              src={emirate.imageUrl}
            />
            <span aria-hidden className="mobile-home-emirates__overlay" />
            <span className="mobile-home-emirates__content">
              <span className="mobile-home-emirates__count">
                {listingCountLabel(emirate.count, locale)}
              </span>
              <span className="mobile-home-emirates__footer">
                <span className="mobile-home-emirates__name">{emirate.name}</span>
                <span className="mobile-home-emirates__arrow">
                  <Icon name="arrow-left" size={14} />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
