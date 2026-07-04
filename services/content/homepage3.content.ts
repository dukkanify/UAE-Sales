export type Home3CategoryVisual = {
  categoryId: string;
  imageUrl: string;
  label: string;
};

export type Home3StoryBlock = {
  description: string;
  eyebrow: string;
  metric: string;
  title: string;
};

export type Home3EmirateVisual = {
  cityId: string;
  imageUrl: string;
};

export type Home3Testimonial = {
  avatarUrl: string;
  city: string;
  name: string;
  quote: string;
  role: string;
};

export async function getHomepage3HeroImages() {
  return {
    skyline:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2200&q=85",
  };
}

export async function getHomepage3CategoryVisuals(): Promise<Home3CategoryVisual[]> {
  return [
    {
      categoryId: "cars",
      imageUrl:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
      label: "سيارات فاخرة",
    },
    {
      categoryId: "real-estate",
      imageUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
      label: "عقارات مميزة",
    },
    {
      categoryId: "mobiles",
      imageUrl:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
      label: "موبايلات",
    },
    {
      categoryId: "jobs",
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
      label: "وظائف",
    },
    {
      categoryId: "services",
      imageUrl:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85",
      label: "خدمات",
    },
    {
      categoryId: "electronics",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
      label: "إلكترونيات",
    },
    {
      categoryId: "furniture",
      imageUrl:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
      label: "أثاث",
    },
    {
      categoryId: "fashion",
      imageUrl:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85",
      label: "أزياء",
    },
  ];
}

export async function getHomepage3StoryBlocks(): Promise<Home3StoryBlock[]> {
  return [
    {
      description: "معايير ثقة واضحة، توثيق، ومؤشرات جودة تساعدك على اختيار الطرف المناسب.",
      eyebrow: "الأمان",
      metric: "18K+",
      title: "بائعون ومشترون موثوقون",
    },
    {
      description: "ضمان مالي يحجز المبلغ حتى تكتمل الصفقة ويطمئن الطرفان.",
      eyebrow: "الضمان",
      metric: "12K+",
      title: "حماية للمال والقرار",
    },
    {
      description: "بحث سريع وتصنيفات مصممة للسوق الإماراتي، من العقارات إلى السيارات والخدمات.",
      eyebrow: "الذكاء",
      metric: "24K+",
      title: "اكتشاف أسرع لما تريد",
    },
    {
      description: "تجربة تصلح للأفراد والشركات، مع عرض واضح للمنتجات والخدمات.",
      eyebrow: "الأعمال",
      metric: "4.9",
      title: "واجهة احترافية للبيع",
    },
  ];
}

export async function getHomepage3Emirates(): Promise<Home3EmirateVisual[]> {
  return [
    {
      cityId: "dubai",
      imageUrl:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85",
    },
    {
      cityId: "abu-dhabi",
      imageUrl:
        "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1000&q=85",
    },
    {
      cityId: "sharjah",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    },
    {
      cityId: "ajman",
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    },
    {
      cityId: "rak",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
    },
    {
      cityId: "fujairah",
      imageUrl:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=85",
    },
  ];
}

export async function getHomepage3Testimonials(): Promise<Home3Testimonial[]> {
  return [
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=85",
      city: "دبي",
      name: "محمد الكعبي",
      quote:
        "المنصة تعطي انطباعاً احترافياً من أول لحظة. عرضت سيارتي ووصلتني عروض جدية بسرعة.",
      role: "بائع",
    },
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=85",
      city: "أبوظبي",
      name: "فاطمة النعيمي",
      quote:
        "فكرة الضمان المالي جعلت الشراء أكثر راحة. التفاصيل واضحة والتجربة راقية.",
      role: "مشتري",
    },
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85",
      city: "الشارقة",
      name: "خالد المرزوقي",
      quote:
        "كصاحب عمل، أحتاج منصة تظهر خدماتي بشكل محترف. UAE Sales يعطي هذا الشعور.",
      role: "تاجر",
    },
  ];
}
