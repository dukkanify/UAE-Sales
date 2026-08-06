import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: {
    absolute: "ATPL PASS | Aviation Course Platform for ATPL Theory & Live Zoom",
  },
  description:
    "Train ATPL theory on ATPL PASS — structured courses, live Zoom coaching with instructors, quizzes, and exam mastery. Built for pilots in Kuwait and Dubai.",
  keywords: [
    "ATPL PASS",
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
    title: "ATPL PASS — Aviation course platform",
    description:
      "Structured ATPL coursework, live Zoom coaching, and exam mastery in one training OS.",
    url: "/",
    type: "website",
    images: [{ url: siteConfig.brand.openGraph, width: 1200, height: 630, alt: "ATPL PASS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATPL PASS — Aviation course platform",
    description:
      "Structured ATPL coursework, live Zoom coaching, and exam mastery in one training OS.",
    images: [siteConfig.brand.openGraph],
  },
};

const flightpath = [
  {
    code: "01",
    title: "Course engine",
    body: "ATPL theory modules, lessons, and resources sequenced like a real training syllabus — not a content dump.",
  },
  {
    code: "02",
    title: "Live Zoom lane",
    body: "Book private instructor sessions when you need them. Confirm by email and join from your training lobby.",
  },
  {
    code: "03",
    title: "Mastery loop",
    body: "Quizzes, progress, and certificates close the loop so every study hour moves you toward license readiness.",
  },
] as const;

export default function HomePage() {
  return (
    <>
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
              name: "ATPL PASS",
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
              name: "ATPL Theory Training on ATPL PASS",
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

      <section className="relative isolate min-h-[calc(100vh-4.5rem)] overflow-hidden">
        <div className="hero-aviation absolute inset-0" />
        <div className="hero-horizon" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[var(--surface-ink)]/25 to-transparent" />

        <div className="container-app relative z-10 flex min-h-[calc(100vh-4.5rem)] flex-col justify-end pb-16 pt-24 sm:justify-center sm:pb-28">
          <p className="animate-in-up hero-brand font-display text-[clamp(3.5rem,12vw,8.5rem)] font-bold">
            <span className="hero-brand-atpl">ATPL</span>{" "}
            <span className="hero-brand-pass">PASS</span>
          </p>
          <h1 className="animate-in-up-delay-1 mt-6 max-w-3xl font-display text-[clamp(1.5rem,3.5vw,2.75rem)] font-semibold tracking-tight text-white lg:leading-[1.12]">
            The aviation course platform for pilots who train like it&apos;s 2030
          </h1>
          <p className="animate-in-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Structured ATPL coursework, live Zoom coaching, and exam mastery — one flight-training
            OS, not a brochure site.
          </p>
          <div className="animate-in-up-delay-3 mt-10 flex flex-wrap gap-3">
            <Button size="lg" variant="accent" className="shadow-medium" asChild>
              <Link href={routes.login}>
                Enter platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white/12 hover:text-white"
              asChild
            >
              <Link href={routes.book}>Book live Zoom</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="flightpath"
        className="platform-surface content-auto border-b border-border/50 py-28"
      >
        <div className="container-app">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
            Flightpath
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            A training operating system — not a school website
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every layer is built for course progress: learn, book live help, prove mastery, repeat.
          </p>

          <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-12">
            {flightpath.map((item, index) => (
              <div
                key={item.code}
                className="platform-module"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <p className="flightpath-index font-display text-5xl font-bold tracking-tighter text-primary/25">
                  {item.code}
                </p>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="live"
        className="platform-band content-auto relative overflow-hidden py-28 text-white"
      >
        <div className="container-app relative z-10 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
              Live altitude
            </p>
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
              Instructor Zoom when your study hits turbulence
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Reserve a private session first — ATPL PASS creates your learner account when you
              confirm. Primary lanes: {siteConfig.locations.join(" · ")}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button size="lg" variant="accent" asChild>
              <Link href={routes.book}>
                Open booking studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.login}>Continue learning</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
