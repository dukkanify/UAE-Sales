import { randomBytes } from "node:crypto";
import type {
  ListingReport,
  ListingReportReceipt,
  ListingReportStatus,
} from "@/types/domain/listing-report";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "listing-reports.json";

function toReceipt(report: ListingReport): ListingReportReceipt {
  return {
    id: report.id,
    listingTitle: report.listingTitle,
    reason: report.reason,
    details: report.details,
    reporterName: report.reporterName,
    reporterEmail: report.reporterEmail,
    reporterPhone: report.reporterPhone,
    guest: report.guest,
    publicToken: report.publicToken ?? "",
    status: report.status,
    createdAt: report.createdAt,
  };
}

export async function getAllListingReports(): Promise<ListingReport[]> {
  return loadCollection<ListingReport>(FILE);
}

export async function getListingReportById(
  id: string,
): Promise<ListingReport | undefined> {
  const all = await loadCollection<ListingReport>(FILE);
  return all.find((item) => item.id === id);
}

export async function getListingReportReceipt(
  id: string,
  token: string,
): Promise<ListingReportReceipt | undefined> {
  const report = await getListingReportById(id);
  if (!report || !token || !report.publicToken || report.publicToken !== token) {
    return undefined;
  }
  return toReceipt(report);
}

export async function createListingReport(
  input: Omit<ListingReport, "id" | "status" | "createdAt" | "publicToken">,
): Promise<ListingReport> {
  const all = await loadCollection<ListingReport>(FILE);
  const report: ListingReport = {
    ...input,
    id: `lrep-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`,
    publicToken: randomBytes(9).toString("base64url"),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  all.unshift(report);
  await saveCollection(FILE, all);
  return report;
}

export function listingReportReceipt(report: ListingReport): ListingReportReceipt {
  return toReceipt(report);
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
