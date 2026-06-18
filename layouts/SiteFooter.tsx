import Link from "next/link";
import { footerLinks } from "@/constants/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-white">
      <div className="uae-flag-strip h-1.5 w-full" />
      <div className="app-container grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="relative grid size-11 place-items-center overflow-hidden rounded-2xl bg-uae-black text-lg font-black text-white">
              <span className="uae-flag-strip absolute inset-0" />
              <span className="relative rounded-lg bg-uae-black/80 px-1.5 text-[0.65rem]">
                UAE
              </span>
            </span>
            <div>
              <p className="text-lg font-black">UAE Sales</p>
              <p className="text-sm font-bold text-muted">
                سوق إماراتي للبيع والشراء بثقة
              </p>
            </div>
          </div>
          <p className="max-w-md leading-8 text-muted">
            منصة إعلانات مبوبة عربية تربط البائعين والمشترين داخل الإمارات مع
            واجهات جاهزة للضمان المالي، المحفظة، الدردشة، وإدارة الإعلانات.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-black text-ink">{group.title}</h3>
              <ul className="grid gap-3 text-sm font-bold text-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-sm font-bold text-muted">
        © 2026 UAE Sales. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
