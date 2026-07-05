import type { EscrowFaqItem } from "@/types";
import { getEscrowSummary, getEscrowTransactions } from "@/services/wallet/wallet.service";

export { getEscrowSummary, getEscrowTransactions };

export const ESCROW_FAQ: EscrowFaqItem[] = [
  {
    question: "ما هو الضمان المالي؟",
    answer:
      "نظام يحجز مبلغ الشراء بأمان لدى المنصة حتى يؤكد المشتري استلام المنتج، مما يحمي الطرفين.",
  },
  {
    question: "متى يحصل البائع على المبلغ؟",
    answer:
      "بعد تأكيد المشتري استلام المنتج، يُطلق المبلغ تلقائياً إلى محفظة البائع.",
  },
  {
    question: "ماذا يحدث عند فتح نزاع؟",
    answer:
      "يتم تجميد المبلغ مؤقتاً ويراجع فريق الدعم الأدلة من الطرفين خلال 48 ساعة.",
  },
  {
    question: "هل يمكن الاسترداد؟",
    answer:
      "نعم، إذا لم يستلم المشتري المنتج أو كان مختلفاً عن الوصف، يمكن طلب استرداد كامل أو جزئي.",
  },
];
