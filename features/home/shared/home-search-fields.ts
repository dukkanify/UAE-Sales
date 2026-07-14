export const HOME_SEARCH_PRICE_OPTIONS = [
  { label: "أي سعر", value: "" },
  { label: "أقل من 50K", value: "0-50000" },
  { label: "50K – 200K", value: "50000-200000" },
  { label: "أكثر من 200K", value: "200000+" },
] as const;

export const HOME_SEARCH_LABELS = {
  category: "التصنيف",
  categoryAll: "كل التصنيفات",
  city: "الإمارة",
  cityAll: "كل الإمارات",
  price: "السعر AED",
  query: "ماذا تبحث عنه؟",
  queryPlaceholder: "سيارات، عقارات، إلكترونيات، خدمات...",
  submit: "بحث",
} as const;
