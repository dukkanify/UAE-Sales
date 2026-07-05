import Link from "next/link";
import { Icon } from "@/shared/ui/Icon";

const groups = [
  {
    links: [
      { href: "/categories", label: "التصنيفات" },
      { href: "/featured", label: "الإعلانات المميزة" },
      { href: "/search", label: "استكشف الإعلانات" },
      { href: "/listings/new", label: "أضف إعلانك" },
    ],
    title: "السوق",
  },
  {
    links: [
      { href: "/escrow", label: "الضمان المالي" },
      { href: "/support", label: "الدعم" },
      { href: "/profile", label: "حسابي" },
      { href: "/dashboard/listings", label: "إعلاناتي" },
    ],
    title: "الثقة",
  },
  {
    links: [
      { href: "/login", label: "تسجيل الدخول" },
      { href: "/register", label: "إنشاء حساب" },
      { href: "/wallet", label: "المحفظة" },
      { href: "/chat", label: "الرسائل" },
    ],
    title: "الحساب",
  },
];

export function MarketSiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="app-container py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[var(--radius-lg)] bg-secondary text-sm font-bold text-primary">
                UAE
              </span>
              <div>
                <p className="text-lg font-bold">UAE Sales</p>
                <p className="text-sm text-white/55">سوق إماراتي موثوق</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              منصة ذكية للبيع والشراء بثقة — تجمع بين البحث السريع، العرض
              الاحترافي، والضمان المالي في تجربة واحدة.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                ["shield", "ضمان مالي"],
                ["check", "توثيق"],
                ["wallet", "دفع آمن"],
              ].map(([icon, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70"
                >
                  <Icon name={icon as "shield" | "check" | "wallet"} size={13} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-bold text-secondary">{group.title}</h3>
                <ul className="mt-4 grid gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-sm text-white/55 transition hover:text-white"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45">
          <p>© 2026 UAE Sales. جميع الحقوق محفوظة.</p>
          <p>صُمم في الإمارات لسوق الإمارات.</p>
        </div>
      </div>
    </footer>
  );
}
