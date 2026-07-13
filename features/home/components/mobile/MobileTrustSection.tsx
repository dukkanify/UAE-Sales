import Link from "next/link";
import { Icon } from "@/shared/ui/Icon";

export function MobileTrustSection() {
  return (
    <section aria-label="الضمان المالي" className="mobile-home-trust">
      <div className="mobile-home-trust__panel">
        <span aria-hidden className="mobile-home-trust__icon-wrap">
          <Icon className="text-[var(--mh-gold)]" name="shield" size={28} />
        </span>

        <div className="mobile-home-trust__copy">
          <h2 className="mobile-home-trust__title">الضمان المالي</h2>
          <p className="mobile-home-trust__desc">
            نظام ضمان مالي يحمي المشتري والبائع — المبلغ يُحجز بأمان حتى تأكيد
            الاستلام.
          </p>
          <Link className="mobile-home-trust__link" href="/escrow">
            اعرف كيف نحميك
            <Icon name="chevron-left" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
