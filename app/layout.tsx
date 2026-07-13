import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { OfflineBanner } from "@/shared/components/OfflineBanner";
import { BrandJsonLd } from "@/shared/components/BrandJsonLd";
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
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getAppUrl();

export const metadata: Metadata = {
  description: BRAND.description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    apple: "/brand/app-icon.svg",
    icon: [
      { url: "/brand/logo-icon.svg", type: "image/svg+xml" },
      { url: "/brand/logo-icon.svg", sizes: "32x32" },
    ],
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
          <OfflineBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
