"use client";

import Link from "@/components/ui/app-link";
import { ArrowUpRight, Mail } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { brandingConfig } from "@/config/branding";
import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";

const exploreLinks = [
  { href: routes.courses, label: "ATPL Program" },
  { href: "/#about", label: "About" },
  { href: "/#instructors", label: "Instructors" },
  { href: routes.book, label: "Private Session" },
  { href: "/#contact", label: "Contact" },
] as const;

const accountLinks = [
  { href: routes.login, label: "Log in" },
  { href: routes.register, label: "Join as student" },
] as const;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" aria-hidden />
      <div className="container-app relative z-10">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <BrandLogo variant="text" href={routes.home} />
            <p className="site-footer-tagline">
              {brandingConfig.tagline}. Premium live ATPL training —{" "}
              {siteStatic.locations.join(" · ")}.
            </p>
            <Link href={routes.courses} className="site-footer-cta">
              Explore the ATPL Program
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
              <h3 className="site-footer-heading">Support</h3>
              <ul className="site-footer-list site-footer-contact">
                <li>
                  <a
                    href={`mailto:${siteStatic.supportEmail}`}
                    className="site-footer-contact-link"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden />
                    <span>{siteStatic.supportEmail}</span>
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
            <span>Progress</span>
            <span className="site-footer-dot" aria-hidden />
            <span>Master</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
