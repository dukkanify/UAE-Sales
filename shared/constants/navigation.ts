export const primaryNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "التصنيفات", href: "/categories" },
  { label: "أضف إعلانك", href: "/listings/new" },
  { label: "الضمان المالي", href: "/escrow" },
];

export const footerLinks = [
  {
    title: "السوق",
    links: [
      { label: "كل الإعلانات", href: "/search" },
      { label: "التصنيفات", href: "/categories" },
      { label: "الإعلانات المميزة", href: "/featured" },
    ],
  },
  {
    title: "حسابك",
    links: [
      { label: "تسجيل الدخول", href: "/login" },
      { label: "إعلاناتي", href: "/dashboard/listings" },
      { label: "المحفظة", href: "/wallet" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { label: "كيف يعمل الضمان", href: "/escrow" },
      { label: "فتح نزاع", href: "/disputes/new" },
      { label: "تواصل معنا", href: "/support" },
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "سياسة الضمان", href: "/escrow-policy" },
      { label: "سياسة الاسترداد", href: "/refund-policy" },
      { label: "نصائح الأمان", href: "/safety" },
      { label: "اتصل بنا", href: "/contact" },
    ],
  },
];
