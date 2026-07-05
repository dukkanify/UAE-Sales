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

export type MarketEscrowStep = {
  description: string;
  icon: string;
  title: string;
};

import {
  getEmirateImageUrl,
  heroBackgroundUrl,
  unsplashUrl,
} from "@/shared/constants/image-fallbacks";

export async function getMarketHeroBackground(): Promise<string> {
  return heroBackgroundUrl;
}

export async function getMarketTrustStats(): Promise<MarketTrustStat[]> {
  return [
    { label: "إعلان نشط", value: "24,864" },
    { label: "مستخدم موثق", value: "18,542" },
    { label: "معاملة آمنة", value: "12,413" },
    { label: "تقييم المنصة", value: "4.8/5" },
  ];
}

export async function getMarketQuickSearches() {
  return [
    { href: "/search?q=Mercedes", label: "Mercedes" },
    { href: "/search?q=Patrol", label: "Patrol" },
    { href: "/search?q=نخلة+جميرا", label: "Palm Jumeirah" },
    { href: "/search?q=داون+تاون", label: "Downtown Dubai" },
    { href: "/search?q=شقة", label: "Apartment" },
    { href: "/search?q=فيلا", label: "Villa" },
    { href: "/search?q=iPhone", label: "iPhone" },
    { href: "/listings/office-business-bay", label: "Office" },
    { href: "/search?q=MacBook", label: "MacBook" },
    { href: "/search?q=Land+Cruiser", label: "Land Cruiser" },
  ];
}

export async function getMarketEscrowSteps(): Promise<MarketEscrowStep[]> {
  return [
    {
      icon: "wallet",
      title: "حجز المبلغ",
      description: "يُحجز المبلغ بأمان في محفظة الضمان حتى اكتمال الصفقة.",
    },
    {
      icon: "package",
      title: "تسليم المنتج",
      description: "البائع يسلّم المنتج أو ينفّذ الخدمة حسب الاتفاق.",
    },
    {
      icon: "check",
      title: "تأكيد الاستلام",
      description: "المشتري يفحص المنتج ويؤكد مطابقته للإعلان.",
    },
    {
      icon: "shield",
      title: "تحرير الدفع",
      description: "يُحوَّل المبلغ للبائع بعد التأكيد أو حل النزاع.",
    },
    {
      icon: "message",
      title: "دعم النزاعات",
      description: "فريق UAE Sales يتدخل عند وجود اختلاف بين الطرفين.",
    },
  ];
}

export async function getEscrowProtectionSteps(): Promise<string[]> {
  return [
    "حجز المبلغ في محفظة آمنة",
    "تسليم المنتج أو الخدمة",
    "تأكيد المشتري للاستلام",
    "تحرير الدفع للبائع",
  ];
}

export async function getListingSafetyTips(): Promise<string[]> {
  return [
    "التقِ في مكان عام عند المعاينة — خاصة للسيارات والعقارات.",
    "استخدم الضمان المالي بدلاً من التحويل المباشر للمبالغ الكبيرة.",
    "تحقق من هوية البائع وشارة التوثيق قبل الدفع.",
    "لا تشارك رموز التحقق أو بيانات بطاقتك عبر المحادثة.",
    "وثّق حالة المنتج بالصور قبل وبعد الاستلام.",
  ];
}

export async function getMarketHeroPreviews(): Promise<MarketHeroPreview[]> {
  return [
    {
      id: "cars",
      category: "سيارات",
      city: "دبي مارينا، دبي",
      href: "/listings/mercedes-amg-g63-2024",
      imageUrl: unsplashUrl("photo-1618843479313-40f8afb4b4d8", 2000),
      price: 895000,
      title: "Mercedes-AMG G63 · 2024",
    },
    {
      id: "real-estate",
      category: "عقارات",
      city: "نخلة جميرا، دبي",
      href: "/listings/villa-palm-jumeirah",
      imageUrl: unsplashUrl("photo-1600607687939-ce8a6c25118c", 2000),
      price: 18500000,
      title: "Villa Palm Jumeirah",
    },
    {
      id: "mobiles",
      category: "موبايلات",
      city: "الريم، أبوظبي",
      href: "/listings/iphone-16-pro-max-256gb",
      imageUrl: unsplashUrl("photo-1695048133142-1a20484d2569", 2000),
      price: 4899,
      title: "iPhone 16 Pro Max · 256GB",
    },
    {
      id: "real-estate-office",
      category: "عقارات",
      city: "الخليج التجاري، دبي",
      href: "/listings/office-business-bay",
      imageUrl: unsplashUrl("photo-1486406146926-c627a92ad1ab", 2000),
      price: 1850000,
      title: "مكتب تجاري — Business Bay",
    },
  ];
}

export async function getMarketEmirateImages(): Promise<Record<string, string>> {
  return {
    dubai: getEmirateImageUrl("dubai"),
    "abu-dhabi": getEmirateImageUrl("abu-dhabi"),
    sharjah: getEmirateImageUrl("sharjah"),
    ajman: getEmirateImageUrl("ajman"),
    "ras-al-khaimah": getEmirateImageUrl("ras-al-khaimah"),
    fujairah: getEmirateImageUrl("fujairah"),
  };
}

export async function getHomeCityHighlights() {
  return [
    { cityId: "dubai", listingCount: 9840 },
    { cityId: "abu-dhabi", listingCount: 5620 },
    { cityId: "sharjah", listingCount: 3180 },
    { cityId: "ajman", listingCount: 1240 },
    { cityId: "rak", listingCount: 890 },
    { cityId: "fujairah", listingCount: 620 },
  ];
}

export async function getAuthTrustPoints() {
  return [
    "ضمان مالي يحمي كل معاملة",
    "توثيق البائعين والمشترين",
    "دعم بالعربية على مدار الساعة",
    "24,864 إعلان نشط في الإمارات",
  ];
}
