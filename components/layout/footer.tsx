"use client";

import Link from "next/link";

import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";
import { BrandLogo } from "@/components/brand/brand-logo";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-[var(--surface-ink)] text-white">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <BrandLogo variant="dark" href={routes.home} />
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              Aviation course platform · 2030. {siteStatic.description} Training lanes:{" "}
              {siteStatic.locations.join(" · ")}.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
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
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
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

        <div className="my-8 h-px w-full bg-white/10" />
        <p className="text-xs text-white/35">
          © {year} {siteStatic.name}. Aviation course platform. English only.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
