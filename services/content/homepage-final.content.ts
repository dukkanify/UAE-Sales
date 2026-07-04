import type { HomeEscrowStep } from "@/types/domain/content";

export type FinalHeroListingCard = {
  category: string;
  city: string;
  href: string;
  id: string;
  imageUrl: string;
  price: number;
  title: string;
  trustBadge: "escrow" | "verified";
};

export type FinalEscrowStep = HomeEscrowStep;

export type FinalTestimonial = {
  avatarUrl: string;
  city: string;
  name: string;
  quote: string;
  rating: number;
};

const imageQuality = "auto=format&fit=crop&w=2000&q=92";

export async function getFinalHeroBackground(): Promise<string> {
  return `https://images.unsplash.com/photo-1518684079-3c830dcef090?${imageQuality}`;
}

export async function getFinalPopularSearches() {
  return [
    { href: "/search?q=للبيع", label: "للبيع" },
    { href: "/search?q=سيارات+مستعملة", label: "سيارات مستعملة" },
    { href: "/categories/real-estate", label: "عقارات دبي" },
    { href: "/categories/mobiles", label: "موبايلات" },
    { href: "/search?city=أبوظبي", label: "إعلانات أبوظبي" },
  ];
}

export async function getFinalCategoryLabels(): Promise<Record<string, string>> {
  return {
    cars: "سيارات",
    "real-estate": "عقارات",
    mobiles: "موبايلات",
    electronics: "إلكترونيات",
    jobs: "وظائف",
    services: "خدمات",
    furniture: "أثاث ومفروشات",
    fashion: "الأزياء والموضة",
  };
}

export async function getFinalHeroCollage(): Promise<FinalHeroListingCard[]> {
  return [
    {
      id: "real-estate",
      category: "عقارات",
      city: "نخلة جميرا، دبي",
      href: "/search?q=فيلا+نخلة+جميرا",
      imageUrl: `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${imageQuality}`,
      price: 18500000,
      trustBadge: "escrow",
      title: "فيلا فاخرة — نخلة جميرا",
    },
    {
      id: "cars",
      category: "سيارات",
      city: "دبي مارينا، دبي",
      href: "/search?q=مرسيدس+G63",
      imageUrl: `https://images.unsplash.com/photo-1563720360172-1f859e989174?${imageQuality}`,
      price: 895000,
      trustBadge: "verified",
      title: "Mercedes-AMG G63 · 2024",
    },
    {
      id: "mobiles",
      category: "موبايلات",
      city: "الريم، أبوظبي",
      href: "/search?q=آيفون+16+برو",
      imageUrl: `https://images.unsplash.com/photo-1695048133142-1a20484d2569?${imageQuality}`,
      price: 4899,
      trustBadge: "escrow",
      title: "iPhone 16 Pro Max · 256GB",
    },
  ];
}

export async function getFinalEscrowSteps(): Promise<FinalEscrowStep[]> {
  return [
    {
      description: "يدفع المشتري عبر بوابة دفع آمنة ومشفرة.",
      icon: "wallet",
      title: "يدفع المشتري",
    },
    {
      description: "يُحجز المبلغ في حساب الضمان حتى اكتمال الصفقة.",
      icon: "shield",
      title: "يُحتجز المبلغ",
    },
    {
      description: "يُسلّم البائع المنتج أو الخدمة للمشتري.",
      icon: "package",
      title: "يُسلّم البائع",
    },
    {
      description: "يراجع المشتري ويؤكد مطابقة المنتج للوصف.",
      icon: "check",
      title: "يؤكد المشتري",
    },
    {
      description: "يُحرَّر المبلغ للبائع بعد التأكيد النهائي.",
      icon: "star",
      title: "يستلم البائع",
    },
  ];
}

export async function getFinalTestimonials(): Promise<FinalTestimonial[]> {
  return [
    {
      avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=90`,
      city: "دبي",
      name: "محمد الكعبي",
      quote:
        "بعت سيارتي خلال أسبوع. الضمان المالي أعطى المشتري ثقة كاملة والتجربة كانت سلسة.",
      rating: 5,
    },
    {
      avatarUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=90`,
      city: "أبوظبي",
      name: "فاطمة النعيمي",
      quote:
        "اشتريت شقة عبر المنصة. كل خطوة واضحة من الدفع حتى التسليم، بدون قلق.",
      rating: 5,
    },
    {
      avatarUrl: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=90`,
      city: "الشارقة",
      name: "خالد المرزوقي",
      quote:
        "كصاحب معرض، أحتاج منصة تبدو احترافية. UAE Sales يعطي انطباع سوق حقيقي موثوق.",
      rating: 5,
    },
  ];
}

export async function getFinalEmirateImages(): Promise<Record<string, string>> {
  return {
    dubai: `https://images.unsplash.com/photo-1518684079-3c830dcef090?${imageQuality}`,
    "abu-dhabi": `https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?${imageQuality}`,
    sharjah: `https://images.unsplash.com/photo-1582672060674-bc2bd808a8c5?${imageQuality}`,
    ajman: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${imageQuality}`,
    "ras-al-khaimah": `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?${imageQuality}`,
    fujairah: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?${imageQuality}`,
  };
}

export async function getFinalCategoryImages(): Promise<Record<string, string>> {
  return {
    cars: `https://images.unsplash.com/photo-1544636331-e26879cd4d9b?${imageQuality}`,
    "real-estate": `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${imageQuality}`,
    mobiles: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?${imageQuality}`,
    electronics: `https://images.unsplash.com/photo-1468495244123-6c6c332eeece?${imageQuality}`,
    jobs: `https://images.unsplash.com/photo-1497366811353-6870744d04b2?${imageQuality}`,
    services: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?${imageQuality}`,
    furniture: `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?${imageQuality}`,
    fashion: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${imageQuality}`,
  };
}
