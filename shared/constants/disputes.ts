import type { DisputeReasonCode } from "@/types/domain/admin";

export const DISPUTE_REASON_OPTIONS: {
  code: DisputeReasonCode;
  hint: string;
  label: string;
}[] = [
  {
    code: "not_as_described",
    label: "السلعة مختلفة عن الوصف",
    hint: "اذكر الفروقات عن الإعلان وأرفق صوراً واضحة.",
  },
  {
    code: "not_received",
    label: "لم تصل السلعة",
    hint: "حدد الموعد المتفق عليه وأي تواصل مع البائع.",
  },
  {
    code: "damaged",
    label: "تالفة أو مكسورة",
    hint: "صوّر التلف عند الاستلام والغلاف إن وُجد.",
  },
  {
    code: "wrong_item",
    label: "صنف أو مقاس خطأ",
    hint: "وضّح المطلوب وما وصل فعلياً.",
  },
  {
    code: "seller_unresponsive",
    label: "البائع لا يرد",
    hint: "اذكر آخر محاولة تواصل وتاريخها.",
  },
  {
    code: "other",
    label: "سبب آخر",
    hint: "اشرح المشكلة باختصار مع الأدلة.",
  },
];

export const DISPUTE_REASON_LABELS: Record<DisputeReasonCode, string> =
  Object.fromEntries(
    DISPUTE_REASON_OPTIONS.map((item) => [item.code, item.label]),
  ) as Record<DisputeReasonCode, string>;
