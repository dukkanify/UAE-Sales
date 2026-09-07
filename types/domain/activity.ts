export type ActivityKind =
  | "job_application"
  | "viewing_booking"
  | "quote_request"
  | "service_booking"
  | "order"
  | "listing"
  | "dispute";

export type ActivityScope = "mine" | "received";

export type ActivityRecord = {
  id: string;
  kind: ActivityKind;
  scope: ActivityScope;
  status: string;
  statusLabel: string;
  title: string;
  subtitle?: string;
  listingId?: string;
  listingTitle?: string;
  listingSlug?: string;
  counterpartyName?: string;
  counterpartyId?: string;
  emirate?: string;
  categoryId?: string;
  nextAction?: string;
  href: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivitySummary = {
  jobApplications: number;
  viewingBookings: number;
  quoteRequests: number;
  serviceBookings: number;
  orders: number;
  listings: number;
  disputes: number;
  receivedTotal: number;
  mineTotal: number;
};

export type ActivityQuery = {
  scope?: ActivityScope | "all";
  kind?: ActivityKind;
  status?: string;
  query?: string;
  emirate?: string;
  categoryId?: string;
  userId?: string;
  sellerId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest";
};

export type ActivityListResult = {
  items: ActivityRecord[];
  total: number;
  page: number;
  pageSize: number;
  summary: ActivitySummary;
};
