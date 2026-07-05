import type { Metadata } from "next";
import type { Category, Listing } from "@/types";

export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const siteName = "UAE Sales";

export function buildListingMetadata(listing: Listing): Metadata {
  const pageUrl = `${appUrl}/listings/${listing.slug}`;
  const description =
    listing.description.length > 160
      ? `${listing.description.slice(0, 157)}...`
      : listing.description;

  return {
    title: listing.title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "ar_AE",
      url: pageUrl,
      siteName,
      title: listing.title,
      description,
      ...(listing.imageUrl ? { images: [{ url: listing.imageUrl }] } : {}),
    },
    twitter: {
      card: listing.imageUrl ? "summary_large_image" : "summary",
      title: listing.title,
      description,
      ...(listing.imageUrl ? { images: [listing.imageUrl] } : {}),
    },
  };
}

export function buildCategoryMetadata(category: Category): Metadata {
  const pageUrl = `${appUrl}/categories/${category.slug}`;
  const description = `تصفح إعلانات ${category.name} في سوق الإمارات — بيع وشراء بثقة مع ضمان مالي.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "ar_AE",
      url: pageUrl,
      siteName,
      title: `${category.name} | ${siteName}`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${category.name} | ${siteName}`,
      description,
    },
  };
}

export const siteMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "UAE Sales | السوق الإماراتي الفاخر",
    template: "%s | UAE Sales",
  },
  description:
    "منصة إعلانات مبوبة فاخرة بهوية إماراتية — بيع وشراء بثقة مع ضمان مالي، محفظة آمنة، ودعم على مدار الساعة.",
  applicationName: siteName,
  keywords: [
    "إعلانات الإمارات",
    "سوق إماراتي",
    "بيع وشراء",
    "ضمان مالي",
    "سيارات الإمارات",
    "عقارات الإمارات",
  ],
  openGraph: {
    type: "website",
    locale: "ar_AE",
    url: appUrl,
    siteName,
    title: "UAE Sales | السوق الإماراتي الفاخر",
    description:
      "منصة إعلانات مبوبة فاخرة بهوية إماراتية — بيع وشراء بثقة مع ضمان مالي.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UAE Sales | السوق الإماراتي الفاخر",
    description:
      "منصة إعلانات مبوبة فاخرة بهوية إماراتية — بيع وشراء بثقة مع ضمان مالي.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
