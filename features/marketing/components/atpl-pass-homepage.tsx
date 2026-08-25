"use client";

import Link from "@/components/ui/app-link";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Headphones,
  Layers3,
  Mail,
  MonitorPlay,
  Radio,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ABOUT,
  CONTACT,
  FINAL_CTA,
  HERO,
  INSTRUCTORS,
  LEARNING_METHOD,
  PAYMENTS,
  PLATFORM_FEATURES,
  PROGRAM,
  WHY_CHOOSE,
} from "@/features/marketing/content/atpl-pass-home";
import { siteStatic } from "@/config/site-static";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [
  Video,
  Users,
  MonitorPlay,
  Zap,
  Layers3,
  Shield,
  BarChart3,
  Award,
  Radio,
  Headphones,
] as const;

const PLATFORM_ICONS = [
  Video,
  MonitorPlay,
  BarChart3,
  Award,
  GraduationCap,
  BookOpen,
  BookOpen,
  Shield,
  MonitorPlay,
] as const;

type AtplPassHomepageProps = {
  subjects: Array<{ code: string; title: string; shortDescription: string }>;
  enrollHref: string;
};

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="atpl-kicker">{children}</p>;
}

function AtplPassHomepage({ subjects, enrollHref }: AtplPassHomepageProps) {
  return (
    <>
      {/* —— Hero —— */}
      <section className="atpl-hero relative isolate -mt-[4.75rem] min-h-[100svh] overflow-hidden pt-[4.75rem]">
        <div
          className="atpl-hero-bg absolute inset-0"
          style={{
            backgroundImage:
              "url(/images/marketing/hero-aircraft.jpg), url(/images/marketing/hero-cockpit.jpg), url(/images/hero-aviation.svg)",
          }}
          aria-hidden
        />
        <div className="atpl-hero-overlay absolute inset-0" aria-hidden />
        <div className="atpl-hero-glow absolute inset-0" aria-hidden />

        <div className="container-app relative z-10 flex min-h-[calc(100svh-4.75rem)] flex-col justify-center pb-20 pt-16 sm:pb-28">
          <p className="animate-in-up atpl-hero-brand" aria-hidden>
            <span className="text-white">ATPL</span>
            <span className="atpl-hero-brand-pass"> PASS</span>
          </p>

          <p className="animate-in-up atpl-kicker atpl-kicker-hero mt-8">{HERO.kicker}</p>

          <h1 className="animate-in-up-delay-1 mt-5 max-w-[18ch] font-display text-[clamp(1.85rem,4.2vw,3.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white/96">
            {HERO.headline}
          </h1>

          <p className="animate-in-up-delay-2 mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-white/82 sm:text-lg">
            {HERO.subheadline}
          </p>

          <p className="animate-in-up-delay-2 mt-4 max-w-xl text-sm leading-relaxed text-white/65">
            {HERO.audience}
          </p>

          <div className="animate-in-up-delay-3 mt-12 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-9" asChild>
              <Link href={enrollHref}>
                {HERO.primaryCta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-cta-secondary border-white/25 bg-white/[0.06] px-8 text-white hover:bg-white/12 hover:text-white"
              asChild
            >
              <Link href={routes.courses}>{HERO.secondaryCta}</Link>
            </Button>
          </div>

          <div className="animate-in-up-delay-3 mt-14 flex flex-wrap gap-3">
            {PROGRAM.badges.map((badge) => (
              <span key={badge} className="atpl-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <a href="#about" className="home-hero-descend">
          <span className="home-hero-descend-mark" aria-hidden />
          Discover ATPL PASS
        </a>
      </section>

      {/* —— About —— */}
      <section
        id="about"
        className="atpl-section atpl-section-light atpl-section-about scroll-mt-28"
      >
        <div className="container-app">
          <SectionKicker>{ABOUT.kicker}</SectionKicker>
          <h2 className="atpl-heading mt-4 max-w-[18ch]">{ABOUT.title}</h2>

          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="atpl-prose-block">
                <h3 className="atpl-subheading">Who We Are</h3>
                <p>{ABOUT.whoWeAre}</p>
              </div>
              <div className="atpl-prose-block">
                <h3 className="atpl-subheading">Our Mission</h3>
                <p>{ABOUT.mission}</p>
              </div>
              <div className="atpl-prose-block">
                <h3 className="atpl-subheading">Our Vision</h3>
                <p>{ABOUT.vision}</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="atpl-prose-block">
                <h3 className="atpl-subheading">Our History</h3>
                <p>{ABOUT.history}</p>
              </div>
              <div>
                <h3 className="atpl-subheading mb-5">Our Values</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {ABOUT.values.map((v) => (
                    <div key={v.title} className="atpl-value-card">
                      <h4 className="font-display text-sm font-semibold text-[var(--landing-ink-soft)]">
                        {v.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="atpl-highlight-panel mt-16">
            <h3 className="atpl-subheading">Why Students Choose Us</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {ABOUT.whyChoose.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* —— Why Choose —— */}
      <section className="atpl-section atpl-section-dark">
        <div className="container-app">
          <SectionKicker>{WHY_CHOOSE.kicker}</SectionKicker>
          <h2 className="atpl-heading-light mt-4 max-w-[16ch]">{WHY_CHOOSE.title}</h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {WHY_CHOOSE.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]!;
              return (
                <article
                  key={f.title}
                  className="atpl-feature-card atpl-reveal"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="atpl-feature-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/58">{f.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— Platform Features —— */}
      <section className="atpl-section atpl-section-light">
        <div className="container-app">
          <SectionKicker>{PLATFORM_FEATURES.kicker}</SectionKicker>
          <h2 className="atpl-heading mt-4 max-w-[20ch]">{PLATFORM_FEATURES.title}</h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_FEATURES.items.map((item, i) => {
              const Icon = PLATFORM_ICONS[i % PLATFORM_ICONS.length]!;
              return (
                <article key={item.title} className="atpl-platform-card">
                  <Icon className="h-6 w-6 text-accent" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold text-[var(--landing-ink-soft)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— ATPL Program Preview —— */}
      <section id="program" className="atpl-section atpl-section-program scroll-mt-28">
        <div className="container-app">
          <SectionKicker>{PROGRAM.kicker}</SectionKicker>
          <h2 className="atpl-heading-light mt-4 max-w-[18ch]">{PROGRAM.title}</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">
            {PROGRAM.description}
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAM.includes.map((item) => (
              <div key={item} className="atpl-program-item">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary" asChild>
              <Link href={enrollHref}>
                Enroll in the ATPL Program
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.courses}>View Full Program Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— ATPL Subjects —— */}
      <section className="atpl-section atpl-section-light">
        <div className="container-app">
          <SectionKicker>Included Modules</SectionKicker>
          <h2 className="atpl-heading mt-4 max-w-[22ch]">
            Every ATPL subject, included in one program
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            All subjects below are modules within the ATPL Program — not separate products. Enroll
            once and access everything.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject, i) => (
              <article
                key={subject.code}
                className={cn("atpl-subject-card atpl-reveal")}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="atpl-subject-code">{subject.code}</span>
                <h3 className="mt-3 font-display text-base font-semibold text-[var(--landing-ink-soft)]">
                  {subject.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {subject.shortDescription}
                </p>
                <span className="atpl-subject-badge">Included in ATPL Program</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* —— Learning Method —— */}
      <section className="atpl-section atpl-section-accent">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <SectionKicker>{LEARNING_METHOD.kicker}</SectionKicker>
            <h2 className="atpl-heading mt-4">{LEARNING_METHOD.title}</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {LEARNING_METHOD.body}
            </p>
            <ul className="mt-10 grid gap-4 text-left sm:grid-cols-2">
              {LEARNING_METHOD.points.map((point) => (
                <li key={point} className="atpl-learning-point">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* —— Instructors —— */}
      <section id="instructors" className="atpl-section atpl-section-instructors scroll-mt-28">
        <div className="container-app">
          <SectionKicker>{INSTRUCTORS.kicker}</SectionKicker>
          <h2 className="atpl-heading-light mt-4 max-w-[20ch]">{INSTRUCTORS.title}</h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/62">
            {INSTRUCTORS.intro}
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {INSTRUCTORS.highlights.map((h) => (
              <article key={h.title} className="atpl-instructor-card">
                <h3 className="font-display text-base font-semibold text-white">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* —— Payments —— */}
      <section id="payments" className="atpl-section atpl-section-light scroll-mt-28">
        <div className="container-app">
          <SectionKicker>{PAYMENTS.kicker}</SectionKicker>
          <h2 className="atpl-heading mt-4 max-w-[18ch]">{PAYMENTS.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {PAYMENTS.intro}
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {PAYMENTS.regions.map((region) => (
              <div key={region.country} className="atpl-payment-region">
                <h3 className="font-display text-xl font-semibold text-[var(--landing-ink-soft)]">
                  {region.country}
                </h3>
                <div className="mt-6 space-y-4">
                  {region.methods.map((method) => (
                    <div key={method.name} className="atpl-payment-method">
                      <span className="atpl-payment-badge">{method.name}</span>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">{PAYMENTS.note}</p>
        </div>
      </section>

      {/* —— Contact —— */}
      <section id="contact" className="atpl-section atpl-section-contact scroll-mt-28">
        <div className="container-app text-center">
          <SectionKicker>{CONTACT.kicker}</SectionKicker>
          <h2 className="atpl-heading-light mt-4">{CONTACT.title}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60">
            {CONTACT.body}
          </p>
          <a href={`mailto:${siteStatic.supportEmail}`} className="atpl-contact-email">
            <Mail className="h-5 w-5 text-accent" aria-hidden />
            <span>{siteStatic.supportEmail}</span>
          </a>
        </div>
      </section>

      {/* —— Final CTA —— */}
      <section className="atpl-section atpl-section-final">
        <div className="container-app text-center">
          <SectionKicker>{FINAL_CTA.kicker}</SectionKicker>
          <h2 className="atpl-heading-light mx-auto mt-4 max-w-[16ch]">{FINAL_CTA.title}</h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55">
            {FINAL_CTA.body}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-10" asChild>
              <Link href={enrollHref}>
                {FINAL_CTA.primaryCta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.login}>{FINAL_CTA.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export { AtplPassHomepage };
