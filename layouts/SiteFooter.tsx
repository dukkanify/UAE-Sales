import Link from "next/link";
import { footerLinks } from "@/constants/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="app-container section-padding">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-xs font-black text-white">
                UAE
              </span>
              <div>
                <p className="text-lg font-black text-ink">UAE Sales</p>
                <p className="text-sm font-medium text-muted">
                  السوق الإماراتي الفاخر
                </p>
              </div>
            </div>
            <p className="max-w-sm leading-8 text-muted">
              منصة إعلانات مبوبة فاخرة تربط البائعين والمشترين في الإمارات
              بضمان مالي، محفظة آمنة، ودعم احترافي على مدار الساعة.
            </p>
            <div className="mt-6 flex gap-3">
              {["App Store", "Google Play"].map((store) => (
                <span
                  key={store}
                  className="rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-xs font-bold text-muted"
                >
                  {store}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-sm font-black text-ink">{group.title}</h3>
                <ul className="grid gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-sm font-medium text-muted transition hover:text-ink"
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

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm font-medium text-muted">
            © 2026 UAE Sales. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4 text-sm font-medium text-muted">
            <Link className="transition hover:text-ink" href="/support">
              الدعم
            </Link>
            <Link className="transition hover:text-ink" href="/escrow">
              الضمان المالي
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
