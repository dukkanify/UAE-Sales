import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { getCourseDetail } from "@/services/courses/course-service";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseDetail(id);
  if (!course || course.status !== "published") {
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
  const course = getCourseDetail(id);
  if (!course || course.status !== "published") notFound();

  const hours = Math.max(1, Math.round(course.estimatedDurationMinutes / 60));

  return (
    <div className="platform-surface">
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

      <section className="relative overflow-hidden border-b border-border/50 bg-[var(--surface-ink)] text-white">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-ink)] via-[var(--surface-ink)]/80 to-[var(--surface-ink)]/50" />
        <div className="container-app relative z-10 py-14 sm:py-20">
          <Link
            href={routes.courses}
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge className="border-white/20 bg-white/10 text-white">
              {DIFFICULTY_LABELS[course.difficulty]}
            </Badge>
            {course.categoryName ? (
              <span className="text-xs uppercase tracking-[0.18em] text-white/50">
                {course.categoryName}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {course.shortDescription || course.fullDescription}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />~{hours} study hours
            </span>
            <span>
              {course.counts.modules} modules · {course.counts.lessons} lessons
            </span>
            {course.primaryInstructorName ? (
              <span>Instructor: {course.primaryInstructorName}</span>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" asChild>
              <Link href={routes.register}>Join to enroll</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={routes.book}>Book live Zoom</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-app py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              About this course
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {course.fullDescription || course.shortDescription}
            </p>
            {course.modules.length > 0 ? (
              <div className="mt-10">
                <h3 className="font-display text-xl font-semibold tracking-tight">Syllabus</h3>
                <ol className="mt-5 space-y-4">
                  {course.modules.map((mod, index) => (
                    <li
                      key={mod.id}
                      className="rounded-2xl border border-border/60 bg-card/70 px-5 py-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Module {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 font-medium text-foreground">{mod.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
          <aside className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              Start learning
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Create a learner account to enroll, track progress, and book instructor Zoom sessions
              when you need help.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="accent" asChild>
                <Link href={routes.register}>Create student account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={routes.login}>Already have access? Enter</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
