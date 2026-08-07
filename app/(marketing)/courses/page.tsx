import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { PublicCourseCatalog } from "@/features/courses/components/public-course-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

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
        <div className="container-app relative z-10 py-20 sm:py-28 lg:py-32">
          <p className="landing-kicker text-accent">AviatorPass courses</p>
          <h1 className="hero-brand mt-6 max-w-[12ch] font-display text-[clamp(3rem,9vw,6.5rem)] font-semibold">
            <span className="hero-brand-aviator">Aviator</span>
            <span className="hero-brand-pass">Pass</span>
          </h1>
          <p className="mt-6 max-w-[28ch] font-display text-[clamp(1.35rem,3vw,2.15rem)] font-semibold tracking-[-0.03em] leading-snug text-white/92">
            ATPL courses built for license-ready pilots
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Explore published programs on {siteConfig.name}. Each lane sits under its instructor —
            enter the platform to enroll, or book live Zoom when you need coaching.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" className="hero-cta-primary" asChild>
              <Link href={routes.register}>
                Join as student
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
      </section>

      <section className="catalog-page-body">
        <div className="container-app py-16 sm:py-24">
          <PublicCourseCatalog />
        </div>
      </section>
    </div>
  );
}
