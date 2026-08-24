import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { AtplPassHomepage } from "@/features/marketing/components/atpl-pass-homepage";
import { siteConfig } from "@/config/site";
import { getAtplProgramMarketing } from "@/lib/marketing/atpl-program-marketing";
import { listAtplSubjectModules } from "@/lib/marketing/atpl-subjects";

/** Cache public marketing HTML briefly — catalog IDs are stable enough for short ISR. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "ATPL PASS | Premium Live ATPL Training Academy",
  },
  description:
    "ATPL PASS — premium live instructor-led Airline Transport Pilot License training. One unified ATPL Program with every subject, competency-based progression, and certified instructors in Kuwait and the UAE.",
  keywords: [
    "ATPL PASS",
    "ATPL training",
    "ATPL program",
    "airline transport pilot license",
    "live ATPL courses",
    "ATPL academy",
    "Kuwait pilot training",
    "UAE ATPL",
    "instructor-led aviation training",
    "competency-based ATPL",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ATPL PASS — Premium Live ATPL Training Academy",
    description:
      "One ATPL Program. Every subject. Live instructor-led training with competency-based progression.",
    url: "/",
    type: "website",
    images: [{ url: siteConfig.brand.openGraph, width: 1200, height: 630, alt: "ATPL PASS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATPL PASS — Premium Live ATPL Training Academy",
    description:
      "One ATPL Program. Every subject. Live instructor-led training with competency-based progression.",
    images: [siteConfig.brand.openGraph],
  },
};

export default function HomePage() {
  const subjects = listAtplSubjectModules();
  const { enrollHref } = getAtplProgramMarketing();

  return (
    <div className="landing-root home-premium">
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
              email: siteConfig.supportEmail,
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
              "@type": "Course",
              name: "ATPL Program",
              description:
                "Complete Airline Transport Pilot License preparation with live instructor-led training across all ATPL theory subjects.",
              provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
              url: `${siteConfig.url}/courses`,
              educationalLevel: "Professional",
              courseMode: "Live Online",
              inLanguage: "en",
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                category: "ATPL Training Program",
              },
            },
          ],
        }}
      />

      <AtplPassHomepage subjects={subjects} enrollHref={enrollHref} />
    </div>
  );
}
