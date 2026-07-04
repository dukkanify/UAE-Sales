import type { HomeEscrowStep } from "@/types/domain/content";

export type FinalHeroListingCard = {
  badge: string;
  category: string;
  city: string;
  href: string;
  id: string;
  imageUrl: string;
  price: number;
  showEscrow?: boolean;
  title: string;
};

export type FinalEscrowStep = HomeEscrowStep;

export type FinalTestimonial = {
  avatarUrl: string;
  city: string;
  name: string;
  quote: string;
  rating: number;
};

const imageQuality = "auto=format&fit=crop&w=2000&q=90";

export async function getFinalHeroBackground(): Promise<string> {
  return `https://images.unsplash.com/photo-1512453979798-5ea266f8880c?${imageQuality}`;
}

export async function getFinalPopularSearches() {
  return [
    { href: "/search?q=للبيع", label: "للبيع" },
    { href: "/search?q=سيارات+مستعملة", label: "سيارات مستعملة" },
    { href: "/categories/real-estate", label: "عقارات" },
    { href: "/categories/mobiles", label: "موبايلات" },
    { href: "/search?city=دبي", label: "إعلانات دبي" },
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
      badge: "عقار مميز",
      category: "عقارات",
      city: "نخلة جميرا، دبي",
      href: "/search?q=فيلا+نخلة+جميرا",
      imageUrl: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?${imageQuality}`,
      price: 18500000,
      title: "Villa Palm Jumeirah",
    },
    {
      id: "cars",
      badge: "سيارة مميزة",
      category: "سيارات",
      city: "دبي",
      href: "/search?q=مرسيدس+G63",
      imageUrl: `https://images.unsplash.com/photo-1606664515524-9f513f17b1c5?${imageQuality}`,
      price: 895000,
      title: "Mercedes-AMG G63 2024",
    },
    {
      id: "mobiles",
      badge: "إلكترونيات",
      category: "موبايلات",
      city: "أبوظبي",
      href: "/search?q=آيفون+16+برو",
      imageUrl: `https://images.unsplash.com/photo-1695048133142-1a20484d2569?${imageQuality}`,
      price: 4899,
      showEscrow: true,
      title: "iPhone 16 Pro Max",
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
      avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?${imageQuality}&w=400`,
      city: "دبي",
      name: "محمد الكعبي",
      quote:
        "بعت سيارتي خلال أسبوع. الضمان المالي أعطى المشتري ثقة كاملة والتجربة كانت سلسة.",
      rating: 5,
    },
    {
      avatarUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${imageQuality}&w=400`,
      city: "أبوظبي",
      name: "فاطمة النعيمي",
      quote:
        "اشتريت شقة عبر المنصة. كل خطوة واضحة من الدفع حتى التسليم، بدون قلق.",
      rating: 5,
    },
    {
      avatarUrl: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${imageQuality}&w=400`,
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
    cars: `https://images.unsplash.com/photo-1503376780353-7e6692767b70?${imageQuality}`,
    "real-estate": `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?${imageQuality}`,
    mobiles: `https://images.unsplash.com/photo-1695048133142-1a20484d2569?${imageQuality}`,
    electronics: `https://images.unsplash.com/photo-1498049794561-7780e7231661?${imageQuality}`,
    jobs: `https://images.unsplash.com/photo-1497366754035-f200968a6e72?${imageQuality}`,
    services: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${imageQuality}`,
    furniture: `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?${imageQuality}`,
    fashion: `https://images.unsplash.com/photo-1445205170230-053b83016050?${imageQuality}`,
  };
}
