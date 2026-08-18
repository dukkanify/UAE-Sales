export type ListingReportReason =
  | "misleading"
  | "fraud"
  | "duplicate"
  | "prohibited"
  | "other";

export type ListingReportStatus = "open" | "reviewed";

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
  status: ListingReportStatus;
  createdAt: string;
};
