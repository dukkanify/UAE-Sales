import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { FLIGHTPATH_STEPS } from "@/features/marketing/content/platform-pages";

export const metadata: Metadata = {
  title: "Flightpath",
  description:
    "Three altitudes on AviatorPass — course engine, live Zoom lane, and mastery loop for ATPL readiness.",
  alternates: { canonical: routes.flightpath },
  openGraph: {
    title: "Flightpath | AviatorPass",
    description: "How AviatorPass sequences ATPL theory, live coaching, and exam mastery.",
    url: routes.flightpath,
  },
};

export default function FlightpathPage() {
  return (
    <div className="platform-altitude landing-root">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AviatorPass Flightpath",
          url: `${siteConfig.url}${routes.flightpath}`,
          description:
            "Course engine, live Zoom coaching, and mastery loop — the AviatorPass training path.",
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <section className="catalog-page-hero hero-aviation relative isolate overflow-hidden">
        <div className="hero-horizon" aria-hidden />
        <div className="hero-vignette" aria-hidden />
        <div className="container-app relative z-10 py-20 sm:py-28 lg:py-32">
          <p className="landing-kicker text-accent">AviatorPass flightpath</p>
          <h1 className="hero-brand mt-6 max-w-[14ch] font-display text-[clamp(2.8rem,8vw,5.5rem)] font-semibold">
            <span className="hero-brand-aviator">Three</span>
            <span className="hero-brand-pass"> altitudes</span>
          </h1>
          <p className="mt-6 max-w-[28ch] font-display text-[clamp(1.25rem,2.8vw,1.95rem)] font-semibold tracking-[-0.03em] leading-snug text-white/92">
            One training OS from syllabus to license readiness
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Learn on structured ATPL lanes, book live Zoom when you need altitude, then prove
            mastery — without brochure noise.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" className="hero-cta-primary" asChild>
              <Link href={routes.courses}>
                Open courses
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hero-cta-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.live}>Live coaching</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="platform-surface content-auto py-20 sm:py-28">
        <div className="container-app">
          <p className="landing-kicker text-primary">The path</p>
          <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(1.85rem,3.8vw,3rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
            Course engine. Live lane. Mastery loop.
          </h2>
          <div className="landing-rule mt-12 mb-4 opacity-70" />
          <ol className="flightpath-spine mt-14 space-y-16 md:space-y-20">
            {FLIGHTPATH_STEPS.map((item, index) => (
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

      <section className="landing-close relative overflow-hidden py-20 text-white sm:py-24">
        <div className="container-app relative z-10 text-center">
          <p className="landing-kicker mb-5 text-white/40">Next altitude</p>
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold tracking-[-0.035em] leading-[1.06] text-white">
            Start on a published lane or book live Zoom
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-8" asChild>
              <Link href={routes.courses}>
                Browse courses
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.book}>Book live</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
