"use client";

import Link from "next/link";

import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[var(--surface-ink)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 100% 0%, rgba(46,125,170,0.25), transparent 60%), radial-gradient(ellipse 40% 40% at 0% 100%, rgba(221,155,48,0.1), transparent 55%)",
        }}
      />
      <div className="container-app relative z-10 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-5">
            <BrandLogo variant="dark" href={routes.home} />
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              Aviation course platform for ATPL theory, live Zoom coaching, and exam mastery.
              Training lanes: {siteStatic.locations.join(" · ")}.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/" className="transition hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#flightpath" className="transition hover:text-accent">
                  Flightpath
                </Link>
              </li>
              <li>
                <Link href="/#live" className="transition hover:text-accent">
                  Live Zoom
                </Link>
              </li>
              <li>
                <Link href={routes.book} className="transition hover:text-accent">
                  Book a session
                </Link>
              </li>
              <li>
                <Link href={routes.login} className="transition hover:text-accent">
                  Enter platform
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <a
                  href={`mailto:${siteStatic.contactEmail}`}
                  className="transition hover:text-accent"
                >
                  {siteStatic.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={siteStatic.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-accent"
                >
                  {siteStatic.socialHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            © {year} {siteStatic.name}. Aviation course platform. English only.
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/25">
            Train · Book · Master
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
