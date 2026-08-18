import type { IconName } from "@/shared/ui/Icon";
import {
  CAR_BRANDS,
  ELECTRONICS_BRANDS,
  FASHION_BRANDS,
  MOBILE_BRANDS,
} from "@/shared/constants/product-brands";
import { cities } from "@/shared/constants/locations";
import { unsplashUrl } from "@/shared/constants/image-fallbacks";
import {
  categoryCityHref,
  categoryPageHref,
  categorySearchHref,
} from "@/shared/layouts/header-nav";

export type MegaBadge = "new";

export type MegaLink = {
  label: string;
  href: string;
  badge?: MegaBadge;
  children?: MegaLink[];
};

export type MegaService = {
  label: string;
  href: string;
  icon: IconName;
  tone: "gold" | "navy" | "green" | "sand";
};

export type MegaPromo = {
  kicker: string;
  title: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
};

export type MegaMenuCategory = {
  id: string;
  slug: string;
  label: string;
  href: string;
  icon: IconName;
  badge?: MegaBadge;
  items: MegaLink[];
  promo?: MegaPromo;
  services?: MegaService[];
};

function leaf(slug: string, label: string, badge?: MegaBadge): MegaLink {
  return { label, href: categorySearchHref(slug, label), badge };
}

function node(
  slug: string,
  label: string,
  children: MegaLink[],
  badge?: MegaBadge,
): MegaLink {
  return { label, href: categorySearchHref(slug, label), badge, children };
}

function brandLeaves(
  slug: string,
  brands: readonly string[],
  modelsByBrand: Record<string, string[]>,
  limit = 22,
): MegaLink[] {
  return brands.slice(0, limit).map((brand) => {
    const models = modelsByBrand[brand] ?? [];
    return {
      label: brand,
      href: categorySearchHref(slug, brand),
      children: models.map((model) => ({
        label: model,
        href: categorySearchHref(slug, `${brand} ${model}`),
      })),
    };
  });
}

function cityLeaves(slug: string): MegaLink[] {
  return cities.map((city) => ({
    label: city.name,
    href: categoryCityHref(slug, city.name),
  }));
}

function modelLeaves(slug: string, brand: string, models: string[]): MegaLink[] {
  return models.map((model) => ({
    label: model,
    href: categorySearchHref(slug, `${brand} ${model}`),
  }));
}

const CAR_MODELS_BY_BRAND: Record<string, string[]> = {
  Toyota: [
    "Land Cruiser",
    "Prado",
    "Camry",
    "Corolla",
    "Hilux",
    "Yaris",
    "Fortuner",
    "RAV4",
  ],
  Nissan: ["Patrol", "Altima", "Sunny", "X-Trail", "Pathfinder", "Navara", "Kicks"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Pilot"],
  Lexus: ["LX", "GX", "RX", "ES", "IS"],
  "Mercedes-Benz": [
    "G-Class",
    "C-Class",
    "E-Class",
    "S-Class",
    "GLC",
    "GLE",
    "A-Class",
  ],
  BMW: ["X7", "X5", "X3", "X6", "3 Series", "5 Series", "7 Series"],
  Audi: ["A4", "A6", "Q5", "Q7", "Q8", "A3"],
  Porsche: ["Cayenne", "Macan", "911", "Panamera", "Taycan"],
  "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Sport"],
  "Range Rover": ["Vogue", "Sport", "Velar", "Evoque"],
  Jeep: ["Wrangler", "Grand Cherokee", "Compass"],
  Ford: ["Mustang", "F-150", "Explorer", "Edge"],
  Chevrolet: ["Tahoe", "Suburban", "Camaro", "Silverado"],
  Hyundai: ["Tucson", "Elantra", "Sonata", "Santa Fe", "Palisade"],
  Kia: ["Sportage", "Sorento", "K5", "Carnival", "Telluride"],
  Tesla: ["Model Y", "Model 3", "Model X", "Model S", "Cybertruck"],
  "Rolls-Royce": ["Ghost", "Wraith", "Cullinan", "Phantom", "Dawn"],
  Bentley: ["Bentayga", "Continental", "Flying Spur"],
  Ferrari: ["Roma", "SF90", "296 GTB", "Purosangue"],
  Lamborghini: ["Urus", "Huracán", "Revuelto"],
};

const MOBILE_MODELS_BY_BRAND: Record<string, string[]> = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15",
    "iPhone 14",
  ],
  Samsung: [
    "Galaxy S25 Ultra",
    "Galaxy S24 Ultra",
    "Galaxy Z Fold",
    "Galaxy Z Flip",
    "Galaxy A55",
  ],
  Google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8"],
  Xiaomi: ["Xiaomi 14", "Redmi Note 13", "Poco F6"],
  Huawei: ["P60", "Mate 60", "nova 12"],
  OnePlus: ["OnePlus 12", "OnePlus 13"],
};

const ELECTRONICS_MODELS_BY_BRAND: Record<string, string[]> = {
  Sony: ["PlayStation 5", "WH-1000XM5", "A7 IV", "Bravia"],
  Apple: ["MacBook Pro", "MacBook Air", "iPad Pro", "iMac"],
  Samsung: ["Neo QLED", "Galaxy Tab", "The Frame"],
  LG: ["OLED C4", "Gram", "Soundbar"],
  Canon: ["EOS R6", "EOS R8", "EOS R5"],
  Nintendo: ["Switch OLED", "Switch Lite"],
  Dell: ["XPS 15", "XPS 13", "Alienware"],
  HP: ["Spectre", "Pavilion", "Omen"],
};

const DUBAI_AREAS = [
  "نخلة جميرا",
  "داون تاون دبي",
  "دبي مارينا",
  "الخليج التجاري",
  "المرابع العربية",
  "البرشاء",
  "جميرا",
  "ديرة",
];

const ABU_DHABI_AREAS = [
  "جزيرة الريم",
  "جزيرة ياس",
  "شاطئ الراحة",
  "الخالدية",
  "مدينة خليفة",
];

function propertyChildren(kind: string): MegaLink[] {
  return cities.map((city) => {
    const areas =
      city.id === "dubai"
        ? DUBAI_AREAS
        : city.id === "abu-dhabi"
          ? ABU_DHABI_AREAS
          : [];
    return {
      label: city.name,
      href: `/categories/real-estate?q=${encodeURIComponent(kind)}&city=${encodeURIComponent(city.name)}`,
      children: areas.map((area) => ({
        label: area,
        href: `/categories/real-estate?q=${encodeURIComponent(`${kind} ${area}`)}&city=${encodeURIComponent(city.name)}`,
      })),
    };
  });
}

export const megaMenuCategories: MegaMenuCategory[] = [
  {
    id: "cars",
    slug: "cars",
    label: "سيارات",
    href: categoryPageHref("cars"),
    icon: "car",
    badge: "new",
    items: [
      node(
        "cars",
        "سيارات مستعملة",
        brandLeaves("cars", CAR_BRANDS, CAR_MODELS_BY_BRAND),
      ),
      node(
        "cars",
        "سيارات جديدة",
        brandLeaves("cars", CAR_BRANDS, CAR_MODELS_BY_BRAND, 16),
      ),
      leaf("cars", "سيارات للتصدير"),
      leaf("cars", "سيارات للإيجار", "new"),
      node("cars", "سيارات فاخرة", brandLeaves("cars", CAR_BRANDS.slice(4, 20), CAR_MODELS_BY_BRAND, 14)),
      leaf("cars", "دراجات نارية"),
      leaf("cars", "قطع غيار وإكسسوارات"),
      leaf("cars", "شاحنات ومعدات"),
      leaf("cars", "قوارب"),
      leaf("cars", "أرقام مميزة", "new"),
    ],
    promo: {
      kicker: "بيع أسرع",
      title: "بيع سيارتك",
      href: "/listings/new",
      imageUrl: unsplashUrl("photo-1609184166822-bd1f1b991a06", 480),
      imageAlt: "سيارة للبيع في سوقنا",
    },
    services: [
      { label: "فحص السيارة", href: categorySearchHref("services", "فحص السيارة"), icon: "check", tone: "gold" },
      { label: "تمويل السيارة", href: categorySearchHref("services", "تمويل"), icon: "wallet", tone: "navy" },
      { label: "الضمان المالي", href: "/escrow", icon: "shield", tone: "green" },
      { label: "تقييم السيارة", href: categorySearchHref("services", "تقييم السيارة"), icon: "chart", tone: "sand" },
    ],
  },
  {
    id: "real-estate",
    slug: "real-estate",
    label: "عقارات",
    href: categoryPageHref("real-estate"),
    icon: "home",
    items: [
      node("real-estate", "شقق للبيع", propertyChildren("شقق للبيع")),
      node("real-estate", "شقق للإيجار", propertyChildren("شقق للإيجار")),
      node("real-estate", "فلل", propertyChildren("فلل")),
      node("real-estate", "مكاتب", propertyChildren("مكاتب")),
      leaf("real-estate", "أراضي"),
      leaf("real-estate", "تاون هاوس"),
    ],
    promo: {
      kicker: "عقارات موثّقة",
      title: "أعلن عن عقارك الآن",
      href: "/listings/new",
      imageUrl: unsplashUrl("photo-1600585154340-be6161a56a0c", 480),
      imageAlt: "عقار في الإمارات",
    },
  },
  {
    id: "jobs",
    slug: "jobs",
    label: "وظائف",
    href: categoryPageHref("jobs"),
    icon: "briefcase",
    badge: "new",
    items: [
      node("jobs", "مبيعات", cityLeaves("jobs")),
      node("jobs", "عقارات", cityLeaves("jobs")),
      node("jobs", "توصيل", cityLeaves("jobs")),
      node("jobs", "محاسبة", cityLeaves("jobs")),
      node("jobs", "تصميم", cityLeaves("jobs")),
      leaf("jobs", "عمل عن بُعد", "new"),
    ],
    promo: {
      kicker: "فرص عمل",
      title: "انشر وظيفتك مجاناً",
      href: "/listings/new",
      imageUrl: unsplashUrl("photo-1556761175-b413da4baf72", 480),
      imageAlt: "وظيفة في سوقنا",
    },
  },
  {
    id: "electronics",
    slug: "electronics",
    label: "إلكترونيات",
    href: categoryPageHref("electronics"),
    icon: "laptop",
    items: [
      node(
        "electronics",
        "لابتوبات",
        brandLeaves("electronics", ELECTRONICS_BRANDS, ELECTRONICS_MODELS_BY_BRAND, 14),
      ),
      node(
        "electronics",
        "ألعاب",
        brandLeaves("electronics", ["Sony", "Nintendo", "Xbox", "Razer", "Logitech"], ELECTRONICS_MODELS_BY_BRAND, 5),
      ),
      node(
        "electronics",
        "كاميرات",
        brandLeaves("electronics", ["Canon", "Sony", "Nikon", "GoPro", "DJI"], ELECTRONICS_MODELS_BY_BRAND, 5),
      ),
      node(
        "electronics",
        "سماعات",
        brandLeaves("electronics", ["Sony", "Bose", "JBL", "Apple", "Beats"], ELECTRONICS_MODELS_BY_BRAND, 5),
      ),
      leaf("electronics", "تلفزيونات"),
    ],
    promo: {
      kicker: "أجهزة مضمونة",
      title: "بيع إلكترونياتك بأمان",
      href: "/listings/new",
      imageUrl: unsplashUrl("photo-1517336714731-489689fd1ca8", 480),
      imageAlt: "إلكترونيات",
    },
  },
  {
    id: "mobiles",
    slug: "mobiles",
    label: "موبايلات",
    href: categoryPageHref("mobiles"),
    icon: "phone",
    items: [
      node("mobiles", "آيفون", modelLeaves("mobiles", "Apple", MOBILE_MODELS_BY_BRAND.Apple ?? [])),
      node(
        "mobiles",
        "سامسونج",
        modelLeaves("mobiles", "Samsung", MOBILE_MODELS_BY_BRAND.Samsung ?? []),
      ),
      node(
        "mobiles",
        "كل الماركات",
        brandLeaves("mobiles", MOBILE_BRANDS, MOBILE_MODELS_BY_BRAND, 18),
      ),
      leaf("mobiles", "أجهزة لوحية"),
      leaf("mobiles", "إكسسوارات"),
    ],
    promo: {
      kicker: "هواتف موثّقة",
      title: "أعلن عن هاتفك اليوم",
      href: "/listings/new",
      imageUrl: unsplashUrl("photo-1727013884184-b313982327f3", 480),
      imageAlt: "موبايل",
    },
  },
  {
    id: "furniture",
    slug: "furniture",
    label: "أثاث",
    href: categoryPageHref("furniture"),
    icon: "sofa",
    items: [
      node("furniture", "غرف نوم", cityLeaves("furniture")),
      node("furniture", "كنب", cityLeaves("furniture")),
      node("furniture", "طاولات طعام", cityLeaves("furniture")),
      node("furniture", "أثاث خارجي", cityLeaves("furniture")),
      leaf("furniture", "مكاتب منزلية"),
    ],
  },
  {
    id: "fashion",
    slug: "fashion",
    label: "أزياء",
    href: categoryPageHref("fashion"),
    icon: "watch",
    items: [
      node(
        "fashion",
        "ساعات",
        brandLeaves("fashion", FASHION_BRANDS.slice(0, 8), {}, 8),
      ),
      node(
        "fashion",
        "حقائب",
        brandLeaves("fashion", FASHION_BRANDS.slice(6, 13), {}, 7),
      ),
      leaf("fashion", "ملابس"),
      leaf("fashion", "عطور"),
    ],
  },
  {
    id: "services",
    slug: "services",
    label: "خدمات",
    href: categoryPageHref("services"),
    icon: "wrench",
    badge: "new",
    items: [
      node("services", "تنظيف", cityLeaves("services")),
      node("services", "صيانة", cityLeaves("services")),
      node("services", "نقل", cityLeaves("services")),
      node("services", "تكييف", cityLeaves("services")),
      leaf("services", "فحص السيارات", "new"),
    ],
    services: [
      { label: "تنظيف", href: categorySearchHref("services", "تنظيف"), icon: "home", tone: "gold" },
      { label: "نقل", href: categorySearchHref("services", "نقل"), icon: "package", tone: "navy" },
      { label: "صيانة", href: categorySearchHref("services", "صيانة"), icon: "wrench", tone: "green" },
      { label: "تكييف", href: categorySearchHref("services", "تكييف"), icon: "clock", tone: "sand" },
    ],
  },
  {
    id: "pets",
    slug: "pets",
    label: "حيوانات",
    href: categoryPageHref("pets"),
    icon: "paw",
    items: [
      leaf("pets", "قطط"),
      leaf("pets", "كلاب"),
      leaf("pets", "طيور"),
      leaf("pets", "مستلزمات"),
    ],
  },
  {
    id: "kids",
    slug: "kids",
    label: "أطفال",
    href: categoryPageHref("kids"),
    icon: "baby",
    items: [
      leaf("kids", "عربات أطفال"),
      leaf("kids", "ألعاب"),
      leaf("kids", "ملابس أطفال"),
      leaf("kids", "مستلزمات"),
    ],
  },
  {
    id: "books",
    slug: "books",
    label: "كتب",
    href: categoryPageHref("books"),
    icon: "book",
    items: [
      leaf("books", "كتب عربية"),
      leaf("books", "كتب جامعية"),
      leaf("books", "روايات"),
      leaf("books", "مناهج"),
    ],
  },
  {
    id: "sports",
    slug: "sports",
    label: "رياضة",
    href: categoryPageHref("sports"),
    icon: "sport",
    items: [
      leaf("sports", "معدات رياضية"),
      leaf("sports", "دراجات"),
      leaf("sports", "لياقة"),
      leaf("sports", "تخييم"),
    ],
  },
  {
    id: "food",
    slug: "food",
    label: "طعام",
    href: categoryPageHref("food"),
    icon: "food",
    items: [
      leaf("food", "أكلات منزلية"),
      leaf("food", "تمور"),
      leaf("food", "حلويات"),
      leaf("food", "ضيافة"),
    ],
  },
];
