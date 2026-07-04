import type { HomeEscrowStep } from "@/types/domain/content";

export type FinalHeroCollageItem = {
  id: string;
  imageUrl: string;
  label: string;
  category: string;
};

export type FinalEscrowStep = HomeEscrowStep;

export type FinalTestimonial = {
  avatarUrl: string;
  city: string;
  name: string;
  quote: string;
  rating: number;
};

export async function getFinalHeroCollage(): Promise<FinalHeroCollageItem[]> {
  return [
    {
      id: "real-estate",
      category: "عقارات",
      imageUrl:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
      label: "فيلا فاخرة",
    },
    {
      id: "cars",
      category: "سيارات",
      imageUrl:
        "https://images.unsplash.com/photo-1519641471654-76cefd57eb17?auto=format&fit=crop&w=900&q=85",
      label: "SUV فاخرة",
    },
    {
      id: "electronics",
      category: "إلكترونيات",
      imageUrl:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
      label: "آيفون 15 Pro",
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
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85",
      city: "دبي",
      name: "محمد الكعبي",
      quote:
        "بعت سيارتي خلال أسبوع. الضمان المالي أعطى المشتري ثقة كاملة والتجربة كانت سلسة.",
      rating: 5,
    },
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
      city: "أبوظبي",
      name: "فاطمة النعيمي",
      quote:
        "اشتريت شقة عبر المنصة. كل خطوة واضحة من الدفع حتى التسليم، بدون قلق.",
      rating: 5,
    },
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
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
    dubai:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85",
    "abu-dhabi":
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1000&q=85",
    sharjah:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    ajman:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    "ras-al-khaimah":
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
    fujairah:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=85",
  };
}
