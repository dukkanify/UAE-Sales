import type { CategoryFieldDefinition } from "@/types";

const emirateOptions = [
  { label: "دبي", value: "دبي" },
  { label: "أبوظبي", value: "أبوظبي" },
  { label: "الشارقة", value: "الشارقة" },
  { label: "عجمان", value: "عجمان" },
  { label: "رأس الخيمة", value: "رأس الخيمة" },
  { label: "الفجيرة", value: "الفجيرة" },
  { label: "أم القيوين", value: "أم القيوين" },
];

const yesNoOptions = [
  { label: "نعم", value: "نعم" },
  { label: "لا", value: "لا" },
];

const carFeatureOptions = [
  { label: "ABS", value: "ABS" },
  { label: "مثبت سرعة", value: "مثبت سرعة" },
  { label: "حساسات ركن", value: "حساسات ركن" },
  { label: "كاميرا", value: "كاميرا" },
  { label: "مقاعد جلد", value: "مقاعد جلد" },
  { label: "فتحة سقف", value: "فتحة سقف" },
  { label: "ملاحة", value: "ملاحة" },
  { label: "بلوتوث", value: "بلوتوث" },
  { label: "Apple CarPlay", value: "Apple CarPlay" },
  { label: "Android Auto", value: "Android Auto" },
  { label: "دفع رباعي", value: "دفع رباعي" },
  { label: "تيربو", value: "تيربو" },
  { label: "قابل للتفاوض", value: "قابل للتفاوض" },
];

const carFields: CategoryFieldDefinition[] = [
  { key: "brand", label: "الماركة", type: "text", required: true, titlePart: true, searchable: true },
  { key: "model", label: "الموديل", type: "text", required: true, titlePart: true, searchable: true },
  { key: "year", label: "سنة الصنع", type: "number", required: true, titlePart: true, searchable: true },
  { key: "emirate", label: "الإمارة", type: "select", required: true, options: emirateOptions, searchable: true },
  { key: "city", label: "المدينة", type: "text", required: true, searchable: true },
  { key: "mileage", label: "العداد (كم)", type: "text", required: true, searchable: true },
  { key: "transmission", label: "ناقل الحركة", type: "select", required: true, options: [
    { label: "أوتوماتيك", value: "أوتوماتيك" },
    { label: "يدوي", value: "يدوي" },
  ]},
  { key: "fuelType", label: "نوع الوقود", type: "select", required: true, options: [
    { label: "بنزين", value: "بنزين" },
    { label: "ديزل", value: "ديزل" },
    { label: "هجين", value: "هجين" },
    { label: "كهربائي", value: "كهربائي" },
  ]},
  { key: "engineSize", label: "سعة المحرك", type: "text", required: true },
  { key: "regionalSpecs", label: "المواصفات الإقليمية", type: "select", required: true, options: [
    { label: "خليجي", value: "خليجي" },
    { label: "أمريكي", value: "أمريكي" },
    { label: "أوروبي", value: "أوروبي" },
    { label: "ياباني", value: "ياباني" },
    { label: "أخرى", value: "أخرى" },
  ]},
  { key: "exteriorColor", label: "اللون الخارجي", type: "text", required: true },
  { key: "interiorColor", label: "اللون الداخلي", type: "text", required: true },
  { key: "warranty", label: "الضمان", type: "select", required: true, options: yesNoOptions },
  { key: "accidentHistory", label: "سجل الحوادث", type: "select", required: true, options: [
    { label: "بدون حوادث", value: "بدون حوادث" },
    { label: "حادث بسيط", value: "حادث بسيط" },
    { label: "حادث كبير", value: "حادث كبير" },
  ]},
  { key: "serviceHistory", label: "سجل الصيانة", type: "select", required: true, options: [
    { label: "وكالة كاملة", value: "وكالة كاملة" },
    { label: "صيانة دورية", value: "صيانة دورية" },
    { label: "غير متوفر", value: "غير متوفر" },
  ]},
  { key: "vin", label: "رقم الهيكل (VIN)", type: "text", required: false },
  { key: "numberOfKeys", label: "عدد المفاتيح", type: "number", required: true },
  { key: "features", label: "الميزات", type: "checkbox-group", options: carFeatureOptions },
];

const realEstateFields: CategoryFieldDefinition[] = [
  { key: "propertyType", label: "نوع العقار", type: "select", required: true, titlePart: true, searchable: true, options: [
    { label: "شقة", value: "شقة" },
    { label: "فيلا", value: "فيلا" },
    { label: "تاون هاوس", value: "تاون هاوس" },
    { label: "مكتب", value: "مكتب" },
    { label: "أرض", value: "أرض" },
  ]},
  { key: "purpose", label: "الغرض", type: "select", required: true, titlePart: true, searchable: true, options: [
    { label: "للبيع", value: "للبيع" },
    { label: "للإيجار", value: "للإيجار" },
  ]},
  { key: "bedrooms", label: "غرف النوم", type: "number", required: true, searchable: true },
  { key: "bathrooms", label: "الحمامات", type: "number", required: true },
  { key: "area", label: "المساحة (قدم²)", type: "number", required: true, searchable: true },
  { key: "floor", label: "الطابق", type: "text", required: true },
  { key: "parking", label: "مواقف السيارات", type: "number", required: true },
  { key: "furnished", label: "التأثيث", type: "select", required: true, options: [
    { label: "مفروش", value: "مفروش" },
    { label: "غير مفروش", value: "غير مفروش" },
    { label: "شبه مفروش", value: "شبه مفروش" },
  ]},
  { key: "completionStatus", label: "حالة الإنجاز", type: "select", required: true, options: [
    { label: "جاهز", value: "جاهز" },
    { label: "قيد الإنشاء", value: "قيد الإنشاء" },
    { label: "خطة", value: "خطة" },
  ]},
  { key: "developer", label: "المطور", type: "text", required: true, searchable: true },
  { key: "community", label: "المجتمع", type: "text", required: true, titlePart: true, searchable: true },
  { key: "titleDeedReady", label: "سند الملكية جاهز", type: "select", required: true, options: yesNoOptions },
  { key: "emirate", label: "الإمارة", type: "select", required: true, options: emirateOptions, searchable: true },
  { key: "city", label: "المدينة", type: "text", required: true, searchable: true },
];

const mobileFields: CategoryFieldDefinition[] = [
  { key: "brand", label: "الماركة", type: "text", required: true, titlePart: true, searchable: true },
  { key: "model", label: "الموديل", type: "text", required: true, titlePart: true, searchable: true },
  { key: "storage", label: "التخزين", type: "select", required: true, searchable: true, options: [
    { label: "64 GB", value: "64 GB" },
    { label: "128 GB", value: "128 GB" },
    { label: "256 GB", value: "256 GB" },
    { label: "512 GB", value: "512 GB" },
    { label: "1 TB", value: "1 TB" },
  ]},
  { key: "ram", label: "الذاكرة (RAM)", type: "select", required: true, options: [
    { label: "4 GB", value: "4 GB" },
    { label: "6 GB", value: "6 GB" },
    { label: "8 GB", value: "8 GB" },
    { label: "12 GB", value: "12 GB" },
    { label: "16 GB", value: "16 GB" },
  ]},
  { key: "color", label: "اللون", type: "text", required: true },
  { key: "batteryHealth", label: "صحة البطارية", type: "text", required: true },
  { key: "warranty", label: "الضمان", type: "select", required: true, options: yesNoOptions },
  { key: "purchaseDate", label: "تاريخ الشراء", type: "text", required: true },
  { key: "accessoriesIncluded", label: "الملحقات المرفقة", type: "textarea", required: true },
  { key: "condition", label: "الحالة", type: "select", required: true, options: [
    { label: "جديد", value: "جديد" },
    { label: "مستعمل", value: "مستعمل" },
    { label: "ممتاز", value: "ممتاز" },
  ]},
];

const electronicsFields: CategoryFieldDefinition[] = [
  { key: "brand", label: "الماركة", type: "text", required: true, titlePart: true, searchable: true },
  { key: "model", label: "الموديل", type: "text", required: true, titlePart: true, searchable: true },
  { key: "condition", label: "الحالة", type: "select", required: true, options: [
    { label: "جديد", value: "جديد" },
    { label: "مستعمل", value: "مستعمل" },
    { label: "ممتاز", value: "ممتاز" },
  ]},
  { key: "warranty", label: "الضمان", type: "select", required: true, options: yesNoOptions },
  { key: "accessories", label: "الملحقات", type: "textarea", required: true },
];

const jobFields: CategoryFieldDefinition[] = [
  { key: "company", label: "الشركة", type: "text", required: true, titlePart: true, searchable: true },
  { key: "position", label: "المسمى الوظيفي", type: "text", required: true, titlePart: true, searchable: true },
  { key: "salary", label: "الراتب", type: "text", required: true, searchable: true },
  { key: "experience", label: "الخبرة", type: "text", required: true },
  { key: "employmentType", label: "نوع التوظيف", type: "select", required: true, options: [
    { label: "دوام كامل", value: "دوام كامل" },
    { label: "دوام جزئي", value: "دوام جزئي" },
    { label: "عقد", value: "عقد" },
    { label: "عن بُعد", value: "عن بُعد" },
  ]},
  { key: "location", label: "الموقع", type: "text", required: true, searchable: true },
  { key: "nationality", label: "الجنسية", type: "text", required: true },
  { key: "gender", label: "الجنس", type: "select", required: true, options: [
    { label: "ذكر", value: "ذكر" },
    { label: "أنثى", value: "أنثى" },
    { label: "أي", value: "أي" },
  ]},
];

const serviceFields: CategoryFieldDefinition[] = [
  { key: "businessName", label: "اسم النشاط", type: "text", required: true, titlePart: true, searchable: true },
  { key: "serviceCategory", label: "تصنيف الخدمة", type: "text", required: true, titlePart: true, searchable: true },
  { key: "coverageArea", label: "منطقة التغطية", type: "text", required: true, searchable: true },
  { key: "availability", label: "التوفر", type: "select", required: true, options: [
    { label: "فوري", value: "فوري" },
    { label: "خلال 24 ساعة", value: "خلال 24 ساعة" },
    { label: "حسب الموعد", value: "حسب الموعد" },
  ]},
  { key: "experience", label: "سنوات الخبرة", type: "text", required: true },
];

export const DYNAMIC_CATEGORY_IDS = [
  "cars",
  "real-estate",
  "mobiles",
  "electronics",
  "jobs",
  "services",
] as const;

export type DynamicCategoryId = (typeof DYNAMIC_CATEGORY_IDS)[number];

const categoryFieldMap: Record<DynamicCategoryId, CategoryFieldDefinition[]> = {
  cars: carFields,
  "real-estate": realEstateFields,
  mobiles: mobileFields,
  electronics: electronicsFields,
  jobs: jobFields,
  services: serviceFields,
};

export function isDynamicCategory(categoryId: string): categoryId is DynamicCategoryId {
  return (DYNAMIC_CATEGORY_IDS as readonly string[]).includes(categoryId);
}

export function getCategoryFields(categoryId: string): CategoryFieldDefinition[] {
  if (!isDynamicCategory(categoryId)) {
    return [];
  }
  return categoryFieldMap[categoryId];
}

export function getCategoryFieldLabel(categoryId: string, key: string): string {
  const field = getCategoryFields(categoryId).find((item) => item.key === key);
  return field?.label ?? key;
}
