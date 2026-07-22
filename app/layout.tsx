import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { BrandJsonLd } from "@/shared/components/BrandJsonLd";
import { DeferredOfflineBanner } from "@/shared/components/DeferredOfflineBanner";
import { ToastProvider } from "@/shared/components/ToastProvider";
import { BRAND } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-ibm-plex-arabic",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
  weight: ["500", "700"],
});

const siteUrl = getAppUrl();

export const metadata: Metadata = {
  description: BRAND.description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    apple: "/apple-icon",
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    description: BRAND.description,
    images: [{ url: "/brand/og-image.svg", width: 1200, height: 630 }],
    locale: "ar_AE",
    siteName: BRAND.nameEn,
    title: `${BRAND.nameEn} | ${BRAND.nameAr}`,
    type: "website",
    url: siteUrl,
  },
  title: {
    default: `${BRAND.nameEn} | ${BRAND.nameAr}`,
    template: `%s | ${BRAND.nameEn}`,
  },
  twitter: {
    card: "summary_large_image",
    description: BRAND.description,
    images: ["/brand/og-image.svg"],
    title: `${BRAND.nameEn} | ${BRAND.nameAr}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${ibmPlexArabic.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      dir="rtl"
      lang="ar"
    >
      <body className={ibmPlexArabic.className}>
        <ToastProvider>
          <BrandJsonLd />
          <DeferredOfflineBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
