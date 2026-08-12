import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { LIVE_STEPS } from "@/features/marketing/content/platform-pages";

export const metadata: Metadata = {
  title: "Live Zoom coaching",
  description:
    "Clear turbulence with a live AviatorPass instructor — reserve a GMT window, confirm by email, join Zoom from your lobby.",
  alternates: { canonical: routes.live },
  openGraph: {
    title: "Live Zoom coaching | AviatorPass",
    description: "Private instructor Zoom sessions for ATPL theory pilots.",
    url: routes.live,
  },
};

export default function LiveCoachingPage() {
  return (
    <div className="platform-altitude landing-root">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AviatorPass Live Zoom coaching",
          url: `${siteConfig.url}${routes.live}`,
          description:
            "Book live Zoom instructor sessions on AviatorPass — confirm by email and join from the lobby.",
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <section className="catalog-page-hero hero-aviation relative isolate overflow-hidden">
        <div className="hero-horizon" aria-hidden />
        <div className="hero-vignette" aria-hidden />
        <div className="container-app relative z-10 py-20 sm:py-28 lg:py-32">
          <p className="landing-kicker text-accent">Live altitude</p>
          <h1 className="hero-brand mt-6 max-w-[12ch] font-display text-[clamp(2.8rem,8vw,5.5rem)] font-semibold">
            <span className="hero-brand-aviator">Live</span>
            <span className="hero-brand-pass"> Zoom</span>
          </h1>
          <p className="mt-6 max-w-[26ch] font-display text-[clamp(1.25rem,2.8vw,1.95rem)] font-semibold tracking-[-0.03em] leading-snug text-white/92">
            Clear the turbulence with a live instructor
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Private coaching windows in Greenwich Mean Time. Reserve first, confirm by email, then
            join from your AviatorPass lobby.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" className="hero-cta-primary" asChild>
              <Link href={routes.book}>
                Open booking studio
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hero-cta-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.flightpath}>See flightpath</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="platform-surface content-auto py-20 sm:py-28">
        <div className="container-app">
          <p className="landing-kicker text-primary">How live works</p>
          <h2 className="mt-4 max-w-[18ch] font-display text-[clamp(1.85rem,3.8vw,3rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
            Reserve. Confirm. Join Zoom.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Live coaching is its own page — the booking studio is where you pick the GMT slot.
          </p>
          <div className="landing-rule mt-12 mb-4 opacity-70" />
          <ol className="flightpath-spine mt-14 space-y-14 md:space-y-16">
            {LIVE_STEPS.map((item, index) => (
              <li
                key={item.code}
                className="flightpath-node platform-module animate-in-up"
                style={{ animationDelay: `${0.08 + index * 0.1}s` }}
              >
                <p className="flightpath-index font-display text-6xl font-bold sm:text-7xl">
                  {item.code}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground md:max-w-lg">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="platform-band content-auto relative overflow-hidden py-20 text-white sm:py-24">
        <div className="container-app relative z-10">
          <p className="landing-kicker mb-5 text-accent">Ready</p>
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <h2 className="max-w-[14ch] font-display text-[clamp(1.85rem,4vw,3.2rem)] font-semibold tracking-[-0.035em] leading-[1.05] text-white">
                Open the booking studio when you are ready
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/62 sm:text-lg">
                Choose mentoring, exam prep, or office hours — times show in GMT.
              </p>
            </div>
            <Button
              size="lg"
              variant="accent"
              className="hero-cta-primary w-full justify-center sm:w-auto lg:w-full"
              asChild
            >
              <Link href={routes.book}>
                Book live Zoom
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
