import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="platform-surface">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "ATPL PASS Courses",
          url: `${siteConfig.url}${routes.courses}`,
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />

      <section className="border-b border-border/50 bg-[var(--surface-ink)] text-white">
        <div className="container-app py-16 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            Course catalog
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            ATPL courses built for license-ready pilots
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Explore published programs on {siteConfig.name}. Enter the platform to enroll, or book
            live Zoom coaching when you need an instructor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" asChild>
              <Link href={routes.register}>Join as student</Link>
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
