import Link from "next/link";
import { primaryNavigation } from "@/constants/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="app-container flex min-h-20 flex-wrap items-center justify-between gap-3 py-3 lg:flex-nowrap">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-lg font-black text-white shadow-[var(--shadow-soft)]">
            US
          </span>
          <span>
            <span className="block text-lg font-black text-ink">UAE Sales</span>
            <span className="block text-xs font-bold text-muted">
              سوق الإمارات الآمن
            </span>
          </span>
        </Link>

        <form
          action="/search"
          className="order-3 grid w-full grid-cols-[1fr_auto] rounded-full border border-border bg-surface-muted p-1 lg:order-none lg:max-w-sm"
        >
          <input
            aria-label="بحث سريع"
            className="min-h-10 rounded-full bg-transparent px-4 text-sm font-bold text-ink outline-none placeholder:text-muted"
            name="q"
            placeholder="ابحث في السوق..."
            type="search"
          />
          <button
            className="rounded-full bg-primary px-4 text-sm font-black text-white transition hover:bg-primary-dark"
            type="submit"
          >
            بحث
          </button>
        </form>

        <nav className="hidden items-center gap-5 text-sm font-bold text-muted xl:flex">
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
            href="/profile"
            className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-muted transition hover:bg-primary-soft hover:text-primary md:inline-flex"
          >
            حسابي
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-bold text-muted transition hover:bg-primary-soft hover:text-primary"
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
