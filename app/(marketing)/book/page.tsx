import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

import { BookStudioClient } from "./book-studio-client";

import "@/styles/booking.css";

export const metadata: Metadata = {
  title: "Private Session — Book one-to-one coaching",
  description:
    "Book a premium private session with a certified AviatorPass instructor. Coaching, mock exams, interview prep, and mentoring — standalone from the ATPL Program.",
  keywords: [
    "private aviation coaching",
    "ATPL mock exam",
    "pilot interview preparation",
    "AviatorPass private session",
    "Zoom mentoring",
  ],
  alternates: {
    canonical: routes.book,
  },
  openGraph: {
    title: "Private Session | AviatorPass",
    description:
      "Premium one-to-one sessions with certified instructors. Separate from the ATPL Program.",
    url: routes.book,
    type: "website",
    images: [
      {
        url: siteConfig.brand.openGraph,
        width: 1200,
        height: 630,
        alt: "AviatorPass private session booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Session | AviatorPass",
    description:
      "Premium one-to-one sessions with certified instructors. Separate from the ATPL Program.",
    images: [siteConfig.brand.openGraph],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicBookPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ReserveAction",
          name: "Book a private AviatorPass session",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}${routes.book}`,
            actionPlatform: [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform",
            ],
          },
          result: {
            "@type": "EducationEvent",
            name: "Private one-to-one aviation coaching session",
            eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
            location: {
              "@type": "VirtualLocation",
              url: `${siteConfig.url}${routes.book}`,
            },
            organizer: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
          },
        }}
      />
      <BookStudioClient />
    </>
  );
}
