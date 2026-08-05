import Link from "next/link";
import { ArrowRight, BookOpen, Plane, ShieldCheck, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";
import { routes } from "@/constants/routes";

const programs = [
  {
    icon: BookOpen,
    title: "Academic excellence",
    body: "Structured courses and assessments grounded in ATPL theory — clear, rigorous, exam-ready.",
  },
  {
    icon: Plane,
    title: "Live flight-path learning",
    body: "Instructor-led Zoom sessions, calendars, and progress tracking that keep training on course.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted operations",
    body: "Role-based access, secure sessions, and enterprise-ready controls for academies and cadets.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-4.5rem)] overflow-hidden">
        <div className="hero-aviation absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[var(--surface-ink)]/20 to-transparent" />

        <div className="container-app relative z-10 flex min-h-[calc(100vh-4.5rem)] flex-col justify-center py-20">
          <p className="animate-in-up mb-4 font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-[#7eb8d6]">ATPL</span> <span className="text-accent">PASS</span>
          </p>
          <p className="animate-in-up-delay-1 mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
            {brandingConfig.tagline}
          </p>
          <h1 className="animate-in-up-delay-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.5rem] lg:leading-tight">
            Aviation training designed for the next decade of pilots
          </h1>
          <p className="animate-in-up-delay-3 mt-5 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
            Book Zoom coaching instantly, train with precision coursework, and stay exam-ready — one
            modern platform for serious cadets.
          </p>
          <div className="animate-in-up-delay-4 mt-10 flex flex-wrap gap-3">
            <Button size="lg" variant="accent" className="shadow-medium" asChild>
              <Link href={routes.book}>
                Book a Zoom session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white/12 hover:text-white"
              asChild
            >
              <Link href={routes.login}>Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="programs" className="content-auto border-b border-border/70 py-24">
        <div className="container-app">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Programs
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Master your ATPL exams from anywhere
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            A focused learning system for serious cadets — coursework, live Zoom classes,
            assessments, and certification in one place.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {programs.map((item) => (
              <div key={item.title} className="group">
                <span className="inline-flex h-11 w-11 items-center justify-center text-primary transition-transform duration-300 group-hover:-translate-y-0.5">
                  <item.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="content-auto py-24">
        <div className="container-app grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              About
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Precision. Clarity. Authority.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              {siteConfig.legalName} bridges theoretical mastery and practical readiness. Primary
              locations: {siteConfig.locations.join(" and ")}. Training that reflects the discipline
              of aviation itself.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-ink)] p-8 text-white shadow-medium">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(46,125,170,0.35), transparent 55%)",
              }}
            />
            <div className="relative z-10">
              <Video className="mb-4 h-6 w-6 text-accent" strokeWidth={1.5} />
              <p className="font-display text-2xl font-semibold tracking-tight">
                Book first. Register later.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Reserve a private Zoom session in minutes — your account is created when you confirm
                by email.
              </p>
              <Button variant="accent" className="mt-6" asChild>
                <Link href={routes.book}>Start booking</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="content-auto border-t border-border/70 py-16">
        <div className="container-app flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold">Talk to us</h2>
            <p className="mt-2 text-muted-foreground">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-medium text-primary underline decoration-accent/60 underline-offset-4 hover:decoration-accent"
              >
                {siteConfig.contactEmail}
              </a>
              <span className="mx-2 text-border">·</span>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {siteConfig.socialHandle}
              </a>
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={routes.login}>Sign in to dashboard</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
