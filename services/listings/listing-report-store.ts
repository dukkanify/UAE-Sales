import type {
  ListingReport,
  ListingReportStatus,
} from "@/types/domain/listing-report";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "listing-reports.json";

export async function getAllListingReports(): Promise<ListingReport[]> {
  return loadCollection<ListingReport>(FILE);
}

export async function createListingReport(
  input: Omit<ListingReport, "id" | "status" | "createdAt">,
): Promise<ListingReport> {
  const all = await loadCollection<ListingReport>(FILE);
  const report: ListingReport = {
    ...input,
    id: `lrep-${Date.now()}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  all.unshift(report);
  await saveCollection(FILE, all);
  return report;
}

export async function updateListingReportStatus(
  id: string,
  status: ListingReportStatus,
): Promise<ListingReport | undefined> {
  const all = await loadCollection<ListingReport>(FILE);
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  all[index] = { ...all[index], status };
  await saveCollection(FILE, all);
  return all[index];
}
