export const mockDashboardViewsChart = [
  { day: "السبت", value: 42 },
  { day: "الأحد", value: 58 },
  { day: "الإثنين", value: 71 },
  { day: "الثلاثاء", value: 65 },
  { day: "الأربعاء", value: 89 },
  { day: "الخميس", value: 94 },
  { day: "الجمعة", value: 76 },
];

export const mockDashboardQuickActions = [
  { href: "/listings/new", icon: "plus" as const, label: "إضافة إعلان" },
  { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان" },
  { href: "/chat", icon: "message" as const, label: "الرسائل" },
];

export const mockDashboardSummaryCards = [
  { href: "/wallet", icon: "wallet" as const, label: "رصيد المحفظة", value: "2,450 د.إ" },
  { href: "/escrow", icon: "shield" as const, label: "ضمان نشط", value: "3,200 د.إ" },
  { href: "/chat", icon: "message" as const, label: "رسائل غير مقروءة", value: "4" },
  { href: "/dashboard/listings", icon: "chart" as const, label: "مشاهدات الأسبوع", value: "495" },
];

export const mockDashboardRecentActivity = [
  { id: "a1", text: "مشاهدة جديدة — مرسيدس G63", time: "منذ ساعة" },
  { id: "a2", text: "رسالة من خالد المنصوري", time: "منذ 3 ساعات" },
  { id: "a3", text: "إيداع 1,500 د.إ في المحفظة", time: "أمس" },
];

export const mockDashboardNotifications = [
  {
    body: "معاينة نيسان باترول غداً الساعة 5 مساءً في ياس.",
    id: "notif-001",
    read: false,
    title: "معاينة مجدولة",
  },
  {
    body: "تم حجز 3,200 د.إ لصفقة آيفون 15 برو.",
    id: "notif-002",
    read: false,
    title: "تم حجز الضمان",
  },
  {
    body: "باترول بلاتينيوم 2022 حصل على 42 مشاهدة جديدة.",
    id: "notif-003",
    read: true,
    title: "إعلانك نشط",
  },
  {
    body: "خالد المنصوري أرسل رسالة عن إعلانك.",
    id: "notif-004",
    read: true,
    title: "رسالة جديدة",
  },
];
