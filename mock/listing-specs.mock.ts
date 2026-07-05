import type {
  CarSpecs,
  ElectronicsSpecs,
  RealEstateSpecs,
} from "@/types";

export type ListingExtras = {
  features: string[];
  negotiable: boolean;
  reasonForSelling: string;
  carSpecs?: CarSpecs;
  realEstateSpecs?: RealEstateSpecs;
  electronicsSpecs?: ElectronicsSpecs;
};

export const listingExtras: Record<string, ListingExtras> = {
  "mercedes-amg-g63-2024": {
    negotiable: true,
    reasonForSelling: "ترقية لسيارة عائلية أكبر",
    features: ["فتحة سقف بانورامية", "مقاعد جلد Nappa", "نظام MBUX", "كاميرات 360"],
    carSpecs: {
      mileage: "8,200 كم",
      transmission: "أوتوماتيك 9 سرعات",
      fuel: "بنزين",
      warranty: "ضمان الوكالة حتى 2027",
      accidentHistory: "بدون حوادث",
      regionalSpecs: "خليجي — وارد وكالة",
      serviceHistory: "صيانة وكالة كاملة",
      vinAvailable: true,
    },
  },
  "toyota-land-cruiser-2023": {
    negotiable: true,
    reasonForSelling: "نقل عمل خارج الدولة",
    features: ["7 مقاعد", "شاشة 12.3 بوصة", "حساسات أمامية وخلفية", "دفع رباعي"],
    carSpecs: {
      mileage: "28,000 كم",
      transmission: "أوتوماتيك",
      fuel: "بنزين",
      warranty: "منتهي — يمكن تمديده",
      accidentHistory: "بدون حوادث",
      regionalSpecs: "خليجي GXR",
      serviceHistory: "سجل وكالة كامل في دبي",
      vinAvailable: true,
    },
  },
  "nissan-patrol-platinum-2022": {
    negotiable: false,
    reasonForSelling: "شراء سيارة جديدة",
    features: ["BOSE", "ProPILOT", "مقاعد مبردة", "شاشة مزدوجة"],
    carSpecs: {
      mileage: "42,000 كم",
      transmission: "أوتوماتيك 7 سرعات",
      fuel: "بنزين V8",
      warranty: "سنتان متبقية",
      accidentHistory: "بدون حوادث",
      regionalSpecs: "خليجي بلاتينيوم",
      serviceHistory: "صيانة منتظمة في أبوظبي",
      vinAvailable: true,
    },
  },
  "bmw-x7-2023": {
    negotiable: true,
    reasonForSelling: "استخدام محدود — السيارة في الكراج أغلب الوقت",
    features: ["Harman Kardon", "7 مقاعد", "Curved Display", "مساعدة قيادة"],
    carSpecs: {
      mileage: "19,500 كم",
      transmission: "أوتوماتيك 8 سرعات",
      fuel: "بنزين",
      warranty: "ضمان الوكالة",
      accidentHistory: "بدون حوادث",
      regionalSpecs: "وارد وكالة ألمانيا",
      serviceHistory: "صيانة BMW Authorized",
      vinAvailable: true,
    },
  },
  "tesla-model-y-2024": {
    negotiable: true,
    reasonForSelling: "الانتقال لشقة بدون موقف شحن",
    features: ["Autopilot", "شاحن منزلي", "مدى 533 كم", "تحديثات OTA"],
    carSpecs: {
      mileage: "12,400 كم",
      transmission: "أوتوماتيك (كهربائي)",
      fuel: "كهرباء",
      warranty: "4 سنوات بطارية",
      accidentHistory: "بدون حوادث",
      regionalSpecs: "إصدار الإمارات",
      serviceHistory: "فحص Tesla Service دبي",
      vinAvailable: true,
    },
  },
  "villa-palm-jumeirah": {
    negotiable: true,
    reasonForSelling: "استثمار — إعادة توزيع المحفظة العقارية",
    features: ["مسبح خاص", "إطلالة بحرية", "مطبخ إيطالي", "غرفة خادمة"],
    realEstateSpecs: {
      bedrooms: 5,
      bathrooms: 6,
      parking: 3,
      areaSqft: 12000,
      furnished: "مفروش جزئياً",
      developer: "Nakheel",
      community: "Palm Jumeirah Fronds",
      amenities: ["نادي النخلة", "شاطئ خاص", "أمن 24/7", "حديقة منسقة"],
    },
  },
  "apartment-downtown-dubai": {
    negotiable: true,
    reasonForSelling: "بيع قبل الانتقال لمشروع جديد",
    features: ["إطلالة برج خليفة", "تشطيبات فندقية", "موقفين", "مسبح وجيم"],
    realEstateSpecs: {
      bedrooms: 2,
      bathrooms: 2,
      parking: 2,
      areaSqft: 1450,
      furnished: "غير مفروش",
      developer: "Emaar",
      community: "Downtown Dubai",
      amenities: ["نافورة دبي", "دبي مول", "مترو", "كونسيرج"],
    },
  },
  "townhouse-arabian-ranches": {
    negotiable: true,
    reasonForSelling: "توسع عائلي — الحاجة لفيلا أكبر",
    features: ["حديقة خلفية", "غرفة خادمة", "موقفين", "Type 2E"],
    realEstateSpecs: {
      bedrooms: 4,
      bathrooms: 4,
      parking: 2,
      areaSqft: 2800,
      furnished: "غير مفروش",
      developer: "Emaar",
      community: "Arabian Ranches 2",
      amenities: ["مدارس", "نادي رياضي", "مسابح", "مسارات مشي"],
    },
  },
  "office-business-bay": {
    negotiable: true,
    reasonForSelling: "دمج مكتبين في موقع واحد",
    features: ["تشطيبات جاهزة", "3 غرف اجتماعات", "إطلالة قناة", "موقفين"],
    realEstateSpecs: {
      bedrooms: 0,
      bathrooms: 2,
      parking: 2,
      areaSqft: 1200,
      furnished: "مجهز بالكامل",
      developer: "DAMAC / متعدد",
      community: "Business Bay",
      amenities: ["استقبال", "مصاعد سريعة", "أمن", "قريب من مترو"],
    },
  },
  "studio-jvc": {
    negotiable: false,
    reasonForSelling: "إدارة عقارات — إيجار سنوي",
    features: ["مفروش بالكامل", "شرفة", "موقف مجاني", "صيانة مشمولة"],
    realEstateSpecs: {
      bedrooms: 0,
      bathrooms: 1,
      parking: 1,
      areaSqft: 450,
      furnished: "مفروش بالكامل",
      developer: "متعدد",
      community: "Jumeirah Village Circle",
      amenities: ["مسبح", "جيم", "سوبرماركت", "حافلات"],
    },
  },
  "iphone-16-pro-max-256gb": {
    negotiable: false,
    reasonForSelling: "وكيل معتمد — مخزون جديد",
    features: ["ضمان Apple سنة", "غير مفعل", "تيتانيوم طبيعي", "256GB"],
    electronicsSpecs: {
      storage: "256 جيجابايت",
      color: "تيتانيوم طبيعي",
      warranty: "سنة Apple الإمارات",
      accessories: "شاحن + كابل أصلي",
      purchaseDate: "يونيو 2026",
    },
  },
  "samsung-galaxy-s25-ultra": {
    negotiable: false,
    reasonForSelling: "عرض إطلاق — كمية محدودة",
    features: ["S Pen", "200MP", "ضمان سنتين", "512GB"],
    electronicsSpecs: {
      storage: "512 جيجابايت",
      color: "تيتانيوم أسود",
      warranty: "سنتان سامسونج الإمارات",
      accessories: "شاحن سريع + جراب",
      purchaseDate: "يونيو 2026",
    },
  },
  "iphone-15-pro-128gb": {
    negotiable: true,
    reasonForSelling: "ترقية لآيفون 16",
    features: ["بطارية 94%", "بدون خدوش", "علبة أصلية", "128GB"],
    electronicsSpecs: {
      storage: "128 جيجابايت",
      color: "أزرق تيتانيوم",
      warranty: "منتهي",
      accessories: "كابل أصلي + علبة",
      purchaseDate: "أكتوبر 2024",
    },
  },
  "ipad-pro-m4-13-inch": {
    negotiable: true,
    reasonForSelling: "لم أعد أستخدمه بعد التخرج",
    features: ["شريحة M4", "Apple Pencil Pro", "13 بوصة", "جديد"],
    electronicsSpecs: {
      storage: "256 جيجابايت",
      color: "فضي",
      warranty: "سنة Apple",
      accessories: "علبة + شاحن",
      purchaseDate: "مايو 2026",
    },
  },
  "macbook-pro-m3-14-inch": {
    negotiable: true,
    reasonForSelling: "جهاز عمل الشركة — لا حاجة له شخصياً",
    features: ["M3", "18GB RAM", "512GB SSD", "Space Black"],
    electronicsSpecs: {
      storage: "512 جيجابايت",
      color: "Space Black",
      warranty: "حتى 2027",
      accessories: "شاحن أصلي + علبة",
      purchaseDate: "فبراير 2026",
    },
  },
  "sony-playstation-5": {
    negotiable: true,
    reasonForSelling: "لم يعد هناك وقت للعب",
    features: ["قرصين مجاناً", "يدتين DualSense", "ضمان 6 أشهر", "إصدار الإمارات"],
    electronicsSpecs: {
      storage: "825 جيجابايت SSD",
      color: "أبيض",
      warranty: "6 أشهر متبقية",
      accessories: "2 يد + HDMI + قاعدة",
      purchaseDate: "ديسمبر 2025",
    },
  },
  "lg-oled-tv-65-inch": {
    negotiable: false,
    reasonForSelling: "عرض صيفي من الوكيل",
    features: ["Dolby Vision", "120Hz", "HDMI 2.1", "تركيب مجاني"],
    electronicsSpecs: {
      storage: "—",
      color: "أسود",
      warranty: "سنتان LG",
      accessories: "ريموت + حامل حائط",
      purchaseDate: "جديد بالكرتونة",
    },
  },
  "canon-eos-r6": {
    negotiable: true,
    reasonForSelling: "التحول لنظام فيديو آخر",
    features: ["عدسة 24-105", "12K شتر", "بطاريتين", "حقيبة Lowepro"],
    electronicsSpecs: {
      storage: "بطاقتا SD",
      color: "أسود",
      warranty: "منتهي",
      accessories: "عدسة + حقيبة + شاحن",
      purchaseDate: "مارس 2023",
    },
  },
  "bose-soundbar-900": {
    negotiable: true,
    reasonForSelling: "تغيير نظام الصوت المنزلي",
    features: ["Dolby Atmos", "Alexa", "Wi-Fi", "علبة أصلية"],
    electronicsSpecs: {
      storage: "—",
      color: "أسود",
      warranty: "سنة متبقية",
      accessories: "ريموت + كابل بصري",
      purchaseDate: "يناير 2026",
    },
  },
  "apple-watch-ultra-2": {
    negotiable: true,
    reasonForSelling: "هدية لم تُستخدم كثيراً",
    features: ["GPS + Cellular", "Ocean Band", "49mm", "ضمان Apple"],
    electronicsSpecs: {
      storage: "64 جيجابايت",
      color: "تيتانيوم طبيعي",
      warranty: "حتى 2027",
      accessories: "سوار Ocean + شاحن",
      purchaseDate: "مارس 2026",
    },
  },
  "luxury-italian-sofa-set": {
    negotiable: true,
    reasonForSelling: "تجديد ديكور المجلس",
    features: ["جلد طبيعي", "3+2+1", "توصيل وتركيب", "استخدام خفيف"],
  },
  "modern-dining-table-8-seater": {
    negotiable: true,
    reasonForSelling: "تغيير حجم الطاولة للمطبخ الجديد",
    features: ["رخام كالاكاتا", "8 كراسي", "إطار ذهبي", "حالة ممتازة"],
  },
  "master-bedroom-set-king": {
    negotiable: true,
    reasonForSelling: "نقل لشقة مفروشة",
    features: ["سرير كينج", "دولابين", "تسريحة", "توصيل متاح"],
  },
  "executive-office-desk": {
    negotiable: true,
    reasonForSelling: "العمل من المكتب — لا حاجة للمكتب المنزلي",
    features: ["L-shaped", "خشب جوز", "كرسي جلد", "مصباح LED"],
  },
  "outdoor-garden-furniture-set": {
    negotiable: true,
    reasonForSelling: "تقليل الأثاث قبل السفر الصيفي",
    features: ["6 مقاعد", "مظلة", "rattan", "غطاء حماية"],
  },
  "home-cleaning-service-dubai": {
    negotiable: false,
    reasonForSelling: "باقات شهرية متاحة",
    features: ["فريق مؤمن", "مواد صديقة للبيئة", "متاح يومياً", "دبي كاملة"],
  },
  "villa-maintenance-service": {
    negotiable: true,
    reasonForSelling: "عقود سنوية بخصم",
    features: ["24/7 طوارئ", "4 زيارات شهرية", "فريق مرخص", "تقرير حالة"],
  },
  "car-detailing-premium": {
    negotiable: false,
    reasonForSelling: "حجز أسبوعي متاح",
    features: ["خدمة متنقلة", "شمع حماية", "تنظيف داخلي", "3-4 ساعات"],
  },
  "moving-service-uae": {
    negotiable: true,
    reasonForSelling: "أسعار خاصة للنقل بين الإمارات",
    features: ["تغليف احترافي", "شاحنات مكيفة", "تأمين", "فك وتركيب"],
  },
  "ac-repair-service": {
    negotiable: false,
    reasonForSelling: "فحص مجاني مع أول زيارة",
    features: ["24/7", "مركزي وسبليت", "تعبئة غاز", "عجمان والشارقة ودبي"],
  },
  "sales-executive-dubai": {
    negotiable: false,
    reasonForSelling: "توسع الفريق التجاري",
    features: ["عمولات", "تأشيرة كفالة", "تأمين صحي", "دوام مكتبي"],
  },
  "real-estate-agent-abu-dhabi": {
    negotiable: false,
    reasonForSelling: "توسع مكتب الريم",
    features: ["عمولة 40%", "سيارة شركة", "RERA إلزامي", "بدل اتصالات"],
  },
  "delivery-driver-sharjah": {
    negotiable: false,
    reasonForSelling: "توسع عمليات التوصيل",
    features: ["دوام مرن", "بدل وقود", "تأمين صحي", "رخصة فئة 3"],
  },
  "accountant-fujairah": {
    negotiable: false,
    reasonForSelling: "نمو المجموعة التجارية",
    features: ["معالجة VAT", "ERP", "تأشيرة", "دوام كامل"],
  },
  "graphic-designer-dubai": {
    negotiable: false,
    reasonForSelling: "مشروع توسع الوكالة",
    features: ["Adobe Suite", "سوشيال ميديا", "هوية بصرية", "بيئة حديثة"],
  },
};

export function extrasForSlug(slug: string): ListingExtras | undefined {
  return listingExtras[slug];
}
