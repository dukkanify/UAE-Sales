import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

import { BookStudioClient } from "./book-studio-client";

import "@/styles/booking.css";

export const metadata: Metadata = {
  title: "Book live Zoom ATPL coaching",
  description:
    "Reserve a private live Zoom session with an AviatorPass instructor. Confirm by email — your learner account is created when you book.",
  keywords: [
    "book ATPL Zoom",
    "live pilot coaching",
    "ATPL instructor session",
    "aviation mentoring",
    "AviatorPass booking",
  ],
  alternates: {
    canonical: routes.book,
  },
  openGraph: {
    title: "Book live Zoom | AviatorPass",
    description:
      "Reserve private ATPL coaching on Zoom. Confirm by email and join from your training lobby.",
    url: routes.book,
    type: "website",
    images: [
      { url: siteConfig.brand.openGraph, width: 1200, height: 630, alt: "AviatorPass booking" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book live Zoom | AviatorPass",
    description:
      "Reserve private ATPL coaching on Zoom. Confirm by email and join from your training lobby.",
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
          name: "Book live Zoom ATPL coaching",
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
            name: "Private ATPL Zoom coaching session",
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
