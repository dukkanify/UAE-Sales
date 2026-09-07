import type { JobApplication } from "@/types/domain/job-application";
import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";

const store = createPayloadCollectionStore<JobApplication>({
  table: "job_applications",
  fileName: "sooqna-job-applications.json",
});

export async function getJobApplicationsForEmployer(
  employerId: string,
): Promise<JobApplication[]> {
  const all = await store.listAll();
  return all.filter((item) => item.employerId === employerId);
}

export async function getJobApplicationsForUser(
  userId: string,
): Promise<JobApplication[]> {
  const all = await store.listAll();
  return all.filter((item) => item.applicantId === userId);
}

export async function getAllJobApplications(): Promise<JobApplication[]> {
  return store.listAll();
}

export async function findJobApplication(
  applicantId: string,
  listingId: string,
): Promise<JobApplication | undefined> {
  const all = await store.listAll();
  return all.find(
    (item) => item.applicantId === applicantId && item.listingId === listingId,
  );
}

export async function createJobApplication(
  input: Omit<JobApplication, "id" | "status" | "createdAt">,
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const application: JobApplication = {
    ...input,
    id: `job-${Date.now()}`,
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };
  await store.upsert(application);
  return application;
}

export async function updateJobApplicationStatus(
  id: string,
  status: JobApplication["status"],
): Promise<JobApplication | undefined> {
  const all = await store.listAll();
  const current = all.find((item) => item.id === id);
  if (!current) return undefined;
  const next = { ...current, status, updatedAt: new Date().toISOString() };
  await store.upsert(next);
  return next;
}
