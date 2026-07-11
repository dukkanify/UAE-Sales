export type QuoteRequestKind = "quote" | "service_booking";

export type QuoteRequest = {
  id: string;
  kind: QuoteRequestKind;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  phone: string;
  serviceRequired: string;
  description: string;
  emirate: string;
  area: string;
  preferredDate: string;
  preferredTime: string;
  budgetMin?: number;
  budgetMax?: number;
  attachmentName?: string;
  providerId: string;
  providerName: string;
  status: "submitted" | "quoted" | "accepted";
  createdAt: string;
};
