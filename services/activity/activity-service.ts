import { getAdminDisputes } from "@/services/admin/dispute-store";
import { getJobApplicationsForEmployer, getJobApplicationsForUser } from "@/services/job-applications/job-application-store";
import { getAllListings } from "@/services/listings/listing-store";
import { getOrdersForUser } from "@/services/payments/order-store";
import { getQuoteRequestsForProvider, getQuoteRequestsForUser } from "@/services/quote-requests/quote-request-store";
import { getViewingBookingsForSeller, getViewingBookingsForUser } from "@/services/viewing-bookings/viewing-booking-store";
import {
  activityKindLabel,
  disputeStatusLabel,
  jobStatusLabel,
  listingHref,
  listingStatusLabel,
  nextActionForJob,
  nextActionForQuote,
  nextActionForViewing,
  orderStatusLabel,
  quoteStatusLabel,
  viewingStatusLabel,
} from "@/services/activity/activity-labels";
import type {
  ActivityKind,
  ActivityListResult,
  ActivityQuery,
  ActivityRecord,
  ActivityScope,
  ActivitySummary,
} from "@/types/domain/activity";
import type { JobApplication } from "@/types/domain/job-application";
import type { QuoteRequest } from "@/types/domain/quote-request";
import type { ViewingBooking } from "@/types/domain/viewing-booking";
import type { Listing } from "@/types";
import type { Order } from "@/types/domain/order";
import type { AdminDisputeRecord } from "@/types/domain/admin";

function updatedAt(iso?: string, fallback?: string): string {
  return iso || fallback || new Date().toISOString();
}

function mapJob(item: JobApplication, scope: ActivityScope): ActivityRecord {
  return {
    id: item.id,
    kind: "job_application",
    scope,
    status: item.status,
    statusLabel: jobStatusLabel(item.status),
    title: item.listingTitle,
    subtitle: scope === "mine" ? item.employerName : item.applicantName,
    listingId: item.listingId,
    listingTitle: item.listingTitle,
    listingSlug: item.listingSlug,
    counterpartyName: scope === "mine" ? item.employerName : item.applicantName,
    counterpartyId: scope === "mine" ? item.employerId : item.applicantId,
    nextAction: nextActionForJob(item.status, scope),
    href: listingHref(item.listingId, item.listingSlug),
    createdAt: item.createdAt,
    updatedAt: updatedAt(item.updatedAt, item.createdAt),
  };
}

function mapViewing(item: ViewingBooking, scope: ActivityScope): ActivityRecord {
  return {
    id: item.id,
    kind: "viewing_booking",
    scope,
    status: item.status,
    statusLabel: viewingStatusLabel(item.status),
    title: item.listingTitle,
    subtitle: `${item.date} · ${item.time}`,
    listingId: item.listingId,
    listingTitle: item.listingTitle,
    listingSlug: item.listingSlug,
    counterpartyName: scope === "mine" ? item.sellerName : item.buyerName,
    counterpartyId: scope === "mine" ? item.sellerId : item.buyerId,
    nextAction: nextActionForViewing(item.status, scope),
    href: listingHref(item.listingId, item.listingSlug),
    createdAt: item.createdAt,
    updatedAt: updatedAt(item.updatedAt, item.createdAt),
  };
}

function mapQuote(item: QuoteRequest, scope: ActivityScope): ActivityRecord {
  const kind: ActivityKind = item.kind === "service_booking" ? "service_booking" : "quote_request";
  return {
    id: item.id,
    kind,
    scope,
    status: item.status,
    statusLabel: quoteStatusLabel(item.status),
    title: item.listingTitle,
    subtitle: item.serviceRequired,
    listingId: item.listingId,
    listingTitle: item.listingTitle,
    listingSlug: item.listingSlug,
    emirate: item.emirate,
    counterpartyName: scope === "mine" ? item.providerName : item.requesterName,
    counterpartyId: scope === "mine" ? item.providerId : item.requesterId,
    nextAction: nextActionForQuote(item.status, scope),
    href: listingHref(item.listingId, item.listingSlug),
    createdAt: item.createdAt,
    updatedAt: updatedAt(item.updatedAt, item.createdAt),
  };
}

function mapOrder(item: Order, scope: ActivityScope): ActivityRecord {
  const isBuyer = scope === "mine";
  return {
    id: item.id,
    kind: "order",
    scope,
    status: item.status,
    statusLabel: orderStatusLabel(item.status),
    title: item.listingTitle,
    subtitle: isBuyer ? item.sellerName : item.buyerName,
    listingId: item.listingId,
    listingTitle: item.listingTitle,
    listingSlug: item.listingSlug,
    counterpartyName: isBuyer ? item.sellerName : item.buyerName,
    counterpartyId: isBuyer ? item.sellerId : item.buyerId ?? undefined,
    nextAction:
      item.status === "pending_payment"
        ? "أكمل الدفع"
        : item.status === "paid_held_in_escrow"
          ? "تابع حالة الطلب"
          : undefined,
    href: `/orders/${item.id}`,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapListing(item: Listing): ActivityRecord {
  return {
    id: item.id,
    kind: "listing",
    scope: "mine",
    status: item.status,
    statusLabel: listingStatusLabel(item.status),
    title: item.title,
    subtitle: item.emirate ?? item.city,
    listingId: item.id,
    listingTitle: item.title,
    listingSlug: item.slug,
    emirate: item.emirate ?? item.city,
    categoryId: item.categoryId,
    nextAction:
      item.status === "pending_review"
        ? "بانتظار مراجعة المنصة"
        : item.status === "active"
          ? "إعلان منشور"
          : undefined,
    href: listingHref(item.id, item.slug),
    createdAt: item.postedAt ?? new Date().toISOString(),
    updatedAt: item.postedAt ?? new Date().toISOString(),
  };
}

function mapDispute(
  item: AdminDisputeRecord,
  scope: ActivityScope,
  order?: Order,
): ActivityRecord {
  return {
    id: item.id,
    kind: "dispute",
    scope,
    status: item.status,
    statusLabel: disputeStatusLabel(item.status),
    title: item.listingTitle,
    subtitle: scope === "mine" ? item.sellerName : item.buyerName,
    listingTitle: item.listingTitle,
    counterpartyName: scope === "mine" ? item.sellerName : item.buyerName,
    nextAction: item.status === "open" ? "تابع النزاع" : undefined,
    href: `/orders/${item.orderId}`,
    createdAt: item.createdAt,
    updatedAt: order?.updatedAt ?? item.createdAt,
  };
}

function buildSummary(items: ActivityRecord[]): ActivitySummary {
  const mine = items.filter((item) => item.scope === "mine");
  const received = items.filter((item) => item.scope === "received");
  const countKind = (scope: ActivityScope, kind: ActivityKind) =>
    items.filter((item) => item.scope === scope && item.kind === kind).length;

  return {
    jobApplications: countKind("mine", "job_application"),
    viewingBookings: countKind("mine", "viewing_booking"),
    quoteRequests:
      countKind("mine", "quote_request") + countKind("mine", "service_booking"),
    serviceBookings: countKind("mine", "service_booking"),
    orders: countKind("mine", "order") + countKind("received", "order"),
    listings: countKind("mine", "listing"),
    disputes: countKind("mine", "dispute") + countKind("received", "dispute"),
    receivedTotal: received.length,
    mineTotal: mine.length,
  };
}

function matchesQuery(item: ActivityRecord, query: ActivityQuery): boolean {
  if (query.scope && query.scope !== "all" && item.scope !== query.scope) return false;
  if (query.kind && item.kind !== query.kind) return false;
  if (query.status && item.status !== query.status) return false;
  if (query.emirate && item.emirate !== query.emirate) return false;
  if (query.categoryId && item.categoryId !== query.categoryId) return false;
  if (query.userId && item.counterpartyId !== query.userId && item.scope === "received") {
    // admin filter by participant
  }
  if (query.sellerId && item.counterpartyId !== query.sellerId && item.scope === "mine") {
    // noop for now
  }
  if (query.from && item.createdAt < query.from) return false;
  if (query.to && item.createdAt > query.to) return false;
  if (query.query) {
    const needle = query.query.trim().toLowerCase();
    const haystack = [item.title, item.subtitle, item.counterpartyName, item.statusLabel]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function paginate(
  items: ActivityRecord[],
  query: ActivityQuery,
): ActivityListResult {
  const sorted = [...items].sort((a, b) => {
    const diff = b.updatedAt.localeCompare(a.updatedAt);
    return query.sort === "oldest" ? -diff : diff;
  });
  const filtered = sorted.filter((item) => matchesQuery(item, query));
  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
  const page = Math.max(query.page ?? 1, 1);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    summary: buildSummary(sorted),
  };
}

export async function getActivitiesForUser(
  userId: string,
  query: ActivityQuery = {},
): Promise<ActivityListResult> {
  const [
    myJobs,
    receivedJobs,
    myViewings,
    receivedViewings,
    myQuotes,
    receivedQuotes,
    orders,
    listings,
    disputes,
  ] = await Promise.all([
    getJobApplicationsForUser(userId),
    getJobApplicationsForEmployer(userId),
    getViewingBookingsForUser(userId),
    getViewingBookingsForSeller(userId),
    getQuoteRequestsForUser(userId),
    getQuoteRequestsForProvider(userId),
    getOrdersForUser(userId),
    getAllListings(),
    getAdminDisputes(),
  ]);

  const myListings = listings.filter((item) => item.seller.id === userId);
  const orderById = new Map(orders.map((order) => [order.id, order]));
  const myDisputes = disputes.filter((item) => {
    const order = orderById.get(item.orderId);
    return order?.buyerId === userId;
  });
  const receivedDisputes = disputes.filter((item) => {
    const order = orderById.get(item.orderId);
    return order?.sellerId === userId;
  });

  const items: ActivityRecord[] = [
    ...myJobs.map((item) => mapJob(item, "mine")),
    ...receivedJobs.map((item) => mapJob(item, "received")),
    ...myViewings.map((item) => mapViewing(item, "mine")),
    ...receivedViewings.map((item) => mapViewing(item, "received")),
    ...myQuotes.map((item) => mapQuote(item, "mine")),
    ...receivedQuotes.map((item) => mapQuote(item, "received")),
    ...orders.map((order) =>
      mapOrder(order, order.buyerId === userId ? "mine" : "received"),
    ),
    ...myListings.map(mapListing),
    ...myDisputes.map((item) => mapDispute(item, "mine", orderById.get(item.orderId))),
    ...receivedDisputes.map((item) =>
      mapDispute(item, "received", orderById.get(item.orderId)),
    ),
  ];

  return paginate(items, query);
}

export async function getActivitiesForAdmin(
  query: ActivityQuery = {},
): Promise<ActivityListResult> {
  const [
    jobs,
    viewings,
    quotes,
    orders,
    listings,
    disputes,
  ] = await Promise.all([
    import("@/services/job-applications/job-application-store").then((m) =>
      m.getAllJobApplications(),
    ),
    import("@/services/viewing-bookings/viewing-booking-store").then((m) =>
      m.getAllViewingBookings(),
    ),
    import("@/services/quote-requests/quote-request-store").then((m) =>
      m.getAllQuoteRequests(),
    ),
    import("@/services/payments/order-store").then((m) => m.getAllOrders()),
    getAllListings(),
    getAdminDisputes(),
  ]);

  const orderById = new Map(orders.map((order) => [order.id, order]));

  const items: ActivityRecord[] = [
    ...jobs.map((item) => ({
      ...mapJob(item, "mine"),
      subtitle: `${item.applicantName} → ${item.employerName}`,
      counterpartyName: item.applicantName,
    })),
    ...viewings.map((item) => ({
      ...mapViewing(item, "mine"),
      subtitle: `${item.buyerName} · ${item.date} ${item.time}`,
    })),
    ...quotes.map((item) => ({
      ...mapQuote(item, "mine"),
      subtitle: `${item.requesterName} → ${item.providerName}`,
    })),
    ...orders.map((order) => mapOrder(order, "mine")),
    ...listings.map(mapListing),
    ...disputes.map((item) => mapDispute(item, "mine", orderById.get(item.orderId))),
  ];

  return paginate(items, { ...query, scope: query.scope ?? "all" });
}

export function activityTypeOptions(): { value: ActivityKind; label: string }[] {
  return (
    [
      "job_application",
      "viewing_booking",
      "quote_request",
      "service_booking",
      "order",
      "listing",
      "dispute",
    ] as ActivityKind[]
  ).map((value) => ({ value, label: activityKindLabel(value) }));
}
