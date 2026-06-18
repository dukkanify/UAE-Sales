import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAE Sales | السوق الإماراتي الآمن",
  description:
    "منصة إعلانات مبوبة بهوية إماراتية للبيع والشراء داخل الإمارات مع حماية الدفع، المحفظة، الدردشة، وإدارة الإعلانات.",
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
