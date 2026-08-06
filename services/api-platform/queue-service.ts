/**
 * Background job queue (in-process worker; Redis-ready interface).
 */

import { generateId } from "@/lib/security/crypto";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import { ensureApiPlatformStore, writeApiPlatformStore } from "@/services/api-platform/store";
import type { JobType, QueueJob } from "@/types/api-platform";

export function enqueueJob(input: {
  type: JobType;
  payload: Record<string, unknown>;
  maxAttempts?: number;
  scheduledAt?: string;
}): QueueJob {
  ensureApiPlatformSeeded();
  const job: QueueJob = {
    id: generateId(),
    type: input.type,
    status: "queued",
    payload: input.payload,
    result: null,
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    lastError: null,
    scheduledAt: input.scheduledAt ?? new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    createdAt: new Date().toISOString(),
  };
  const db = ensureApiPlatformStore();
  db.queueJobs.unshift(job);
  writeApiPlatformStore(db);
  return job;
}

export function listJobs(filters?: { status?: string; type?: string; limit?: number }) {
  ensureApiPlatformSeeded();
  let rows = [...ensureApiPlatformStore().queueJobs];
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((j) => j.status === filters.status);
  }
  if (filters?.type && filters.type !== "all") {
    rows = rows.filter((j) => j.type === filters.type);
  }
  return rows.slice(0, filters?.limit ?? 100);
}

export function getQueueStatus() {
  ensureApiPlatformSeeded();
  const jobs = ensureApiPlatformStore().queueJobs;
  return {
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    deadLetter: jobs.filter((j) => j.status === "failed" && j.attempts >= j.maxAttempts).length,
  };
}

async function runJob(job: QueueJob): Promise<Record<string, unknown>> {
  switch (job.type) {
    case "webhook": {
      const { processWebhookDelivery } = await import("@/services/api-platform/webhook-service");
      const deliveryId = String(job.payload.deliveryId ?? "");
      const result = await processWebhookDelivery(deliveryId);
      if (!result.ok) throw new Error(result.error || "webhook failed");
      return result as unknown as Record<string, unknown>;
    }
    case "email": {
      const { sendEmail } = await import("@/services/email/mailer");
      const to = String(job.payload.to ?? "");
      const subject = String(job.payload.subject ?? "AviatorPass notification");
      const html = String(job.payload.html ?? job.payload.body ?? "");
      const text = String(job.payload.text ?? html.replace(/<[^>]+>/g, " "));
      const result = await sendEmail({
        to,
        subject,
        html,
        text,
        meta: { kind: "queue", jobId: job.id },
      });
      if (!result.success) throw new Error(result.error || "email send failed");
      return {
        sent: true,
        delivered: result.delivered,
        mode: result.mode,
        outboxId: result.outboxId,
        to,
      };
    }
    case "notification":
      return { delivered: true, mocked: true };
    case "report":
      return { generated: true, reportId: generateId() };
    case "certificate":
      return { generated: true, certificateId: job.payload.certificateId ?? null };
    case "import":
    case "export":
      return { processed: true, jobRef: job.payload.jobId ?? null };
    default:
      return { ok: true };
  }
}

/** Process up to `limit` queued jobs whose schedule has passed. */
export async function processQueue(limit = 10) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const now = Date.now();
  const candidates = db.queueJobs
    .filter((j) => j.status === "queued" && new Date(j.scheduledAt).getTime() <= now)
    .slice(0, limit);

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const job of candidates) {
    job.status = "running";
    job.startedAt = new Date().toISOString();
    job.attempts += 1;
    writeApiPlatformStore(db);
    try {
      job.result = await runJob(job);
      job.status = "completed";
      job.finishedAt = new Date().toISOString();
      job.lastError = null;
      results.push({ id: job.id, ok: true });
    } catch (err) {
      job.lastError = err instanceof Error ? err.message : "job failed";
      job.status = job.attempts >= job.maxAttempts ? "failed" : "queued";
      if (job.status === "failed") job.finishedAt = new Date().toISOString();
      results.push({ id: job.id, ok: false, error: job.lastError });
    }
    writeApiPlatformStore(db);
  }

  return { processed: results.length, results };
}
