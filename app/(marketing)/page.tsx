import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeCoursesByInstructor } from "@/features/marketing/components/home-courses-by-instructor";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

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

const flightpath = [
  {
    code: "01",
    title: "Course engine",
    body: "ATPL theory modules sequenced like a real syllabus — lessons, resources, and progress in one lane.",
  },
  {
    code: "02",
    title: "Live Zoom lane",
    body: "Private instructor sessions on demand. Confirm by email, then join from your training lobby.",
  },
  {
    code: "03",
    title: "Mastery loop",
    body: "Quizzes, certificates, and proof of readiness — every hour of study moves the license forward.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="landing-root">
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
            {
              "@type": "Course",
              name: "ATPL Theory Training on AviatorPass",
              description:
                "Airline Transport Pilot License theory coursework with live instructor Zoom coaching.",
              provider: { "@id": `${siteConfig.url}/#organization` },
              educationalLevel: "Professional",
              inLanguage: "en",
              url: siteConfig.url,
            },
          ],
        }}
      />

      {/* 1 — Hero: brand-first full-bleed composition */}
      <section className="relative isolate -mt-[4.75rem] min-h-[100svh] overflow-hidden pt-[4.75rem]">
        <div className="hero-aviation absolute inset-0" />
        <div className="hero-horizon" aria-hidden />
        <div className="hero-vignette" aria-hidden />

        <div className="container-app relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-end pb-20 pt-16 sm:justify-center sm:pb-28">
          <p className="animate-in-up hero-brand font-display text-[clamp(2.75rem,10vw,6.5rem)] font-bold tracking-[0.02em]">
            <span className="hero-brand-aviator">AVIATOR</span>
            <span className="hero-brand-pass"> PASS</span>
          </p>

          <p className="animate-in-up-delay-1 mt-4 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/70 sm:text-xs">
            Your aviation journey starts here
          </p>

          <h1 className="animate-in-up-delay-1 mt-8 max-w-[18ch] font-display text-[clamp(1.7rem,3.9vw,3.15rem)] font-semibold tracking-[-0.032em] text-white sm:leading-[1.06]">
            Elevate aviation training to global standards of precision
          </h1>

          <p className="animate-in-up-delay-2 mt-5 max-w-lg text-[1.05rem] leading-relaxed text-white/68 sm:text-lg">
            ATPL theory, live Zoom coaching, and exam mastery — built for pilots in{" "}
            {siteConfig.locations.join(" & ")}.
          </p>

          <div className="animate-in-up-delay-3 mt-12 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-9" asChild>
              <Link href={routes.login}>
                Enter platform
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-cta-secondary border-white/25 bg-white/[0.06] px-8 text-white hover:bg-white/12 hover:text-white"
              asChild
            >
              <Link href="/#courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2 — Flightpath */}
      <section id="flightpath" className="platform-surface content-auto py-28 sm:py-36">
        <div className="container-app">
          <p className="landing-kicker mb-5 text-primary">Flightpath</p>
          <h2 className="max-w-[15ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
            Three altitudes. One training OS.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Learn, book live help, prove mastery — without the noise of a school brochure site.
          </p>

          <div className="landing-rule mt-14 mb-4 opacity-70" />

          <ol className="flightpath-spine mt-16 space-y-16 md:space-y-24">
            {flightpath.map((item, index) => (
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
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground md:max-w-sm md:inline-block">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 — Courses by instructor */}
      <HomeCoursesByInstructor />

      {/* 4 — Live: one job = book */}
      <section
        id="live"
        className="platform-band content-auto relative overflow-hidden py-28 text-white sm:py-36"
      >
        <div className="container-app relative z-10">
          <p className="landing-kicker mb-5 text-accent">Live altitude</p>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <h2 className="max-w-[13ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-semibold tracking-[-0.035em] leading-[1.05] text-white">
                Clear the turbulence with a live instructor
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/62 sm:text-lg">
                Reserve first. Confirm by email. AviatorPass opens your learner account the moment
                you book — then you join Zoom from the lobby.
              </p>
            </div>
            <Button
              size="lg"
              variant="accent"
              className="hero-cta-primary w-full justify-center sm:w-auto lg:w-full"
              asChild
            >
              <Link href={routes.book}>
                Open booking studio
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5 — Close: one job = enter */}
      <section className="landing-close relative overflow-hidden py-24 text-white sm:py-28">
        <div className="container-app relative z-10 text-center">
          <p className="landing-kicker mb-5 text-white/40">Ready for takeoff</p>
          <h2 className="mx-auto max-w-[16ch] font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold tracking-[-0.035em] leading-[1.06] text-white">
            Your next ATPL hour starts on the platform
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55">
            English-only. Built for serious pilots — not another course catalog.
          </p>
          <div className="mt-10 flex justify-center">
            <Button size="lg" variant="accent" className="hero-cta-primary px-10" asChild>
              <Link href={routes.login}>
                Enter AviatorPass
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
