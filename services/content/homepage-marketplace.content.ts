export type MarketHeroPreview = {
  category: string;
  city: string;
  href: string;
  id: string;
  imageUrl: string;
  price: number;
  title: string;
};

export type MarketTrustStat = {
  label: string;
  value: string;
};

const q = "auto=format&fit=crop&w=2000&q=92";

export async function getMarketHeroBackground(): Promise<string> {
  return `https://images.unsplash.com/photo-1518684079-3c830dcef090?${q}`;
}

export async function getMarketTrustStats(): Promise<MarketTrustStat[]> {
  return [
    { label: "إعلان نشط", value: "24,000+" },
    { label: "مستخدم موثق", value: "18,500+" },
    { label: "معاملة آمنة", value: "12,000+" },
    { label: "تقييم المنصة", value: "4.9" },
  ];
}

export async function getMarketQuickSearches() {
  return [
    { href: "/search?q=سيارات+دبي", label: "سيارات دبي" },
    { href: "/categories/real-estate", label: "عقارات للبيع" },
    { href: "/categories/mobiles", label: "آيفون مستعمل" },
    { href: "/categories/services", label: "خدمات أعمال" },
    { href: "/search?city=أبوظبي", label: "إعلانات أبوظبي" },
    { href: "/search?q=فيلا", label: "فلل فاخرة" },
  ];
}

export async function getMarketHeroPreviews(): Promise<MarketHeroPreview[]> {
  return [
    {
      id: "cars",
      category: "سيارات",
      city: "دبي مارينا، دبي",
      href: "/search?q=مرسيدس+G63",
      imageUrl: `https://images.unsplash.com/photo-1563720360172-1f859e989174?${q}`,
      price: 895000,
      title: "Mercedes-AMG G63 · 2024",
    },
    {
      id: "real-estate",
      category: "عقارات",
      city: "نخلة جميرا، دبي",
      href: "/search?q=فيلا+نخلة+جميرا",
      imageUrl: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${q}`,
      price: 18500000,
      title: "Villa Palm Jumeirah",
    },
    {
      id: "mobiles",
      category: "إلكترونيات",
      city: "الريم، أبوظبي",
      href: "/search?q=آيفون+16+برو",
      imageUrl: `https://images.unsplash.com/photo-1695048133142-1a20484d2569?${q}`,
      price: 4899,
      title: "iPhone 16 Pro Max · 256GB",
    },
    {
      id: "services",
      category: "خدمات",
      city: "دبي، الإمارات",
      href: "/categories/services",
      imageUrl: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?${q}`,
      price: 12000,
      title: "مكتب تجاري — Business Bay",
    },
  ];
}

export async function getMarketEmirateImages(): Promise<Record<string, string>> {
  return {
    dubai: `https://images.unsplash.com/photo-1518684079-3c830dcef090?${q}`,
    "abu-dhabi": `https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?${q}`,
    sharjah: `https://images.unsplash.com/photo-1582672060674-bc2bd808a8c5?${q}`,
    ajman: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${q}`,
    "ras-al-khaimah": `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?${q}`,
    fujairah: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?${q}`,
  };
}
