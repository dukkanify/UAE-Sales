import { cities } from "@/shared/constants/locations";

export const primaryNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "التصنيفات", href: "/categories" },
  { label: "الضمان المالي", href: "/escrow" },
];

/** Display order for footer emirates (Al Ain is not in the current catalog). */
const FOOTER_EMIRATE_ORDER = [
  "dubai",
  "abu-dhabi",
  "sharjah",
  "ajman",
  "ras-al-khaimah",
  "fujairah",
  "umm-al-quwain",
] as const;

const footerCompanyLinks = [
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/support" },
  { label: "مركز المساعدة", href: "/help" },
  { label: "الأمان", href: "/safety" },
  { label: "الشروط والأحكام", href: "/terms" },
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "سياسة الضمان المالي", href: "/escrow-policy" },
  { label: "سياسة النزاعات", href: "/dispute-policy" },
] as const;

const footerCategoryLinks = [
  { label: "السيارات", href: "/categories/cars" },
  { label: "العقارات", href: "/categories/real-estate" },
  { label: "الإلكترونيات", href: "/categories/electronics" },
  { label: "الموبايلات", href: "/categories/mobiles" },
  { label: "الوظائف", href: "/categories/jobs" },
  { label: "الخدمات", href: "/categories/services" },
] as const;

const cityById = new Map(cities.map((city) => [city.id, city]));

const footerEmirateLinks = FOOTER_EMIRATE_ORDER.flatMap((id) => {
  const city = cityById.get(id);
  if (!city) return [];
  return [{ label: city.name, href: `/search?city=${encodeURIComponent(city.name)}` }];
});

export const footerLinks = [
  { title: "سوقنا", links: [...footerCompanyLinks] },
  { title: "الإمارات", links: footerEmirateLinks },
  { title: "الأقسام", links: [...footerCategoryLinks] },
];
