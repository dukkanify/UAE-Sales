import Link from "@/components/ui/app-link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LEARNING_METHOD, PAYMENTS, PROGRAM } from "@/features/marketing/content/atpl-pass-home";
import { routes } from "@/constants/routes";

type AtplProgramPageProps = {
  subjects: Array<{ code: string; title: string; shortDescription: string }>;
  enrollHref: string;
  priceLabel: string | null;
};

function AtplProgramPageContent({ subjects, enrollHref, priceLabel }: AtplProgramPageProps) {
  return (
    <>
      <section className="atpl-program-hero relative isolate overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url(/images/marketing/hero-aircraft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--landing-ink)]/80 via-[var(--landing-ink)]/90 to-[var(--landing-ink)]"
          aria-hidden
        />
        <div className="container-app relative z-10 py-20 sm:py-28 lg:py-32">
          <p className="atpl-kicker atpl-kicker-hero">ATPL Program</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.06] tracking-[-0.035em] text-white">
            One program. Complete ATPL preparation.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
            {PROGRAM.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {PROGRAM.badges.map((badge) => (
              <span key={badge} className="atpl-badge">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="accent" className="hero-cta-primary px-10" asChild>
              <Link href={enrollHref}>
                Enroll Now
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            {priceLabel ? (
              <p className="text-sm font-medium text-white/70">
                From <span className="text-accent">{priceLabel}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="atpl-section atpl-section-light">
        <div className="container-app">
          <h2 className="atpl-heading max-w-[20ch]">What you receive</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Competency-based training — no fixed timelines. Progress at the pace your instructor
            guides, with continuous assessment and live instruction throughout.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAM.includes.map((item) => (
              <div key={item} className="atpl-program-detail-item">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="atpl-section atpl-section-accent">
        <div className="container-app">
          <h2 className="atpl-heading">{LEARNING_METHOD.title}</h2>
          <p className="mt-5 max-w-2xl text-muted-foreground">{LEARNING_METHOD.body}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {LEARNING_METHOD.points.map((point) => (
              <li key={point} className="atpl-learning-point">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <span className="text-sm font-medium leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="atpl-section atpl-section-light">
        <div className="container-app">
          <h2 className="atpl-heading max-w-[22ch]">ATPL subjects included in your enrollment</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every subject below is a module within the ATPL Program. One enrollment unlocks all
            modules — no separate purchases required.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <article key={subject.code} className="atpl-subject-card">
                <span className="atpl-subject-code">{subject.code}</span>
                <h3 className="mt-3 font-display text-base font-semibold text-[var(--landing-ink-soft)]">
                  {subject.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {subject.shortDescription}
                </p>
                <span className="atpl-subject-badge">Included</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="atpl-section atpl-section-light">
        <div className="container-app">
          <h2 className="atpl-heading">{PAYMENTS.title}</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{PAYMENTS.intro}</p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
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
        </div>
      </section>

      <section className="atpl-section atpl-section-final">
        <div className="container-app text-center">
          <h2 className="atpl-heading-light mx-auto max-w-[18ch]">
            Ready to enroll in the ATPL Program?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-white/55">
            Start your journey with live instructor-led training and access to every ATPL subject.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" className="hero-cta-primary px-10" asChild>
              <Link href={enrollHref}>
                Enroll in ATPL Program
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link href={routes.home}>Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export { AtplProgramPageContent };
