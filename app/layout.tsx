import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { BrandJsonLd } from "@/shared/components/BrandJsonLd";
import { DeferredOfflineBanner } from "@/shared/components/DeferredOfflineBanner";
import { NotificationPushRegistrar } from "@/features/notifications/NotificationPushRegistrar";
import { MaintenanceGate } from "@/shared/components/MaintenanceGate";
import { ToastProvider } from "@/shared/components/ToastProvider";
import { BRAND } from "@/shared/constants/brand";
import { getAppUrl } from "@/shared/constants/site";
import { LiveLocalizer } from "@/shared/i18n/LiveLocalizer";
import { LocaleProvider } from "@/shared/i18n/useLocale";
import { getRequestLocale, LOCALE_BOOT_SCRIPT } from "@/shared/i18n/locale";
import { THEME_BOOT_SCRIPT } from "@/shared/theme/theme";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-ibm-plex-arabic",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
  weight: ["700"],
});

const siteUrl = getAppUrl();

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const description = locale === "en" ? BRAND.descriptionEn : BRAND.description;
  const title = `${BRAND.nameEn} | ${BRAND.nameAr}`;
  return {
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    icons: {
      apple: "/apple-icon",
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      description,
      images: [{ url: "/brand/og-image.svg", width: 1200, height: 630 }],
      locale: locale === "en" ? "en_AE" : "ar_AE",
      siteName: BRAND.nameEn,
      title,
      type: "website",
      url: siteUrl,
    },
    title: {
      default: title,
      template: `%s | ${BRAND.nameEn}`,
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: ["/brand/og-image.svg"],
      title,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html
      className={`${ibmPlexArabic.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      dir={locale === "en" ? "ltr" : "rtl"}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
      </head>
      <body className={ibmPlexArabic.className}>
        <LocaleProvider initialLocale={locale}>
          <LiveLocalizer />
          <ToastProvider>
            <NotificationPushRegistrar />
            <BrandJsonLd />
            <DeferredOfflineBanner />
            <MaintenanceGate>{children}</MaintenanceGate>
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
