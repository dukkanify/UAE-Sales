import type { Category, UserProfile } from "@/types";
import { demoListings, demoUserListings } from "./demo";

export const mockCategories: Category[] = [
  {
    id: "cars",
    name: "سيارات ومركبات",
    slug: "cars",
    icon: "car",
    listingCount: 8420,
    subcategories: ["سيارات مستعملة", "سيارات فاخرة", "سيارات كهربائية", "قطع غيار"],
  },
  {
    id: "real-estate",
    name: "عقارات",
    slug: "real-estate",
    icon: "home",
    listingCount: 6950,
    subcategories: ["شقق للبيع", "شقق للإيجار", "فلل", "مكاتب"],
  },
  {
    id: "electronics",
    name: "إلكترونيات",
    slug: "electronics",
    icon: "laptop",
    listingCount: 3760,
    subcategories: ["لابتوبات", "ألعاب", "كاميرات", "سماعات"],
  },
  {
    id: "mobiles",
    name: "موبايلات",
    slug: "mobiles",
    icon: "phone",
    listingCount: 4820,
    subcategories: ["آيفون", "سامسونج", "أجهزة لوحية", "إكسسوارات"],
  },
  {
    id: "furniture",
    name: "أثاث ومنزل",
    slug: "furniture",
    icon: "sofa",
    listingCount: 1950,
    subcategories: ["غرف نوم", "كنب", "طاولات طعام", "أثاث خارجي"],
  },
  {
    id: "jobs",
    name: "وظائف",
    slug: "jobs",
    icon: "briefcase",
    listingCount: 2340,
    subcategories: ["مبيعات", "عقارات", "توصيل", "محاسبة", "تصميم"],
  },
  {
    id: "fashion",
    name: "أزياء وإكسسوارات",
    slug: "fashion",
    icon: "watch",
    listingCount: 1420,
    subcategories: ["ساعات", "حقائب", "ملابس", "عطور"],
  },
  {
    id: "services",
    name: "الخدمات",
    slug: "services",
    icon: "wrench",
    listingCount: 3180,
    subcategories: ["تنظيف", "صيانة", "نقل", "تكييف"],
  },
  {
    id: "pets",
    name: "الحيوانات",
    slug: "pets",
    icon: "paw",
    listingCount: 680,
    subcategories: ["قطط", "كلاب", "طيور", "مستلزمات"],
  },
  {
    id: "kids",
    name: "الأطفال",
    slug: "kids",
    icon: "baby",
    listingCount: 920,
    subcategories: ["عربات أطفال", "ألعاب", "ملابس أطفال", "مستلزمات"],
  },
  {
    id: "books",
    name: "الكتب",
    slug: "books",
    icon: "book",
    listingCount: 540,
    subcategories: ["كتب عربية", "كتب جامعية", "روايات", "مناهج"],
  },
  {
    id: "sports",
    name: "الرياضة",
    slug: "sports",
    icon: "sport",
    listingCount: 1180,
    subcategories: ["معدات رياضية", "دراجات", "لياقة", "تخييم"],
  },
  {
    id: "food",
    name: "الطعام",
    slug: "food",
    icon: "food",
    listingCount: 430,
    subcategories: ["أكلات منزلية", "تمور", "حلويات", "ضيافة"],
  },
];

export const mockCurrentUser: UserProfile = {
  id: "user-current",
  fullName: "أحمد المنصوري",
  email: "ahmed.almansoori@email.com",
  phone: "0501234567",
  city: "دبي",
  accountType: "seller",
  isVerified: true,
  joinedAt: "2026-01-15",
};

export const mockListings = demoListings;

export const mockUserListings = demoUserListings;
