import type {
  HomeCityHighlight,
  HomeEscrowStep,
  HomeReason,
  HomeStat,
  HomeStep,
  HomeTestimonial,
  HomeTrustPoint,
} from "@/types";

export async function getHomeQuickSearchTags() {
  return [
    { href: "/search?q=سيارات", label: "سيارات مستعملة" },
    { href: "/search?q=شقق", label: "شقق للإيجار" },
    { href: "/categories/mobiles", label: "موبايلات" },
    { href: "/search?city=دبي", label: "إعلانات دبي" },
  ];
}

export async function getHomeStats(): Promise<HomeStat[]> {
  return [
    { icon: "chart", label: "إعلان نشط", value: "24,000+" },
    { icon: "check", label: "مستخدم موثق", value: "18,500+" },
    { icon: "shield", label: "معاملة آمنة", value: "12,000+" },
    { icon: "star", label: "تقييم المستخدمين", value: "4.9" },
  ];
}

export async function getHomeTestimonials(): Promise<HomeTestimonial[]> {
  return [
    {
      city: "دبي",
      name: "محمد الكعبي",
      quote: "بعت سيارتي خلال 3 أيام. الضمان المالي أعطى المشتري ثقة كاملة.",
      role: "بائع",
    },
    {
      city: "أبوظبي",
      name: "فاطمة النعيمي",
      quote: "اشتريت آيفون بحالة ممتازة. التوثيق والضمان فرقوا معي كثيراً.",
      role: "مشتري",
    },
    {
      city: "الشارقة",
      name: "خالد المرزوقي",
      quote: "أضفت 5 إعلانات لمعرضي وكلها ظهرت في نتائج البحث بسرعة.",
      role: "تاجر",
    },
  ];
}

export async function getHomeReasons(): Promise<HomeReason[]> {
  return [
    {
      description: "تجربة استخدام سلسة مصممة للسوق الإماراتي.",
      icon: "star",
      title: "تصميم عالمي",
    },
    {
      description: "كل معاملة محمية بنظام ضمان مالي.",
      icon: "shield",
      title: "ضمان حقيقي",
    },
    {
      description: "تحقق عبر OTP وUAE PASS.",
      icon: "check",
      title: "بائعون موثقون",
    },
    {
      description: "فريق دعم متاح على مدار الساعة.",
      icon: "message",
      title: "دعم 24/7",
    },
    {
      description: "محفظة رقمية آمنة لإدارة الأرصدة.",
      icon: "wallet",
      title: "محفظة رقمية",
    },
    {
      description: "واجهة عربية كاملة مع RTL مثالي.",
      icon: "home",
      title: "عربي بالكامل",
    },
  ];
}

export async function getHomeHowItWorksSteps(): Promise<HomeStep[]> {
  return [
    { description: "أنشئ حسابك في دقائق.", title: "سجّل حسابك" },
    { description: "أضف الصور والتفاصيل.", title: "أضف إعلانك" },
    { description: "تواصل عبر الدردشة الآمنة.", title: "استقبل العروض" },
    { description: "أتمم البيع بضمان مالي.", title: "بِع بثقة" },
  ];
}

export async function getHomeEscrowSteps(): Promise<HomeEscrowStep[]> {
  return [
    {
      description: "يُحجز المبلغ في حساب الضمان.",
      icon: "wallet",
      title: "ادفع بأمان",
    },
    {
      description: "تواصل مع البائع واستلم منتجك.",
      icon: "package",
      title: "استلم المنتج",
    },
    {
      description: "راجع المنتج وأكد مطابقته.",
      icon: "check",
      title: "أكد الاستلام",
    },
    {
      description: "يُحوَّل المبلغ للبائع.",
      icon: "shield",
      title: "تحرير المبلغ",
    },
  ];
}

export async function getHomeTrustPoints(): Promise<HomeTrustPoint[]> {
  return [
    { icon: "shield", label: "ضمان مالي" },
    { icon: "check", label: "بائعون موثقون" },
    { icon: "wallet", label: "دفع آمن" },
    { icon: "message", label: "دعم 24/7" },
  ];
}

export async function getHomeCityHighlights(): Promise<HomeCityHighlight[]> {
  return [
    { cityId: "dubai", listingCount: 8420 },
    { cityId: "abu-dhabi", listingCount: 5310 },
    { cityId: "sharjah", listingCount: 3890 },
    { cityId: "ajman", listingCount: 1240 },
    { cityId: "rak", listingCount: 980 },
    { cityId: "fujairah", listingCount: 760 },
  ];
}

export async function getAuthTrustPoints(): Promise<string[]> {
  return [
    "ضمان مالي يحمي كل معاملة",
    "تحقق عبر OTP وUAE PASS",
    "دعم احترافي على مدار الساعة",
  ];
}

export async function getEscrowProtectionSteps(): Promise<string[]> {
  return [
    "يدفع المشتري عبر صفحة الدفع الآمنة.",
    "يُحجز المبلغ في الضمان المالي.",
    "يُحرَّر المبلغ للبائع بعد تأكيد الاستلام.",
  ];
}
