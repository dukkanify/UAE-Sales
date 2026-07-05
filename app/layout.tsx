import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { OfflineBanner } from "@/shared/components/OfflineBanner";
import { JsonLd } from "@/shared/components/JsonLd";
import { appUrl, siteMetadata } from "@/lib/seo/metadata";
import { buildOrganizationJsonLd } from "@/lib/seo/structured-data";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={tajawal.variable} lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <JsonLd data={buildOrganizationJsonLd(appUrl)} />
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
