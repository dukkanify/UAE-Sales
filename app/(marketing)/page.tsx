import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeCoursesByInstructor } from "@/features/marketing/components/home-courses-by-instructor";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

/** Cache public marketing HTML briefly — catalog IDs are stable enough for short ISR. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "AviatorPass | Your Aviation Journey Starts Here",
  },
  description:
    "YOUR AVIATION JOURNEY STARTS HERE. Train ATPL theory on AviatorPass — structured courses, live Zoom coaching, quizzes, and exam mastery for pilots in Kuwait and Dubai.",
  keywords: [
    "AviatorPass",
    "ATPL theory",
    "ATPL online course",
    "pilot training platform",
    "aviation course",
    "Zoom flight instructor",
    "Kuwait pilot training",
    "Dubai ATPL",
    "airline transport pilot license",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AviatorPass — Your Aviation Journey Starts Here",
    description:
      "Structured ATPL coursework, live Zoom coaching, and exam mastery in one training OS.",
    url: "/",
    type: "website",
    images: [{ url: siteConfig.brand.openGraph, width: 1200, height: 630, alt: "AviatorPass" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AviatorPass — Your Aviation Journey Starts Here",
    description:
      "Structured ATPL coursework, live Zoom coaching, and exam mastery in one training OS.",
    images: [siteConfig.brand.openGraph],
  },
};

export default function HomePage() {
  return (
    <div className="landing-root home-premium">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteConfig.url}/#organization`,
              name: siteConfig.name,
              url: siteConfig.url,
              logo: `${siteConfig.url}${siteConfig.brand.logo}`,
              email: siteConfig.contactEmail,
              sameAs: [siteConfig.social.instagram, siteConfig.social.twitter].filter(Boolean),
              areaServed: siteConfig.locations.map((name) => ({ "@type": "Place", name })),
            },
            {
              "@type": "WebSite",
              "@id": `${siteConfig.url}/#website`,
              url: siteConfig.url,
              name: siteConfig.name,
              description: siteConfig.description,
              publisher: { "@id": `${siteConfig.url}/#organization` },
              inLanguage: "en",
            },
            {
              "@type": "SoftwareApplication",
              name: "AviatorPass",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              url: siteConfig.url,
              description: siteConfig.description,
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                priceCurrency: "USD",
              },
              featureList: [
                "ATPL theory courses",
                "Live Zoom instructor sessions",
                "Quizzes and progress tracking",
                "Guest booking with email confirmation",
              ],
            },
          ],
        }}
      />

      <section className="home-hero relative isolate -mt-[4.75rem] min-h-[100svh] overflow-hidden pt-[4.75rem]">
        <div className="hero-aviation absolute inset-0" />
        <div className="hero-horizon" aria-hidden />
        <div className="hero-vignette" aria-hidden />
        <div className="home-hero-atmosphere" aria-hidden>
          <div className="home-hero-stars" />
          <div className="home-hero-gold-wash" />
        </div>

        <div className="container-app relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-end pb-16 pt-20 sm:justify-center sm:pb-24">
          <p className="animate-in-up hero-brand font-display text-[clamp(3rem,11vw,7rem)] font-bold tracking-[0.02em]">
            <span className="hero-brand-aviator">AVIATOR</span>
            <span className="hero-brand-pass"> PASS</span>
          </p>

          <p className="animate-in-up-delay-1 mt-5 max-w-[28ch] text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/55 sm:text-[0.75rem]">
            Your aviation journey starts here
          </p>

          <h1 className="animate-in-up-delay-2 mt-10 max-w-[22ch] font-display text-[clamp(1.55rem,3.6vw,2.65rem)] font-semibold tracking-[-0.03em] leading-[1.12] text-white/94">
            Elevate aviation training to global standards of precision
          </h1>

          <p className="animate-in-up-delay-2 mt-5 max-w-md text-[1.02rem] leading-relaxed text-white/58 sm:text-lg">
            ATPL theory lanes and live Zoom coaching for pilots in{" "}
            {siteConfig.locations.join(" & ")}.
          </p>

          <div className="animate-in-up-delay-3 mt-12 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-9" asChild>
              <Link href="#courses">
                View courses
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-cta-secondary border-white/22 bg-white/[0.05] px-8 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.book}>Book live Zoom</Link>
            </Button>
          </div>
        </div>

        <a href="#courses" className="home-hero-descend">
          <span className="home-hero-descend-mark" aria-hidden />
          Courses below
        </a>
      </section>

      <HomeCoursesByInstructor />

      <section className="landing-close home-close relative overflow-hidden py-20 text-white sm:py-28">
        <div className="container-app relative z-10 text-center">
          <p className="landing-kicker mb-5 text-accent/70">Ready for takeoff</p>
          <h2 className="mx-auto max-w-[14ch] font-display text-[clamp(1.9rem,4.2vw,3.35rem)] font-semibold tracking-[-0.035em] leading-[1.06] text-white">
            Enter the platform when you are ready to climb
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/50">
            Enroll in a published lane, or book a live instructor session in GMT.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-10" asChild>
              <Link href={routes.login}>
                Enter AviatorPass
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.courses}>Full catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
