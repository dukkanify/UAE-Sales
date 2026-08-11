import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Layers3,
  PlayCircle,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { applyDueScheduledPublishes, getCourseDetail } from "@/services/courses/course-service";
import { isCoursePubliclyListed } from "@/services/courses/publishing";
import { getJourneyObjectives } from "@/services/journeys/customer-journey-catalog";
import { listProducts } from "@/services/payments/catalog-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { formatMinor } from "@/services/payments/money";

type PageProps = { params: Promise<{ id: string }> };

function resolvePublicCourse(id: string) {
  applyDueScheduledPublishes();
  const course = getCourseDetail(id);
  if (!course || !isCoursePubliclyListed(course)) return null;
  return course;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = resolvePublicCourse(id);
  if (!course) {
    return { title: "Course not found" };
  }
  return {
    title: course.title,
    description: course.shortDescription || course.fullDescription.slice(0, 160),
    alternates: { canonical: `${routes.courses}/${course.id}` },
  };
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = resolvePublicCourse(id);
  if (!course) notFound();

  const hours = Math.max(1, Math.round(course.estimatedDurationMinutes / 60));
  const lessonTotal =
    course.counts.lessons || course.modules.reduce((n, m) => n + m.lessons.length, 0);
  ensurePaymentsSeeded();
  const product = listProducts({ activeOnly: true, courseId: course.id })[0] ?? null;
  const objectives = getJourneyObjectives(course);
  const instructorLabel =
    (typeof course.metadata?.instructorDisplayName === "string" &&
      course.metadata.instructorDisplayName) ||
    course.primaryInstructorName ||
    "Captain Abdulaziz Alshoail";
  const deliveryLabel = course.deliveryType === "live" ? "Live Online" : "Recorded";
  const languageLabel =
    course.language === "en/ar"
      ? "Arabic / English"
      : course.language === "ar"
        ? "Arabic"
        : "English";
  const enrollHref = product ? `/student/checkout?productId=${product.id}` : routes.register;
  const programWeeks =
    typeof course.metadata?.programWeeks === "number" ? course.metadata.programWeeks : null;
  const lectureCount =
    typeof course.metadata?.lectureCount === "number" ? course.metadata.lectureCount : null;

  return (
    <div className="platform-altitude landing-root">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDescription || course.fullDescription,
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          url: `${siteConfig.url}${routes.courses}/${course.id}`,
          inLanguage: course.language || "en",
        }}
      />

      <section className="catalog-page-hero text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[var(--surface-ink)]/85 to-[var(--surface-ink)]/55" />
        <div className="container-app relative z-10 py-14 sm:py-20">
          <Link
            href={routes.courses}
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Link>

          <p className="landing-kicker mt-8 text-accent">AviatorPass course</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
            <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-white">
              {DIFFICULTY_LABELS[course.difficulty]}
            </span>
            {course.code ? <span className="text-accent/90">{course.code}</span> : null}
            {course.categoryName ? <span>{course.categoryName}</span> : null}
          </div>

          <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.1rem,4.8vw,3.6rem)] font-semibold tracking-[-0.035em] leading-[1.05] text-white">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
            {course.shortDescription || course.fullDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-accent/80" />
              {hours} study hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="h-4 w-4 text-accent/80" />
              {deliveryLabel}
              {lectureCount ? ` · ${lectureCount} lectures` : ` · ${course.counts.modules} modules`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-accent/80" />
              {languageLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-accent/80" />
              {instructorLabel}
            </span>
            {product ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-accent">
                {formatMinor(product.priceAmount, product.currency)}
              </span>
            ) : null}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" className="hero-cta-primary" asChild>
              <Link href={enrollHref}>
                Enroll in course
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            {course.deliveryType === "live" ? (
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href={routes.book}>Book live Zoom</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href={routes.login}>Enter My Courses</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container-app py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.45fr_0.55fr] lg:gap-14">
          <div>
            <p className="landing-kicker text-primary">Overview</p>
            <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-semibold tracking-[-0.03em] text-foreground">
              About this course
            </h2>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
              {course.fullDescription || course.shortDescription}
            </p>

            {objectives.length > 0 ? (
              <div className="mt-10">
                <p className="landing-kicker text-primary">Objectives</p>
                <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
                  {objectives.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {course.modules.length > 0 ? (
              <div className="mt-14">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="landing-kicker text-primary">Flightpath</p>
                    <h3 className="mt-3 font-display text-[clamp(1.45rem,2.6vw,1.9rem)] font-semibold tracking-[-0.03em] text-foreground">
                      Syllabus
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      Modules sequenced for ATPL readiness — open a block to see every lesson in the
                      lane.
                    </p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {course.modules.length} modules · {lessonTotal} lessons
                  </p>
                </div>

                <div className="landing-rule mt-8 opacity-60" />

                <ol className="flightpath-spine mt-10 space-y-8">
                  {course.modules.map((mod, index) => {
                    const minutes =
                      mod.estimatedDurationMinutes ||
                      mod.lessons.reduce((n, l) => n + (l.durationMinutes || 0), 0);
                    return (
                      <li key={mod.id} className="flightpath-node">
                        <article
                          className={cn(
                            "overflow-hidden rounded-[1.35rem] border border-[rgb(18_36_51_/0.1)] bg-white/75 shadow-[0_22px_50px_-40px_rgba(11,26,36,0.55)] backdrop-blur-sm",
                          )}
                        >
                          <div className="flex flex-col gap-3 border-b border-[rgb(18_36_51_/0.08)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                Module {String(index + 1).padStart(2, "0")}
                              </p>
                              <h4 className="mt-2 font-display text-xl font-semibold tracking-[-0.025em] text-foreground">
                                {mod.title}
                              </h4>
                              {mod.description ? (
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                  {mod.description}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs font-medium text-muted-foreground sm:justify-end">
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-primary/70" />
                                {mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}
                              </span>
                              {minutes > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock3 className="h-3.5 w-3.5 text-primary/70" />~
                                  {Math.max(1, Math.round(minutes / 60))}h
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {mod.lessons.length > 0 ? (
                            <ul className="divide-y divide-[rgb(18_36_51_/0.07)]">
                              {mod.lessons.map((lesson, lessonIndex) => (
                                <li
                                  key={lesson.id}
                                  className="flex items-start gap-3 px-5 py-3.5 sm:px-6"
                                >
                                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgb(18_36_51_/0.06)] text-[11px] font-semibold tabular-nums text-foreground/70">
                                    {index + 1}.{lessonIndex + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground">{lesson.title}</p>
                                    {lesson.description ? (
                                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                        {lesson.description}
                                      </p>
                                    ) : null}
                                  </div>
                                  <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                                    <PlayCircle className="h-3.5 w-3.5 text-accent/80" />
                                    {lesson.durationMinutes
                                      ? `${lesson.durationMinutes} min`
                                      : "Lesson"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="px-5 py-4 text-sm text-muted-foreground sm:px-6">
                              Lessons for this module will appear after publish.
                            </p>
                          )}
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[1.5rem] border border-[rgb(18_36_51_/0.1)] bg-[var(--surface-ink)] text-white shadow-[0_28px_70px_-42px_rgba(3,8,12,0.8)]">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/40" />
              <div className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                  Start learning
                </p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em]">
                  {product ? formatMinor(product.priceAmount, product.currency) : "Enroll"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {deliveryLabel} lane with currency choice at checkout (full, installments 4/5/6,
                  Tabby in Kuwait, or Tamara in UAE).
                </p>

                <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/50">Delivery</dt>
                    <dd className="font-medium text-white">{deliveryLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/50">Study load</dt>
                    <dd className="font-medium text-white">{hours} hours</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/50">Language</dt>
                    <dd className="font-medium text-white">{languageLabel}</dd>
                  </div>
                  {programWeeks ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-white/50">Program</dt>
                      <dd className="font-medium text-white">{programWeeks} weeks</dd>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/50">Instructor</dt>
                    <dd className="truncate font-medium text-white">{instructorLabel}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col gap-3">
                  <Button variant="accent" className="hero-cta-primary w-full" asChild>
                    <Link href={enrollHref}>
                      <GraduationCap className="h-4 w-4" />
                      Enroll in course
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href={routes.login}>Already have access? Enter</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-white/70 hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href={routes.register}>
                      Create student account
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
