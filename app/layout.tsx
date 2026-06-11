import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAE Sales | سوق الإمارات للبيع والشراء",
  description:
    "منصة إعلانات مبوبة عربية في الإمارات مع حماية الدفع، المحفظة، الدردشة، وإدارة الإعلانات.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
