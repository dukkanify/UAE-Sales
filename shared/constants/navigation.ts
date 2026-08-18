import { cities } from "@/shared/constants/locations";

export const primaryNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "التصنيفات", href: "/categories" },
  { label: "الضمان المالي", href: "/escrow" },
];

export const footerLinks = [
  {
    title: "السوق",
    links: [
      { label: "كل الإعلانات", href: "/search" },
      { label: "التصنيفات", href: "/categories" },
      { label: "الإعلانات المميزة", href: "/featured" },
      { label: "أضف إعلانك", href: "/listings/new" },
    ],
  },
  {
    title: "الإمارات",
    links: cities.map((city) => ({
      label: city.name,
      href: `/search?city=${encodeURIComponent(city.name)}`,
    })),
  },
  {
    title: "حسابك",
    links: [
      { label: "تسجيل الدخول", href: "/login" },
      { label: "إنشاء حساب", href: "/register" },
      { label: "إعلاناتي", href: "/dashboard/listings" },
    ],
  },
  {
    title: "الدعم والسياسات",
    links: [
      { label: "كيف يعمل الضمان", href: "/escrow" },
      { label: "تواصل معنا", href: "/support" },
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الخصوصية", href: "/privacy" },
    ],
  },
];
