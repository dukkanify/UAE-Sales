import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";
import { APP_METADATA } from "@/constants/navigation";

import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: APP_METADATA.title,
  description: APP_METADATA.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  keywords: [
    "ATPL PASS",
    "ATPL training",
    "aviation education",
    "pilot training",
    "Kuwait",
    "Dubai",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: APP_METADATA.title.default,
    description: APP_METADATA.description,
    images: [{ url: siteConfig.brand.openGraph, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_METADATA.title.default,
    description: APP_METADATA.description,
    images: [siteConfig.brand.openGraph],
  },
  icons: {
    icon: [{ url: siteConfig.brand.favicon, type: "image/svg+xml" }],
    apple: [{ url: siteConfig.brand.icon }],
  },
  alternates: {
    languages: { en: "/" },
  },
  other: {
    "content-language": "en",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${dmSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
