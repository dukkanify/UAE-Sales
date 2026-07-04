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

export function Home3Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="app-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.5fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-[1rem] bg-secondary text-sm font-black text-primary">
                UAE
              </span>
              <div>
                <p className="text-xl font-black">UAE Sales</p>
                <p className="text-sm font-medium text-white/60">
                  مستقبل الإعلانات المبوبة في الإمارات
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm font-medium leading-8 text-white/62">
              منصة ذكية للبيع والشراء بثقة، تجمع بين البحث السريع، العرض
              الاحترافي، والضمان المالي في تجربة واحدة.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                ["shield", "ضمان مالي"],
                ["check", "توثيق"],
                ["message", "دعم"],
              ].map(([icon, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/78"
                >
                  <Icon name={icon as "shield" | "check" | "message"} size={14} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-black tracking-[0.2em] text-secondary uppercase">
                  {group.title}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-sm font-medium text-white/62 transition hover:text-white"
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

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs font-medium text-white/48">
            © 2026 UAE Sales. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs font-medium text-white/48">
            صُمم في الإمارات لسوق الإمارات.
          </p>
        </div>
      </div>
    </footer>
  );
}
