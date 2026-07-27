import type {
  ContactMethod,
  DeliveryOption,
  ListingCondition,
  ListingImageTone,
  ListingStatus,
} from "@/types";
import type { VerticalListingSeed } from "./listings-verticals.mock";

const emirates = [
  { emirate: "دبي", city: "دبي", area: "الخليج التجاري" },
  { emirate: "دبي", city: "دبي", area: "البرشاء" },
  { emirate: "أبوظبي", city: "أبوظبي", area: "الخالدية" },
  { emirate: "الشارقة", city: "الشارقة", area: "المجاز" },
  { emirate: "عجمان", city: "عجمان", area: "الراشدية" },
  { emirate: "رأس الخيمة", city: "رأس الخيمة", area: "النخيل" },
  { emirate: "الفجيرة", city: "الفجيرة", area: "المرحلة" },
] as const;

const sellers = [
  "al-noor-motors",
  "dubai-elite-properties",
  "gulf-electronics",
  "emirates-home-services",
  "golden-key-real-estate",
  "khalid-al-mansoori",
  "fatima-al-zaabi",
  "omar-hassan",
  "priya-sharma",
  "ahmed-al-mansoori",
] as const;

const tones: ListingImageTone[] = ["gold", "amber", "sky", "rose", "slate"];
const conditions: ListingCondition[] = ["new", "used", "excellent"];

type ExtraTemplate = {
  categoryId: string;
  subcategory: string;
  titleArabic: string;
  titleEnglish: string;
  price: number;
  descriptionArabic: string;
};

const templates: ExtraTemplate[] = [
  {
    categoryId: "cars",
    subcategory: "سيارات مستعملة",
    titleArabic: "كيا سبورتاج {n} — خليجي",
    titleEnglish: "Kia Sportage {n}",
    price: 72000,
    descriptionArabic:
      "كيا سبورتاج بحالة جيدة، صيانة منتظمة، جاهزة للفحص والتحويل في الإمارات.",
  },
  {
    categoryId: "cars",
    subcategory: "سيارات اقتصادية",
    titleArabic: "هيونداي أكسنت {n} — اقتصادية",
    titleEnglish: "Hyundai Accent {n}",
    price: 28500,
    descriptionArabic: "سيارة اقتصادية مناسبة للتنقل اليومي، استهلاك وقود ممتاز.",
  },
  {
    categoryId: "real-estate",
    subcategory: "شقق للإيجار",
    titleArabic: "شقة غرفة وصالة — عرض {n}",
    titleEnglish: "1BR Apartment Offer {n}",
    price: 62000,
    descriptionArabic: "شقة غرفة وصالة مفروشة جزئياً، قريبة من الخدمات والمواصلات.",
  },
  {
    categoryId: "real-estate",
    subcategory: "فلل للبيع",
    titleArabic: "فيلا 4 غرف — رقم {n}",
    titleEnglish: "4BR Villa {n}",
    price: 2850000,
    descriptionArabic: "فيلا واسعة بحديقة ومواقف، تشطيب حديث وموقع هادئ.",
  },
  {
    categoryId: "electronics",
    subcategory: "أجهزة منزلية",
    titleArabic: "تلفزيون سمارت 55 بوصة — قطعة {n}",
    titleEnglish: "55-inch Smart TV {n}",
    price: 1890,
    descriptionArabic: "تلفزيون ذكي 4K مع ضمان، يشمل الحامل والريموت.",
  },
  {
    categoryId: "mobiles",
    subcategory: "هواتف",
    titleArabic: "سامسونج جالاكسي A{n}",
    titleEnglish: "Samsung Galaxy A{n}",
    price: 1450,
    descriptionArabic: "هاتف بحالة ممتازة مع علبة وشاحن أصلي.",
  },
  {
    categoryId: "furniture",
    subcategory: "غرف نوم",
    titleArabic: "طقم غرفة نوم كامل — مجموعة {n}",
    titleEnglish: "Bedroom Set {n}",
    price: 3200,
    descriptionArabic: "طقم غرفة نوم خشبي مع خزانة ومرآة، تفكيك وتركيب متاح.",
  },
  {
    categoryId: "furniture",
    subcategory: "مكاتب",
    titleArabic: "مكتب عمل منزلي — موديل {n}",
    titleEnglish: "Home Desk {n}",
    price: 680,
    descriptionArabic: "مكتب عملي بمساحات تخزين، مناسب للعمل من المنزل.",
  },
  {
    categoryId: "jobs",
    subcategory: "وظائف شاغرة",
    titleArabic: "موظف استقبال — وظيفة {n}",
    titleEnglish: "Receptionist Role {n}",
    price: 4500,
    descriptionArabic: "مطلوب موظف استقبال بطلاقة عربية وإنجليزية، دوام كامل.",
  },
  {
    categoryId: "fashion",
    subcategory: "أحذية",
    titleArabic: "حذاء رياضي أصلي — مقاس متنوع {n}",
    titleEnglish: "Sport Shoes {n}",
    price: 420,
    descriptionArabic: "حذاء رياضي أصلي بحالة جديدة تقريباً، عدة مقاسات.",
  },
  {
    categoryId: "services",
    subcategory: "صيانة",
    titleArabic: "خدمة صيانة منزلية — باقة {n}",
    titleEnglish: "Home Maintenance Pack {n}",
    price: 250,
    descriptionArabic: "باقة صيانة سريعة للسباكة والكهرباء الخفيفة داخل الإمارات.",
  },
  {
    categoryId: "pets",
    subcategory: "مستلزمات",
    titleArabic: "قفص قطط فاخر — رقم {n}",
    titleEnglish: "Cat Cage {n}",
    price: 310,
    descriptionArabic: "قفص قطط متين مع صينية وصحن، نظيف وجاهز للاستخدام.",
  },
  {
    categoryId: "kids",
    subcategory: "ألعاب",
    titleArabic: "دراجة أطفال — موديل {n}",
    titleEnglish: "Kids Bike {n}",
    price: 280,
    descriptionArabic: "دراجة أطفال بحالة جيدة مع عجلات تدريب قابلة للإزالة.",
  },
  {
    categoryId: "books",
    subcategory: "كتب",
    titleArabic: "مجموعة كتب تطوير — إصدار {n}",
    titleEnglish: "Self-growth Books {n}",
    price: 95,
    descriptionArabic: "مجموعة كتب عربية وإنجليزية في تطوير الذات، شبه جديدة.",
  },
  {
    categoryId: "sports",
    subcategory: "معدات رياضية",
    titleArabic: "أوزان منزلية — طقم {n}",
    titleEnglish: "Home Dumbbells {n}",
    price: 390,
    descriptionArabic: "طقم أوزان قابل للتعديل مع حامل، مناسب للتمارين المنزلية.",
  },
  {
    categoryId: "food",
    subcategory: "تمور ومكسرات",
    titleArabic: "تمر خلاص فاخر — عبوة {n}",
    titleEnglish: "Premium Khalas Dates {n}",
    price: 85,
    descriptionArabic: "تمر خلاص إماراتي فاخر، تعبئة طازجة مع توصيل داخل المدينة.",
  },
  {
    categoryId: "electronics",
    subcategory: "لابتوب",
    titleArabic: "لابتوب مكتبي خفيف — جهاز {n}",
    titleEnglish: "Ultrabook {n}",
    price: 2450,
    descriptionArabic: "لابتوب خفيف للأعمال والدراسة، بطارية جيدة ولوحة مفاتيح مريحة.",
  },
  {
    categoryId: "services",
    subcategory: "تنظيف",
    titleArabic: "خدمة تنظيف شقق — زيارة {n}",
    titleEnglish: "Apartment Cleaning {n}",
    price: 180,
    descriptionArabic: "تنظيف شقق احترافي بالساعة أو الباقة، مواد آمنة ومواعيد مرنة.",
  },
];

function fill(template: string, n: number) {
  return template.replaceAll("{n}", String(n));
}

/** Extra demo inventory to bring the total unique catalog to 100. */
export function buildExtraListingSeeds(count: number): VerticalListingSeed[] {
  const seeds: VerticalListingSeed[] = [];

  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length];
    const place = emirates[index % emirates.length];
    const n = index + 1;
    const idNum = String(n).padStart(3, "0");
    const priceBump = (index % 7) * Math.max(25, Math.round(template.price * 0.03));

    seeds.push({
      id: `listing-extra-${idNum}`,
      slug: `${template.titleEnglish
        .toLowerCase()
        .replaceAll("{n}", String(n))
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      titleArabic: fill(template.titleArabic, n),
      titleEnglish: fill(template.titleEnglish, n),
      categoryId: template.categoryId,
      subcategory: template.subcategory,
      price: template.price + priceBump,
      emirate: place.emirate,
      city: place.city,
      area: place.area,
      condition: conditions[index % conditions.length],
      descriptionArabic: `${template.descriptionArabic} رقم العرض: ${n}.`,
      descriptionEnglish: `${template.titleEnglish.replaceAll("{n}", String(n))} — UAE demo listing #${n}.`,
      sellerKey: sellers[index % sellers.length],
      verifiedSeller: index % 3 !== 2,
      escrowAvailable: index % 4 !== 3,
      featured: index % 6 === 0,
      premium: index % 9 === 0,
      views: 120 + index * 37,
      postedAt: `2026-07-${String((index % 27) + 1).padStart(2, "0")}T10:00:00+04:00`,
      contactMethod: (index % 2 === 0 ? "both" : "chat") as ContactMethod,
      deliveryOption: (index % 3 === 0
        ? "both"
        : index % 3 === 1
          ? "delivery"
          : "pickup") as DeliveryOption,
      listingStatus: "active" as ListingStatus,
      imageTone: tones[index % tones.length],
    });
  }

  return seeds;
}

/** 36 extras → 59 marketplace + 36 + 5 user listings = 100 unique. */
export const extraListingSeeds: VerticalListingSeed[] = buildExtraListingSeeds(36);
