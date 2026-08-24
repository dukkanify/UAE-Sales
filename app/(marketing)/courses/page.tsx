import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { AtplProgramPageContent } from "@/features/marketing/components/atpl-program-page";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { getAtplProgramMarketing } from "@/lib/marketing/atpl-program-marketing";
import { listAtplSubjectModules } from "@/lib/marketing/atpl-subjects";

/** Cache program page briefly; publishes revalidate within a minute. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ATPL Program",
  description:
    "The ATPL PASS program — one enrollment, every ATPL theory subject, live instructor-led training, progress tracking, mock exams, and certificates. Competency-based, no fixed duration.",
  alternates: { canonical: routes.courses },
  openGraph: {
    title: "ATPL Program | ATPL PASS",
    description:
      "Complete ATPL preparation in one program — live training, all subjects included, competency-based progression.",
    url: routes.courses,
  },
};

export default function AtplProgramPage() {
  const subjects = listAtplSubjectModules();
  const { enrollHref, priceLabel } = getAtplProgramMarketing();

  return (
    <div className="landing-root home-premium">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "ATPL Program",
          description:
            "Complete Airline Transport Pilot License preparation with live instructor-led training, all ATPL subjects included, progress tracking, and competency-based progression.",
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          url: `${siteConfig.url}${routes.courses}`,
          courseMode: "Live Online",
          inLanguage: "en",
          hasCourseInstance: subjects.map((s) => ({
            "@type": "CourseInstance",
            name: s.title,
            courseCode: s.code,
          })),
        }}
      />

      <AtplProgramPageContent subjects={subjects} enrollHref={enrollHref} priceLabel={priceLabel} />
    </div>
  );
}
