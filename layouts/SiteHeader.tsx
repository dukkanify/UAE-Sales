import Link from "next/link";
import { primaryNavigation } from "@/constants/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 py-3">
      <div className="app-container">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] border border-white/80 bg-white/82 px-3 py-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl lg:flex-nowrap lg:px-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-night text-lg font-black text-white shadow-[var(--shadow-glow)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,255,208,0.55),transparent_42%),linear-gradient(135deg,rgba(0,184,122,0.8),rgba(244,182,63,0.35))]" />
              <span className="relative">US</span>
            </span>
            <span>
              <span className="block text-lg font-black text-ink">UAE Sales</span>
              <span className="block text-xs font-black text-primary">
                سوق الضمان الذكي
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface-muted/70 p-1 text-sm font-black text-muted xl:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 transition hover:bg-white hover:text-primary hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/search"
            className="order-3 grid w-full grid-cols-[1fr_auto] rounded-full border border-border bg-white p-1 shadow-inner lg:order-none lg:max-w-xs"
          >
            <input
              aria-label="بحث سريع"
              className="min-h-10 rounded-full bg-transparent px-4 text-sm font-bold text-ink outline-none placeholder:text-muted"
              name="q"
              placeholder="ابحث عن سيارة، عقار..."
              type="search"
            />
            <button
              className="rounded-full bg-night px-4 text-sm font-black text-white transition hover:bg-primary"
              type="submit"
            >
              بحث
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="hidden rounded-full px-4 py-2.5 text-sm font-black text-muted transition hover:bg-primary-soft hover:text-primary md:inline-flex"
            >
              حسابي
            </Link>
            <Link
              href="/login"
              className="rounded-full px-4 py-2.5 text-sm font-black text-muted transition hover:bg-primary-soft hover:text-primary"
            >
              دخول
            </Link>
            <Link
              href="/listings/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-l from-primary to-primary-dark px-5 py-2.5 text-sm font-black text-white shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
            >
              أضف إعلان
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
