import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { OfflineBanner } from "@/shared/components/OfflineBanner";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "UAE Sales | السوق الإماراتي الفاخر",
  description:
    "منصة إعلانات مبوبة فاخرة بهوية إماراتية — بيع وشراء بثقة مع ضمان مالي، محفظة آمنة، ودعم على مدار الساعة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={tajawal.variable} lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
