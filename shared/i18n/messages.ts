import type { AppLocale } from "./locale";

export const localeMessages = {
  ar: {
    account: "حسابي",
    addListing: "أضف إعلانك",
    arabic: "عربي",
    browse: "تصفّح سوقنا",
    browseTitle: "كل الأقسام في مكان واحد",
    categories: "التصنيفات",
    closeMenu: "إغلاق القائمة",
    createAccount: "إنشاء حساب",
    current: "الحالي",
    english: "English",
    escrow: "الضمان",
    escrowFull: "الضمان المالي",
    explore: "استكشف",
    featured: "المميزة",
    home: "الرئيسية",
    language: "اللغة",
    login: "سجّل الدخول وانضم إلينا",
    loginShort: "دخول",
    logout: "تسجيل الخروج",
    menu: "القائمة",
    noAccount: "ليس لديك حساب؟",
    profile: "الملف",
    search: "بحث",
    searchPlaceholder: "ابحث في سوقنا...",
    signInToContinue: "سجّل الدخول للمتابعة",
  },
  en: {
    account: "My account",
    addListing: "Post an ad",
    arabic: "عربي",
    browse: "Browse Sooqna",
    browseTitle: "All sections in one place",
    categories: "Categories",
    closeMenu: "Close menu",
    createAccount: "Create account",
    current: "Current",
    english: "English",
    escrow: "Escrow",
    escrowFull: "Escrow",
    explore: "Explore",
    featured: "Featured",
    home: "Home",
    language: "Language",
    login: "Sign in and join us",
    loginShort: "Sign in",
    logout: "Sign out",
    menu: "Menu",
    noAccount: "Don't have an account?",
    profile: "Profile",
    search: "Search",
    searchPlaceholder: "Search Sooqna...",
    signInToContinue: "Sign in to continue",
  },
} as const;

export type LocaleMessages = (typeof localeMessages)[AppLocale];

export function getLocaleMessages(locale: AppLocale): LocaleMessages {
  return localeMessages[locale];
}
