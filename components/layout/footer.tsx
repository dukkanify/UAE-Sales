"use client";

import Link from "@/components/ui/app-link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";

const exploreLinks = [
  { href: "/#flightpath", label: "Flightpath" },
  { href: routes.courses, label: "Courses" },
  { href: "/#live", label: "Live Zoom" },
  { href: routes.book, label: "Book a session" },
] as const;

const accountLinks = [
  { href: routes.login, label: "Enter platform" },
  { href: routes.register, label: "Join as student" },
  { href: routes.registerInstructor, label: "Teach with us" },
] as const;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" aria-hidden />
      <div className="container-app relative z-10">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <BrandLogo variant="dark" href={routes.home} />
            <p className="site-footer-tagline">
              ATPL theory, live Zoom coaching, and exam mastery — training lanes in{" "}
              {siteStatic.locations.join(" · ")}.
            </p>
            <Link href={routes.book} className="site-footer-cta">
              Book live Zoom
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="site-footer-cols">
            <div>
              <h3 className="site-footer-heading">Explore</h3>
              <ul className="site-footer-list">
                {exploreLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="site-footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="site-footer-heading">Account</h3>
              <ul className="site-footer-list">
                {accountLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="site-footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="site-footer-heading">Contact</h3>
              <ul className="site-footer-list site-footer-contact">
                <li>
                  <a
                    href={`mailto:${siteStatic.contactEmail}`}
                    className="site-footer-contact-link"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden />
                    <span>{siteStatic.contactEmail.toLowerCase()}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={siteStatic.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="site-footer-contact-link"
                  >
                    <Instagram className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden />
                    <span>{siteStatic.socialHandle}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copy">
            © {year} {siteStatic.name}
            <span className="site-footer-dot" aria-hidden />
            English only
          </p>
          <p className="site-footer-motto">
            <span>Train</span>
            <span className="site-footer-dot" aria-hidden />
            <span>Book</span>
            <span className="site-footer-dot" aria-hidden />
            <span>Master</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
