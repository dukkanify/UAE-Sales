import Link from "next/link";
import { primaryNavigation } from "@/constants/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="app-container flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-black text-white">
            US
          </span>
          <span>
            <span className="block text-lg font-black text-ink">UAE Sales</span>
            <span className="block text-xs font-bold text-muted">
              سوق الإمارات الآمن
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-muted lg:flex">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-muted transition hover:bg-primary-soft hover:text-primary sm:inline-flex"
          >
            دخول
          </Link>
          <Link
            href="/listings/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-primary-dark"
          >
            أضف إعلان
          </Link>
        </div>
      </div>
    </header>
  );
}
