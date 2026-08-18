export const MARKET_HEADER_NAV = [
  { href: "/", icon: "home" as const, label: "الرئيسية" },
  { href: "/categories", icon: "grid" as const, label: "التصنيفات" },
  { href: "/featured", icon: "star" as const, label: "المميزة" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان" },
  { href: "/search", icon: "search" as const, label: "استكشف" },
];

export function isMarketHeaderPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
