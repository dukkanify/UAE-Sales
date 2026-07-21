import type { JobApplication } from "@/types/domain/job-application";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "job-applications.json";

export async function getJobApplicationsForUser(
  userId: string,
): Promise<JobApplication[]> {
  const all = await loadCollection<JobApplication>(FILE);
  return all.filter((item) => item.applicantId === userId);
}

export async function getAllJobApplications(): Promise<JobApplication[]> {
  return loadCollection<JobApplication>(FILE);
}

export async function findJobApplication(
  applicantId: string,
  listingId: string,
): Promise<JobApplication | undefined> {
  const all = await loadCollection<JobApplication>(FILE);
  return all.find(
    (item) => item.applicantId === applicantId && item.listingId === listingId,
  );
}

export async function createJobApplication(
  input: Omit<JobApplication, "id" | "status" | "createdAt">,
): Promise<JobApplication> {
  const all = await loadCollection<JobApplication>(FILE);
  const application: JobApplication = {
    ...input,
    id: `job-${Date.now()}`,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
  all.unshift(application);
  await saveCollection(FILE, all);
  return application;
}

export async function updateJobApplicationStatus(
  id: string,
  status: JobApplication["status"],
): Promise<JobApplication | undefined> {
  const all = await loadCollection<JobApplication>(FILE);
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  all[index] = { ...all[index], status };
  await saveCollection(FILE, all);
  return all[index];
}
