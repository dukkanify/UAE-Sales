import type { Metadata, Viewport } from "next";
import { Exo_2, IBM_Plex_Sans } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";
import { APP_METADATA } from "@/constants/navigation";

import "@/styles/globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Wide aerodynamic display face — Stimulatio Flat web substitute */
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-exo-2",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: APP_METADATA.title,
  description: APP_METADATA.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "education",
  keywords: [
    "AviatorPass",
    "ATPL training",
    "ATPL theory",
    "aviation education",
    "pilot training",
    "airline transport pilot license",
    "Zoom instructor coaching",
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
    icon: [
      { url: siteConfig.brand.favicon, type: "image/svg+xml" },
      { url: siteConfig.brand.icon, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: siteConfig.brand.appleTouchIcon || siteConfig.brand.icon, sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
    languages: { en: "/" },
  },
  other: {
    "content-language": "en",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#143048" },
    { media: "(prefers-color-scheme: dark)", color: "#0D2235" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
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
      className={`${ibmPlex.variable} ${exo2.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
