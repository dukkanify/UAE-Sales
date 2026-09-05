import type { ActivityKind } from "@/types/domain/activity";
import type { JobApplication } from "@/types/domain/job-application";
import type { QuoteRequest } from "@/types/domain/quote-request";
import type { ViewingBooking } from "@/types/domain/viewing-booking";
import type { Order } from "@/types/domain/order";
import type { Listing } from "@/types";
import type { AdminDisputeRecord } from "@/types/domain/admin";

const JOB_STATUS: Record<JobApplication["status"], string> = {
  submitted: "جديد",
  viewed: "تمت المشاهدة",
  reviewed: "تمت المشاهدة",
  shortlisted: "Shortlisted",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const VIEWING_STATUS: Record<ViewingBooking["status"], string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  cancelled: "ملغى",
  completed: "مكتمل",
};

const QUOTE_STATUS: Record<QuoteRequest["status"], string> = {
  submitted: "مقدّم",
  quoted: "تم إرسال عرض",
  accepted: "مقبول",
  rejected: "مرفوض",
  completed: "مكتمل",
};

const ORDER_STATUS: Record<Order["status"], string> = {
  pending_payment: "بانتظار الدفع",
  paid_held_in_escrow: "مدفوع — ضمان",
  delivered: "تم التوصيل",
  confirmed: "مؤكد",
  released: "تم الإفراج",
  disputed: "نزاع",
  refunded: "مسترد",
};

const LISTING_STATUS: Record<Listing["status"], string> = {
  active: "منشور",
  pending_review: "قيد المراجعة",
  rejected: "مرفوض",
  expired: "منتهي",
  draft: "مسودة",
};

const DISPUTE_STATUS: Record<AdminDisputeRecord["status"], string> = {
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved_buyer: "حُلّ لصالح المشتري",
  resolved_seller: "حُلّ لصالح البائع",
  closed: "مغلق",
};

export function activityKindLabel(kind: ActivityKind): string {
  const labels: Record<ActivityKind, string> = {
    job_application: "طلب توظيف",
    viewing_booking: "حجز معاينة",
    quote_request: "طلب عرض سعر",
    service_booking: "حجز خدمة",
    order: "طلب شراء",
    listing: "إعلان",
    dispute: "نزاع",
  };
  return labels[kind];
}

export function jobStatusLabel(status: JobApplication["status"]): string {
  return JOB_STATUS[status] ?? status;
}

export function viewingStatusLabel(status: ViewingBooking["status"]): string {
  return VIEWING_STATUS[status] ?? status;
}

export function quoteStatusLabel(status: QuoteRequest["status"]): string {
  return QUOTE_STATUS[status] ?? status;
}

export function orderStatusLabel(status: Order["status"]): string {
  return ORDER_STATUS[status] ?? status;
}

export function listingStatusLabel(status: Listing["status"]): string {
  return LISTING_STATUS[status] ?? status;
}

export function disputeStatusLabel(status: AdminDisputeRecord["status"]): string {
  return DISPUTE_STATUS[status] ?? status;
}

export function nextActionForJob(status: JobApplication["status"], scope: "mine" | "received"): string | undefined {
  if (scope === "mine") {
    if (status === "submitted") return "بانتظار مراجعة صاحب العمل";
    if (status === "shortlisted") return "تابع مع صاحب العمل";
    if (status === "accepted") return "تم قبول طلبك";
    if (status === "rejected") return "تم رفض الطلب";
    return undefined;
  }
  if (status === "submitted") return "راجع الطلب";
  if (status === "viewed" || status === "reviewed") return "حدّث الحالة";
  return undefined;
}

export function nextActionForViewing(status: ViewingBooking["status"], scope: "mine" | "received"): string | undefined {
  if (scope === "mine") {
    if (status === "pending") return "بانتظار تأكيد الموعد";
    if (status === "confirmed") return "موعد مؤكد";
    return undefined;
  }
  if (status === "pending") return "أكّد الموعد";
  if (status === "confirmed") return "أكمل أو ألغِ الموعد";
  return undefined;
}

export function nextActionForQuote(status: QuoteRequest["status"], scope: "mine" | "received"): string | undefined {
  if (scope === "mine") {
    if (status === "submitted") return "بانتظار الرد";
    if (status === "quoted") return "راجع العرض";
    return undefined;
  }
  if (status === "submitted") return "أرسل عرضاً";
  if (status === "quoted") return "تابع مع العميل";
  return undefined;
}

export function listingHref(listingId?: string, listingSlug?: string): string {
  if (listingId?.startsWith("local-")) return `/listings/local/${listingId}`;
  if (listingSlug) return `/listings/${listingSlug}`;
  return "/search";
}
