import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PublicCourseCatalog } from "@/features/courses/components/public-course-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "ATPL courses",
  description:
    "Browse published ATPL PASS courses — theory modules, flight operations, and exam-ready training programs.",
  alternates: { canonical: routes.courses },
  openGraph: {
    title: "ATPL courses | ATPL PASS",
    description: "Published aviation courses on the ATPL PASS training platform.",
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
          name: "ATPL PASS Courses",
          url: `${siteConfig.url}${routes.courses}`,
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <section className="catalog-page-hero text-white">
        <div className="container-app relative z-10 py-16 sm:py-24">
          <p className="landing-kicker text-accent">Course catalog</p>
          <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold tracking-[-0.035em] leading-[1.05]">
            ATPL courses built for license-ready pilots
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Explore published programs on {siteConfig.name}. Each lane sits under its instructor —
            enter the platform to enroll, or book live Zoom when you need coaching.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" className="hero-cta-primary" asChild>
              <Link href={routes.register}>
                Join as student
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.registerInstructor}>Teach on ATPL PASS</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-app py-14 sm:py-20">
        <PublicCourseCatalog />
      </section>
    </div>
  );
}
