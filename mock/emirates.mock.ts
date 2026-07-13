import type { HomeCityHighlight } from "@/types";

/** @deprecated Prefer getEmirateListingHighlights() from catalog-metrics for live counts */
export const mockEmirateHighlights: HomeCityHighlight[] = [
  { cityId: "dubai", listingCount: 0 },
  { cityId: "abu-dhabi", listingCount: 0 },
  { cityId: "sharjah", listingCount: 0 },
  { cityId: "ajman", listingCount: 0 },
  { cityId: "umm-al-quwain", listingCount: 0 },
  { cityId: "rak", listingCount: 0 },
  { cityId: "fujairah", listingCount: 0 },
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
    categoryId: "mobiles",
    description: "هواتف وأجهزة لوحية ولابتوبات مع ضمان وفحص قبل الشراء.",
    eyebrow: "Mobiles",
    title: "موبايلات وإلكترونيات محمولة",
    variant: "sand" as const,
  },
  {
    categoryId: "electronics",
    description: "إلكترونيات حديثة مع ضمان مالي وتوثيق للبائعين.",
    eyebrow: "Electronics",
    title: "إلكترونيات موثوقة",
    variant: "white" as const,
  },
  {
    categoryId: "furniture",
    description: "أثاث منزلي ومكتبي بحالة ممتازة مع توصيل داخل الإمارات.",
    eyebrow: "Furniture",
    title: "أثاث ومنزل",
    variant: "sand" as const,
  },
  {
    categoryId: "fashion",
    description: "ساعات وحقائب وعطور أصلية من بائعين موثوقين.",
    eyebrow: "Fashion",
    title: "أزياء وإكسسوارات",
    variant: "white" as const,
  },
  {
    categoryId: "services",
    description: "خدمات منزلية وتجارية مع تقييمات عالية واستجابة سريعة.",
    eyebrow: "Services",
    title: "خدمات في الإمارات",
    variant: "sand" as const,
  },
  {
    categoryId: "pets",
    description: "حيوانات أليفة ومستلزماتها من مربّين وبائعين موثوقين.",
    eyebrow: "Pets",
    title: "حيوانات أليفة",
    variant: "white" as const,
  },
  {
    categoryId: "jobs",
    description: "فرص عمل في دبي وأبوظبي والشارقة مع تفاصيل الراتب والمتطلبات.",
    eyebrow: "Jobs",
    title: "وظائف شاغرة",
    variant: "sand" as const,
  },
  {
    categoryId: "kids",
    description: "عربات أطفال، ألعاب، ومستلزمات بحالة ممتازة.",
    eyebrow: "Kids",
    title: "مستلزمات الأطفال",
    variant: "white" as const,
  },
  {
    categoryId: "books",
    description: "كتب عربية، جامعية، وتحضير اختبارات من بائعين موثوقين.",
    eyebrow: "Books",
    title: "كتب ومناهج",
    variant: "sand" as const,
  },
  {
    categoryId: "sports",
    description: "معدات رياضية وتخييم ولياقة منزليّة.",
    eyebrow: "Sports",
    title: "رياضة وتخييم",
    variant: "white" as const,
  },
  {
    categoryId: "food",
    description: "تمور، ضيافة، وأكلات منزلية إماراتية طازجة.",
    eyebrow: "Food",
    title: "طعام وضيافة",
    variant: "sand" as const,
  },
];
