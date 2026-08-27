import type { QuoteRequest } from "@/types/domain/quote-request";
import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";

const store = createPayloadCollectionStore<QuoteRequest>({
  table: "quote_requests",
  fileName: "sooqna-quote-requests.json",
});

const DUPLICATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export async function getQuoteRequestsForProvider(
  providerId: string,
): Promise<QuoteRequest[]> {
  const all = await store.listAll();
  return all.filter((item) => item.providerId === providerId);
}

export async function getQuoteRequestsForUser(
  userId: string,
): Promise<QuoteRequest[]> {
  const all = await store.listAll();
  return all.filter((item) => item.requesterId === userId);
}

export async function getAllQuoteRequests(): Promise<QuoteRequest[]> {
  return store.listAll();
}

export async function findRecentQuoteRequest(
  requesterId: string,
  listingId: string,
): Promise<QuoteRequest | undefined> {
  const all = await store.listAll();
  const cutoff = Date.now() - DUPLICATE_WINDOW_MS;
  return all.find(
    (item) =>
      item.requesterId === requesterId &&
      item.listingId === listingId &&
      new Date(item.createdAt).getTime() >= cutoff,
  );
}

export async function createQuoteRequest(
  input: Omit<QuoteRequest, "id" | "status" | "createdAt">,
): Promise<QuoteRequest> {
  const now = new Date().toISOString();
  const request: QuoteRequest = {
    ...input,
    id: `quote-${Date.now()}`,
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };
  await store.upsert(request);
  return request;
}

export async function updateQuoteRequestStatus(
  id: string,
  status: QuoteRequest["status"],
): Promise<QuoteRequest | undefined> {
  const all = await store.listAll();
  const current = all.find((item) => item.id === id);
  if (!current) return undefined;
  const next = { ...current, status, updatedAt: new Date().toISOString() };
  await store.upsert(next);
  return next;
}
