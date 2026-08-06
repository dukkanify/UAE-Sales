/**
 * Certificate template management.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { CERTIFICATE_TEMPLATE_FIELDS, DEFAULT_CERTIFICATE_BODY } from "@/constants/certificates";
import { logActivity } from "@/services/auth/activity-log";
import { getPublicBrandConfig } from "@/services/settings/settings-service";
import { assertCanManageCertificates, CertificateError } from "@/services/certificates/access";
import { readCertificatesDb, writeCertificatesDb } from "@/services/certificates/store";
import type { CertificateTemplate } from "@/types/certificates";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function listTemplates(): CertificateTemplate[] {
  return readCertificatesDb()
    .templates.filter((t) => !t.archivedAt)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
}

export function getTemplateById(id: string): CertificateTemplate | null {
  return readCertificatesDb().templates.find((t) => t.id === id && !t.archivedAt) ?? null;
}

export function getDefaultTemplate(): CertificateTemplate | null {
  return listTemplates().find((t) => t.isDefault) ?? listTemplates()[0] ?? null;
}

export async function createTemplate(input: {
  user: UserProfile;
  name: string;
  description?: string;
  isDefault?: boolean;
  bodyHtml?: string;
  primaryColor?: string;
  accentColor?: string;
  signatureName?: string;
  signatureTitle?: string;
  logoUrl?: string | null;
  backgroundUrl?: string | null;
  signatureImageUrl?: string | null;
}): Promise<CertificateTemplate> {
  assertCanManageCertificates(input.user);
  if (!input.name.trim()) throw new CertificateError("Template name required");
  const brand = getPublicBrandConfig();
  const stamp = nowIso();
  const template: CertificateTemplate = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description ?? "",
    isDefault: Boolean(input.isDefault),
    logoUrl: input.logoUrl ?? brand.logoUrl,
    backgroundUrl: input.backgroundUrl ?? null,
    primaryColor: input.primaryColor ?? brand.primaryColor ?? "#0B1F33",
    accentColor: input.accentColor ?? brand.accentColor ?? "#C5A46E",
    signatureName: input.signatureName ?? "AviatorPass Academic Board",
    signatureTitle: input.signatureTitle ?? "Director of Training",
    signatureImageUrl: input.signatureImageUrl ?? null,
    bodyHtml: input.bodyHtml ?? DEFAULT_CERTIFICATE_BODY,
    fields: [...CERTIFICATE_TEMPLATE_FIELDS],
    createdAt: stamp,
    updatedAt: stamp,
    archivedAt: null,
  };
  writeCertificatesDb((d) => {
    if (template.isDefault) {
      d.templates = d.templates.map((t) => ({ ...t, isDefault: false }));
    }
    d.templates.unshift(template);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.CERTIFICATE_TEMPLATE_UPDATED,
    entityType: "certificate_template",
    entityId: template.id,
  });
  return template;
}

export async function updateTemplate(input: {
  user: UserProfile;
  id: string;
  patch: Partial<Omit<CertificateTemplate, "id" | "createdAt" | "fields" | "archivedAt">>;
}): Promise<CertificateTemplate> {
  assertCanManageCertificates(input.user);
  const existing = getTemplateById(input.id);
  if (!existing) throw new CertificateError("Template not found", 404);
  const next: CertificateTemplate = {
    ...existing,
    ...input.patch,
    updatedAt: nowIso(),
  };
  writeCertificatesDb((d) => {
    if (next.isDefault) {
      d.templates = d.templates.map((t) => (t.id === next.id ? next : { ...t, isDefault: false }));
    } else {
      const idx = d.templates.findIndex((t) => t.id === input.id);
      if (idx >= 0) d.templates[idx] = next;
    }
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.CERTIFICATE_TEMPLATE_UPDATED,
    entityType: "certificate_template",
    entityId: next.id,
  });
  return next;
}
