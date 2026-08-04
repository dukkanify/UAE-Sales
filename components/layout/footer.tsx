import Link from "next/link";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/brand/brand-logo";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-app py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <BrandLogo variant="dark" href={routes.home} />
            <p className="max-w-sm text-sm text-primary-foreground/70">
              {siteConfig.description} Primary locations: {siteConfig.locations.join(" · ")}.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href={routes.home} className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link href={routes.login} className="hover:text-accent">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href={routes.register} className="hover:text-accent">
                  Register
                </Link>
              </li>
              <li>
                <Link href={routes.dashboard} className="hover:text-accent">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-accent">
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  {siteConfig.socialHandle}
                </a>
              </li>
              <li>{siteConfig.locations.join(" · ")}</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/15" />

        <p className="text-center text-xs text-primary-foreground/60">
          © {year} {siteConfig.name}. All rights reserved. English only.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
