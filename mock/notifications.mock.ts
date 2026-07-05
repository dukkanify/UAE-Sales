import type { NotificationRecord } from "@/types/domain/notification";

const initialNotifications: NotificationRecord[] = [
  {
    id: "notif-001",
    type: "new_message",
    title: "رسالة جديدة",
    body: "خالد المنصوري أرسل رسالة عن نيسان باترول بلاتينيوم 2022.",
    read: false,
    createdAt: "2026-07-04T16:20:00+04:00",
    href: "/chat/thread-001",
  },
  {
    id: "notif-002",
    type: "payment_held",
    title: "تم حجز الضمان",
    body: "تم حجز 3,200 د.إ لصفقة آيفون 15 برو في الضمان المالي.",
    read: false,
    createdAt: "2026-07-04T11:30:00+04:00",
    href: "/escrow",
  },
  {
    id: "notif-003",
    type: "listing_approved",
    title: "تمت الموافقة على الإعلان",
    body: "إعلانك «نيسان باترول بلاتينيوم 2022» أصبح نشطاً الآن.",
    read: false,
    createdAt: "2026-07-03T09:15:00+04:00",
    href: "/dashboard/listings",
  },
  {
    id: "notif-004",
    type: "order_created",
    title: "طلب جديد",
    body: "تم إنشاء طلب جديد بقيمة 201,825 د.إ.",
    read: true,
    createdAt: "2026-07-02T14:00:00+04:00",
    href: "/orders",
  },
  {
    id: "notif-005",
    type: "payment_released",
    title: "تم إطلاق الضمان",
    body: "تم إطلاق مبلغ 3,312 د.إ للبائع بعد تأكيد الاستلام.",
    read: true,
    createdAt: "2026-07-01T10:00:00+04:00",
    href: "/escrow",
  },
  {
    id: "notif-006",
    type: "dispute_opened",
    title: "نزاع مفتوح",
    body: "تم فتح نزاع على طلب نيسان باترول. فريق الدعم يراجع الحالة.",
    read: true,
    createdAt: "2026-06-30T08:30:00+04:00",
    href: "/disputes/new",
  },
  {
    id: "notif-007",
    type: "wallet_updated",
    title: "تحديث المحفظة",
    body: "تم إيداع 1,500 د.إ في محفظتك بنجاح.",
    read: true,
    createdAt: "2026-06-28T14:30:00+04:00",
    href: "/wallet",
  },
  {
    id: "notif-008",
    type: "listing_rejected",
    title: "تم رفض الإعلان",
    body: "إعلان «طاولة طعام خشبية» يحتاج تعديل الصور قبل النشر.",
    read: true,
    createdAt: "2026-06-25T16:00:00+04:00",
    href: "/dashboard/listings",
  },
];

let mockNotifications = structuredClone(initialNotifications);

export function getMockNotifications(): NotificationRecord[] {
  return [...mockNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getMockUnreadNotificationsCount(): number {
  return mockNotifications.filter((item) => !item.read).length;
}

export function markMockNotificationRead(id: string): NotificationRecord | undefined {
  const index = mockNotifications.findIndex((item) => item.id === id);
  if (index === -1) {
    return undefined;
  }

  mockNotifications[index] = { ...mockNotifications[index], read: true };
  return mockNotifications[index];
}

export function markAllMockNotificationsRead(): NotificationRecord[] {
  mockNotifications = mockNotifications.map((item) => ({ ...item, read: true }));
  return getMockNotifications();
}

export function getMockRecentNotifications(limit = 4): NotificationRecord[] {
  return getMockNotifications().slice(0, limit);
}

export function resetMockNotifications() {
  mockNotifications = structuredClone(initialNotifications);
}
