"use client";

import Link from "next/link";

import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#03080c] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 100% 0%, rgba(46,125,170,0.22), transparent 60%), radial-gradient(ellipse 40% 45% at 0% 100%, rgba(221,155,48,0.1), transparent 55%)",
        }}
      />
      <div className="container-app relative z-10 py-16 sm:py-20">
        <div className="grid gap-14 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-6">
            <BrandLogo variant="dark" href={routes.home} />
            <p className="max-w-md text-sm leading-relaxed text-white/45">
              The aviation course platform for ATPL theory, live Zoom coaching, and exam mastery.
              Training lanes: {siteStatic.locations.join(" · ")}.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Navigate
            </h3>
            <ul className="space-y-3 text-sm text-white/55">
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
                <Link href={routes.courses} className="transition hover:text-accent">
                  Courses
                </Link>
              </li>
              <li>
                <Link href={routes.book} className="transition hover:text-accent">
                  Book a session
                </Link>
              </li>
              <li>
                <Link href={routes.registerInstructor} className="transition hover:text-accent">
                  Teach with us
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
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/55">
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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            © {year} {siteStatic.name}. English only.
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/20">
            Train · Book · Master
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
