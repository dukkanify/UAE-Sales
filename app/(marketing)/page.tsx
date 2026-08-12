import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
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

const gateways = [
  {
    href: routes.courses,
    kicker: "Courses",
    title: "ATPL lanes by instructor",
    body: "Published theory modules — open a lane for the full syllabus.",
  },
  {
    href: routes.flightpath,
    kicker: "Flightpath",
    title: "Three altitudes",
    body: "Course engine, live Zoom lane, and mastery loop — how training moves.",
  },
  {
    href: routes.live,
    kicker: "Live",
    title: "Instructor Zoom",
    body: "How live coaching works before you reserve a GMT window.",
  },
  {
    href: routes.book,
    kicker: "Book",
    title: "Booking studio",
    body: "Pick a session, instructor, and open GMT time — confirm by email.",
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
          ],
        }}
      />

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
              <Link href={routes.courses}>Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="platform-surface content-auto py-20 sm:py-28">
        <div className="container-app">
          <p className="landing-kicker text-primary">Platform map</p>
          <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(1.85rem,3.8vw,3rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
            Each destination is its own page
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Courses, flightpath, live coaching, and booking — open one route at a time.
          </p>

          <div className="landing-rule mt-12 opacity-70" />

          <ul className="mt-12 grid gap-10 sm:grid-cols-2">
            {gateways.map((item, index) => (
              <li
                key={item.href}
                className="animate-in-up border-t border-[rgb(18_36_51_/0.12)] pt-6"
                style={{ animationDelay: `${0.06 + index * 0.08}s` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {item.kicker}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl">
                  <Link href={item.href} className="transition hover:text-primary">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent/80"
                >
                  Open page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-close relative overflow-hidden py-20 text-white sm:py-24">
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
