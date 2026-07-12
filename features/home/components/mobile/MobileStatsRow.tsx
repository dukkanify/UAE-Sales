import { Icon } from "@/shared/ui/Icon";
import { MOBILE_TRUST_STATS } from "./mobile-home.config";

const iconToneClass = {
  gold: "mobile-home-stats__icon--gold",
  muted: "mobile-home-stats__icon--muted",
  primary: "mobile-home-stats__icon--primary",
} as const;

export function MobileStatsRow() {
  return (
    <section aria-label="إحصائيات المنصة" className="mobile-home-stats">
      <div className="mobile-home-stats__grid">
        {MOBILE_TRUST_STATS.map((stat) => (
          <div key={stat.label} className="mobile-home-stats__card">
            <Icon
              className={iconToneClass[stat.tone]}
              name={stat.icon}
              size={18}
            />
            <p className="mobile-home-stats__value">{stat.value}</p>
            <p className="mobile-home-stats__label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
