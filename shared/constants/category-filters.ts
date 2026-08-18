import type { CategoryFieldOption } from "@/types";
import { getCategoryFields } from "@/shared/constants/category-fields";
import { cities } from "@/shared/constants/locations";
import {
  carBrandOptions,
  electronicsBrandOptions,
  mobileBrandOptions,
} from "@/shared/constants/product-brands";
import {
  carModelOptions,
  mobileModelOptions,
} from "@/shared/constants/product-models";

export type FilterFieldKind = "select" | "text" | "city" | "price" | "query" | "category";

export type CategoryFilterField = {
  key: string;
  kind: FilterFieldKind;
  label: string;
  placeholder?: string;
  options?: CategoryFieldOption[];
};

export type CategoryFilterConfig = {
  extra: CategoryFilterField[];
  primary: CategoryFilterField[];
};

const cityOptions: CategoryFieldOption[] = cities.map((city) => ({
  label: city.name,
  value: city.name,
}));

const yearOptions: CategoryFieldOption[] = Array.from({ length: 22 }, (_, index) => {
  const year = String(2026 - index);
  return { label: year, value: year };
});

const bedroomOptions: CategoryFieldOption[] = [
  { label: "استوديو", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6+", value: "6+" },
];

const bathroomOptions: CategoryFieldOption[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4+", value: "4+" },
];

const conditionOptions: CategoryFieldOption[] = [
  { label: "جديد", value: "new" },
  { label: "مستعمل", value: "used" },
  { label: "ممتاز", value: "excellent" },
];

function fieldOptions(categoryId: string, key: string): CategoryFieldOption[] {
  return getCategoryFields(categoryId).find((field) => field.key === key)?.options ?? [];
}

function priceBands(categoryId: string): CategoryFieldOption[] {
  if (categoryId === "cars") {
    return [
      { label: "أقل من 50 ألف", value: "0-50000" },
      { label: "50 – 100 ألف", value: "50000-100000" },
      { label: "100 – 200 ألف", value: "100000-200000" },
      { label: "أكثر من 200 ألف", value: "200000+" },
    ];
  }
  if (categoryId === "real-estate") {
    return [
      { label: "أقل من 500 ألف", value: "0-500000" },
      { label: "500 ألف – 1.5 مليون", value: "500000-1500000" },
      { label: "1.5 – 3 مليون", value: "1500000-3000000" },
      { label: "أكثر من 3 مليون", value: "3000000+" },
    ];
  }
  if (categoryId === "jobs") {
    return [
      { label: "أقل من 5 آلاف", value: "0-5000" },
      { label: "5 – 12 ألف", value: "5000-12000" },
      { label: "أكثر من 12 ألف", value: "12000+" },
    ];
  }
  if (categoryId === "mobiles" || categoryId === "electronics") {
    return [
      { label: "أقل من 1,000", value: "0-1000" },
      { label: "1,000 – 3,000", value: "1000-3000" },
      { label: "3,000 – 8,000", value: "3000-8000" },
      { label: "أكثر من 8,000", value: "8000+" },
    ];
  }
  return [
    { label: "أقل من 50 ألف", value: "0-50000" },
    { label: "50 – 200 ألف", value: "50000-200000" },
    { label: "أكثر من 200 ألف", value: "200000+" },
  ];
}

const cityField: CategoryFilterField = {
  key: "city",
  kind: "city",
  label: "المدينة",
  placeholder: "كل المدن",
  options: cityOptions,
};

const queryField = (placeholder: string): CategoryFilterField => ({
  key: "q",
  kind: "query",
  label: "فلتر",
  placeholder,
});

const priceField = (categoryId: string): CategoryFilterField => ({
  key: "price",
  kind: "price",
  label: "نطاق السعر",
  placeholder: "اختر",
  options: priceBands(categoryId),
});

const extraCarModels: CategoryFieldOption[] = [
  { label: "Ciaz", value: "Ciaz" },
  { label: "G63", value: "G-Class" },
  { label: "Model Y", value: "Model Y" },
  { label: "X7", value: "X7" },
];

function uniqueOptions(options: CategoryFieldOption[]): CategoryFieldOption[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

const CONFIG: Record<string, CategoryFilterConfig> = {
  cars: {
    primary: [
      cityField,
      {
        key: "brand",
        kind: "select",
        label: "النوع والموديل",
        placeholder: "الماركة",
        options: carBrandOptions,
      },
      {
        key: "model",
        kind: "select",
        label: "الفئة",
        placeholder: "البحث عن الفئة",
        options: uniqueOptions([...extraCarModels, ...carModelOptions]),
      },
      priceField("cars"),
      {
        key: "year",
        kind: "select",
        label: "سنة الصنع",
        placeholder: "اختر",
        options: yearOptions,
      },
      queryField("كلمة تتعلق بالبحث، مدينة، ..."),
    ],
    extra: [
      {
        key: "condition",
        kind: "select",
        label: "الحالة",
        placeholder: "الكل",
        options: conditionOptions,
      },
      {
        key: "transmission",
        kind: "select",
        label: "ناقل الحركة",
        placeholder: "الكل",
        options: fieldOptions("cars", "transmission"),
      },
      {
        key: "fuelType",
        kind: "select",
        label: "الوقود",
        placeholder: "الكل",
        options: fieldOptions("cars", "fuelType"),
      },
      {
        key: "regionalSpecs",
        kind: "select",
        label: "المواصفات",
        placeholder: "الكل",
        options: fieldOptions("cars", "regionalSpecs"),
      },
    ],
  },
  "real-estate": {
    primary: [
      cityField,
      {
        key: "propertyType",
        kind: "select",
        label: "نوع العقار",
        placeholder: "اختر",
        options: fieldOptions("real-estate", "propertyType"),
      },
      {
        key: "purpose",
        kind: "select",
        label: "الغرض",
        placeholder: "للبيع / للإيجار",
        options: fieldOptions("real-estate", "purpose"),
      },
      {
        key: "bedrooms",
        kind: "select",
        label: "غرف النوم",
        placeholder: "اختر",
        options: bedroomOptions,
      },
      priceField("real-estate"),
      queryField("مجتمع، مطور، منطقة..."),
    ],
    extra: [
      {
        key: "bathrooms",
        kind: "select",
        label: "الحمامات",
        placeholder: "الكل",
        options: bathroomOptions,
      },
      {
        key: "furnished",
        kind: "select",
        label: "التأثيث",
        placeholder: "الكل",
        options: fieldOptions("real-estate", "furnished"),
      },
      {
        key: "completionStatus",
        kind: "select",
        label: "حالة الإنجاز",
        placeholder: "الكل",
        options: fieldOptions("real-estate", "completionStatus"),
      },
    ],
  },
  mobiles: {
    primary: [
      cityField,
      {
        key: "brand",
        kind: "select",
        label: "الماركة",
        placeholder: "اختر",
        options: mobileBrandOptions,
      },
      {
        key: "model",
        kind: "select",
        label: "الموديل",
        placeholder: "اختر",
        options: mobileModelOptions,
      },
      {
        key: "storage",
        kind: "select",
        label: "التخزين",
        placeholder: "اختر",
        options: fieldOptions("mobiles", "storage"),
      },
      priceField("mobiles"),
      queryField("لون، حالة، ملحقات..."),
    ],
    extra: [
      {
        key: "condition",
        kind: "select",
        label: "الحالة",
        placeholder: "الكل",
        options: conditionOptions,
      },
      {
        key: "ram",
        kind: "select",
        label: "الذاكرة",
        placeholder: "الكل",
        options: fieldOptions("mobiles", "ram"),
      },
    ],
  },
  electronics: {
    primary: [
      cityField,
      {
        key: "brand",
        kind: "select",
        label: "الماركة",
        placeholder: "اختر",
        options: electronicsBrandOptions,
      },
      {
        key: "model",
        kind: "select",
        label: "الموديل",
        placeholder: "اختر",
        options: fieldOptions("electronics", "model"),
      },
      {
        key: "condition",
        kind: "select",
        label: "الحالة",
        placeholder: "اختر",
        options: conditionOptions,
      },
      priceField("electronics"),
      queryField("نوع الجهاز، ملحقات..."),
    ],
    extra: [
      {
        key: "warranty",
        kind: "select",
        label: "الضمان",
        placeholder: "الكل",
        options: fieldOptions("electronics", "warranty"),
      },
    ],
  },
  jobs: {
    primary: [
      cityField,
      {
        key: "employmentType",
        kind: "select",
        label: "نوع التوظيف",
        placeholder: "اختر",
        options: fieldOptions("jobs", "employmentType"),
      },
      {
        key: "experience",
        kind: "text",
        label: "الخبرة",
        placeholder: "مثال: 3 سنوات",
      },
      priceField("jobs"),
      queryField("المسمى، الشركة، الجنسية..."),
    ],
    extra: [
      {
        key: "gender",
        kind: "select",
        label: "الجنس",
        placeholder: "الكل",
        options: fieldOptions("jobs", "gender"),
      },
    ],
  },
  services: {
    primary: [
      cityField,
      {
        key: "serviceCategory",
        kind: "text",
        label: "تصنيف الخدمة",
        placeholder: "صيانة، تنظيف، نقل...",
      },
      {
        key: "availability",
        kind: "select",
        label: "التوفر",
        placeholder: "اختر",
        options: fieldOptions("services", "availability"),
      },
      {
        key: "coverageArea",
        kind: "text",
        label: "منطقة التغطية",
        placeholder: "دبي، كل الإمارات...",
      },
      queryField("اسم النشاط أو نوع الخدمة..."),
    ],
    extra: [],
  },
  food: {
    primary: [
      cityField,
      {
        key: "cuisine",
        kind: "select",
        label: "نوع المطبخ",
        placeholder: "اختر",
        options: fieldOptions("food", "cuisine"),
      },
      {
        key: "delivery",
        kind: "select",
        label: "التوصيل",
        placeholder: "اختر",
        options: fieldOptions("food", "delivery"),
      },
      {
        key: "freshness",
        kind: "select",
        label: "الطزاجة",
        placeholder: "اختر",
        options: fieldOptions("food", "freshness"),
      },
      priceField("food"),
      queryField("طبق، كمية، مناسبات..."),
    ],
    extra: [],
  },
};

const GENERIC: CategoryFilterConfig = {
  primary: [
    cityField,
    {
      key: "condition",
      kind: "select",
      label: "الحالة",
      placeholder: "اختر",
      options: conditionOptions,
    },
    priceField("generic"),
    queryField("كلمة تتعلق بالبحث، مدينة، ..."),
  ],
  extra: [],
};

export const GENERIC_FILTER_KEYS = new Set([
  "q",
  "category",
  "city",
  "country",
  "condition",
  "minPrice",
  "maxPrice",
  "sort",
  "price",
]);

export function getCategoryFilterConfig(categoryId?: string): CategoryFilterConfig {
  if (categoryId && CONFIG[categoryId]) return CONFIG[categoryId];
  return GENERIC;
}

export function getCategorySpecKeys(categoryId?: string): string[] {
  const config = getCategoryFilterConfig(categoryId);
  return [...config.primary, ...config.extra]
    .map((field) => field.key)
    .filter((key) => !GENERIC_FILTER_KEYS.has(key));
}

export function getAllKnownSpecKeys(): string[] {
  const keys = new Set<string>(["yearMin", "yearMax"]);
  for (const config of Object.values(CONFIG)) {
    for (const field of [...config.primary, ...config.extra]) {
      if (!GENERIC_FILTER_KEYS.has(field.key)) keys.add(field.key);
    }
  }
  return Array.from(keys);
}
