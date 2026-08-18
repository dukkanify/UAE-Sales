export type ListingReportReason =
  | "misleading"
  | "fraud"
  | "duplicate"
  | "prohibited"
  | "other";

export type ListingReportStatus = "open" | "reviewed";

export const LISTING_REPORT_REASON_LABELS: Record<ListingReportReason, string> = {
  misleading: "محتوى مضلل",
  fraud: "احتيال أو نصب",
  duplicate: "إعلان مكرر",
  prohibited: "محتوى ممنوع",
  other: "سبب آخر",
};

export type ListingReport = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  sellerId?: string;
  sellerName?: string;
  reason: ListingReportReason;
  details: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterUserId?: string;
  guest: boolean;
  publicToken?: string;
  status: ListingReportStatus;
  createdAt: string;
};

export type ListingReportReceipt = Pick<
  ListingReport,
  | "id"
  | "listingTitle"
  | "reason"
  | "details"
  | "reporterName"
  | "reporterEmail"
  | "reporterPhone"
  | "guest"
  | "publicToken"
  | "status"
  | "createdAt"
>;
