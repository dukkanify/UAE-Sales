import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { PublicCourseCatalog } from "@/features/courses/components/public-course-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

/** Cache catalog HTML briefly; publishes revalidate within a minute. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ATPL courses",
  description:
    "Browse published AviatorPass courses — theory modules, flight operations, and exam-ready training programs.",
  alternates: { canonical: routes.courses },
  openGraph: {
    title: "ATPL courses | AviatorPass",
    description: "Published aviation courses on the AviatorPass training platform.",
    url: routes.courses,
  },
};

export default function PublicCoursesPage() {
  return (
    <div className="platform-altitude landing-root">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AviatorPass Courses",
          url: `${siteConfig.url}${routes.courses}`,
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <section className="catalog-page-hero hero-aviation relative isolate overflow-hidden">
        <div className="hero-horizon" aria-hidden />
        <div className="hero-vignette" aria-hidden />
        <div className="catalog-hero-atmosphere" aria-hidden>
          <div className="catalog-hero-stars" />
          <svg
            className="catalog-hero-climb"
            viewBox="0 0 420 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="catalogClimbStroke" x1="0" y1="220" x2="420" y2="0">
                <stop offset="0%" stopColor="rgba(46,125,170,0.05)" />
                <stop offset="45%" stopColor="rgba(116,178,209,0.45)" />
                <stop offset="100%" stopColor="rgba(221,155,48,0.95)" />
              </linearGradient>
            </defs>
            <path
              className="catalog-hero-climb-path"
              d="M18 198 C92 188 128 150 168 118 C214 82 268 58 332 36 C356 28 382 20 402 14"
            />
            <circle className="catalog-hero-climb-pulse" cx="402" cy="14" r="10" />
            <circle className="catalog-hero-climb-node" cx="402" cy="14" r="4.5" />
          </svg>
        </div>

        <div className="container-app relative z-10 py-20 sm:py-28 lg:py-32">
          <p className="animate-in-up landing-kicker text-accent">AviatorPass courses</p>
          <h1 className="catalog-hero-brand hero-brand mt-6 max-w-[12ch] font-display text-[clamp(3rem,9vw,6.5rem)] font-semibold">
            <span className="hero-brand-aviator">Aviator</span>
            <span className="hero-brand-pass">Pass</span>
          </h1>
          <p className="animate-in-up-delay-1 mt-6 max-w-[22ch] font-display text-[clamp(1.4rem,3.2vw,2.25rem)] font-semibold tracking-[-0.03em] leading-snug text-white/94">
            ATPL courses built for license-ready pilots
          </p>
          <p className="animate-in-up-delay-2 mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            Published lanes under each instructor — enroll on the platform, or book live Zoom when
            you need altitude.
          </p>
          <div className="animate-in-up-delay-3 mt-10 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" className="hero-cta-primary" asChild>
              <Link href="#catalog-lanes">
                Browse lanes
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hero-cta-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.book}>Book live Zoom</Link>
            </Button>
          </div>
        </div>

        <a href="#catalog-lanes" className="catalog-hero-descend">
          <span className="catalog-hero-descend-mark" aria-hidden />
          Lanes below
        </a>
      </section>

      <section id="catalog-lanes" className="catalog-page-body scroll-mt-28">
        <div className="container-app py-16 sm:py-24">
          <PublicCourseCatalog />
        </div>
      </section>
    </div>
  );
}
