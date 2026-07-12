import Link from "next/link";
import { Icon } from "@/shared/ui/Icon";
import { MOBILE_TRENDING_SEARCHES } from "./mobile-home.config";

export function MobileTrendingSearches() {
  return (
    <section aria-label="الأكثر بحثاً" className="px-4 pt-4">
      <h2 className="mb-3 text-sm font-black text-ink">الأكثر بحثاً</h2>
      <div className="mobile-home-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {MOBILE_TRENDING_SEARCHES.map((item) => (
          <Link
            key={item.href}
            className="mobile-home-trending-pill inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-bold text-ink shadow-sm transition active:scale-[0.98]"
            href={item.href}
          >
            <Icon className="text-secondary" name={item.icon} size={14} />
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
