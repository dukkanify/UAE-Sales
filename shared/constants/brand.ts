export const BRAND = {
  nameAr: "سوقنا",
  nameEn: "Sooqna",
  taglineAr: "كل ما تحتاجه... في مكان واحد",
  taglineEn: "Our Marketplace",
  description:
    "منصة سوق إماراتية موثوقة — بيع وشراء بثقة مع ضمان مالي، محفظة آمنة، ودعم على مدار الساعة.",
  copyright: "© 2026 سوقنا Sooqna. جميع الحقوق محفوظة.",
  domain: "sooqna.site",
} as const;

export const BRAND_COLORS = {
  navy: "#0B1628",
  navySoft: "#152238",
  gold: "#C9A962",
  goldLight: "#D4B87A",
  goldDark: "#9A7D4A",
  white: "#FAF9F7",
  surface: "#FFFFFF",
  green: "#2D6A4F",
  greenSoft: "#E8F3ED",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#3B82F6",
} as const;

export const STORAGE_EVENTS = {
  sessionChange: "sooqna-session-change",
  listingsChange: "sooqna-listings-change",
  recentlyViewedChange: "sooqna-recently-viewed-change",
  chatChange: "sooqna-chat-change",
} as const;

export const STORAGE_KEYS = {
  session: "sooqna-session",
  localListings: "sooqna-local-listings",
  recentlyViewed: "sooqna-recently-viewed",
  savedSearches: "sooqna-saved-searches",
  chatConversations: "sooqna-chat-conversations",
} as const;

/** Legacy keys migrated on read */
export const LEGACY_STORAGE_KEYS = {
  session: "uae-sales-session",
  localListings: "uae-sales-local-listings",
  recentlyViewed: "uae-sales-recently-viewed",
  savedSearches: "uae-sales-saved-searches",
} as const;
