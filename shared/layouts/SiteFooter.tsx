import Link from "next/link";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { BRAND } from "@/shared/constants/brand";
import { footerLinks } from "@/shared/constants/navigation";
import { Icon } from "@/shared/ui/Icon";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="app-container section-padding pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="mb-5">
              <BrandLogo href="/" showTagline={false} size="md" />
            </div>
            <p className="max-w-xs text-sm font-medium leading-7 text-muted">
              {BRAND.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink uppercase">
                  {group.title}
                </h3>
                <ul className="grid gap-2">
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

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs font-medium text-muted">{BRAND.copyright}</p>
          <div className="flex items-center gap-4 text-xs font-medium text-muted">
            <Link className="inline-flex items-center gap-1 transition hover:text-ink" href="/support">
              <Icon name="message" size={14} />
              الدعم
            </Link>
            <Link className="inline-flex items-center gap-1 transition hover:text-ink" href="/escrow">
              <Icon name="shield" size={14} />
              الضمان المالي
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
