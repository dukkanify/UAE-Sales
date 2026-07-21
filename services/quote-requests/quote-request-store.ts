import type { QuoteRequest } from "@/types/domain/quote-request";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "quote-requests.json";

const DUPLICATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export async function getQuoteRequestsForUser(
  userId: string,
): Promise<QuoteRequest[]> {
  const all = await loadCollection<QuoteRequest>(FILE);
  return all.filter((item) => item.requesterId === userId);
}

export async function getAllQuoteRequests(): Promise<QuoteRequest[]> {
  return loadCollection<QuoteRequest>(FILE);
}

export async function findRecentQuoteRequest(
  requesterId: string,
  listingId: string,
): Promise<QuoteRequest | undefined> {
  const all = await loadCollection<QuoteRequest>(FILE);
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
  const all = await loadCollection<QuoteRequest>(FILE);
  const request: QuoteRequest = {
    ...input,
    id: `quote-${Date.now()}`,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
  all.unshift(request);
  await saveCollection(FILE, all);
  return request;
}

export async function updateQuoteRequestStatus(
  id: string,
  status: QuoteRequest["status"],
): Promise<QuoteRequest | undefined> {
  const all = await loadCollection<QuoteRequest>(FILE);
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  all[index] = { ...all[index], status };
  await saveCollection(FILE, all);
  return all[index];
}
