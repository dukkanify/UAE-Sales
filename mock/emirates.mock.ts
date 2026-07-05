import type { HomeCityHighlight } from "@/types";

export const mockEmirateHighlights: HomeCityHighlight[] = [
  { cityId: "dubai", listingCount: 9840 },
  { cityId: "abu-dhabi", listingCount: 5620 },
  { cityId: "sharjah", listingCount: 3180 },
  { cityId: "ajman", listingCount: 1240 },
  { cityId: "rak", listingCount: 890 },
  { cityId: "fujairah", listingCount: 620 },
];

export const mockHomeCategorySections = [
  {
    categoryId: "cars",
    description: "سيارات فاخرة ومستعملة من معارض موثوقة في دبي وأبوظبي.",
    eyebrow: "Cars",
    title: "سيارات في الإمارات",
    variant: "sand" as const,
  },
  {
    categoryId: "real-estate",
    description: "شقق، فلل، ومكاتب للبيع والإيجار في أرقى مناطق الإمارات.",
    eyebrow: "Real Estate",
    title: "عقارات مميزة",
    variant: "white" as const,
  },
  {
    categoryId: "electronics",
    description: "إلكترونيات حديثة مع ضمان مالي وتوثيق للبائعين.",
    eyebrow: "Electronics",
    title: "إلكترونيات موثوقة",
    variant: "sand" as const,
  },
];
