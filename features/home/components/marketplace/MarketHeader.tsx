import Link from "next/link";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { MarketHeaderMenu } from "./MarketHeaderMenu";
import { MARKET_HEADER_NAV, isMarketHeaderPathActive } from "./market-header-nav";

type MarketHeaderProps = {
  pathname?: string;
};

/** Homepage chrome. Static bar/nav stay a Server Component so they never hydrate. */
export function MarketHeader({ pathname = "/" }: MarketHeaderProps) {
  return (
    <header className="market-header sticky top-0 z-50">
      <div className="market-header__accent" aria-hidden />
      <MarketHeaderMenu>
        <BrandLogo showTagline={false} size="md" />

        <nav aria-label="التنقل الرئيسي" className="market-header__nav">
          {MARKET_HEADER_NAV.map((item) => {
            const active = isMarketHeaderPathActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                aria-current={active ? "page" : undefined}
                className={`market-header__nav-link${active ? " is-active" : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </MarketHeaderMenu>
    </header>
  );
}
