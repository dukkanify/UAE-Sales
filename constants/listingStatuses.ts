import type { ListingStatus } from "@/types";

export const listingStatusLabels: Record<ListingStatus, string> = {
  active: "نشط",
  draft: "مسودة",
  expired: "منتهي",
  pending_review: "قيد المراجعة",
  rejected: "مرفوض",
};

export const listingStatusDescriptions: Record<ListingStatus, string> = {
  active: "الإعلان ظاهر للمشترين ويمكن استقبال المحادثات.",
  draft: "الإعلان محفوظ كمسودة ويحتاج إلى إكمال البيانات.",
  expired: "انتهت مدة الإعلان ويمكن إعادة تنشيطه.",
  pending_review: "الإعلان بانتظار مراجعة فريق المنصة.",
  rejected: "الإعلان يحتاج إلى تعديل قبل إعادة الإرسال.",
};
