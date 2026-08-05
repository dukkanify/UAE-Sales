import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

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
      <section className="relative isolate min-h-[calc(100vh-4.5rem)] overflow-hidden">
        <div className="hero-aviation absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[var(--surface-ink)]/35 to-transparent" />

        <div className="container-app relative z-10 flex min-h-[calc(100vh-4.5rem)] flex-col justify-end pb-16 pt-24 sm:justify-center sm:pb-24">
          <p className="animate-in-up font-display text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="text-[#8ec4df]">ATPL</span> <span className="text-accent">PASS</span>
          </p>
          <h1 className="animate-in-up-delay-1 mt-6 max-w-3xl font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
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
        className="platform-surface content-auto border-b border-border/60 py-24"
      >
        <div className="container-app">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Flightpath
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A training operating system — not a school website
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Every layer is built for course progress: learn, book live help, prove mastery, repeat.
          </p>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
            {flightpath.map((item, index) => (
              <div
                key={item.code}
                className="platform-module"
                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
              >
                <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-accent">
                  {item.code}
                </p>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="live"
        className="platform-band content-auto relative overflow-hidden py-24 text-white"
      >
        <div className="container-app relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Live altitude
            </p>
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Instructor Zoom when your study hits turbulence
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
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
