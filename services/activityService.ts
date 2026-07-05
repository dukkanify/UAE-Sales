import { getCategoryFallbackUrl, unsplashUrl } from "@/shared/constants/image-fallbacks";

export async function getNotifications() {
  return [
    {
      id: "notif-001",
      title: "معاينة مجدولة",
      body: "معاينة نيسان باترول غداً الساعة 5 مساءً في ياس.",
      read: false,
      createdAt: "2026-07-04T14:00:00+04:00",
    },
    {
      id: "notif-002",
      title: "تم حجز الضمان",
      body: "تم حجز 3,200 د.إ لصفقة آيفون 15 برو.",
      read: false,
      createdAt: "2026-06-25T10:20:00+04:00",
    },
    {
      id: "notif-003",
      title: "إعلانك نشط",
      body: "باترول بلاتينيوم 2022 حصل على 42 مشاهدة جديدة.",
      read: true,
      createdAt: "2026-06-24T08:15:00+04:00",
    },
    {
      id: "notif-004",
      title: "رسالة جديدة",
      body: "خالد المنصوري أرسل رسالة عن إعلانك.",
      read: true,
      createdAt: "2026-06-23T19:30:00+04:00",
    },
  ];
}

export async function getSavedListings() {
  return [
    {
      slug: "mercedes-amg-g63-2024",
      title: "مرسيدس-AMG G63 موديل 2024",
      price: 895000,
      imageUrl: unsplashUrl("photo-1618843479313-40f8afb4b4d8", 600),
    },
    {
      slug: "villa-palm-jumeirah",
      title: "فيلا فاخرة على نخلة جميرا",
      price: 18500000,
      imageUrl: getCategoryFallbackUrl("real-estate", 600),
    },
    {
      slug: "iphone-16-pro-max-256gb",
      title: "آيفون 16 برو ماكس 256 جيجابايت",
      price: 4899,
      imageUrl: getCategoryFallbackUrl("mobiles", 600),
    },
    {
      slug: "sony-playstation-5",
      title: "سوني بلايستيشن 5",
      price: 1899,
      imageUrl: getCategoryFallbackUrl("electronics", 600),
    },
  ];
}
