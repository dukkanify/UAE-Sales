import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";

export type ApprovedFieldOption = {
  id: string;
  categoryId: string;
  fieldKey: string;
  label: string;
  value: string;
  enabled: boolean;
  createdAt: string;
  approvedByAdminId?: string;
};

const store = createPayloadCollectionStore<ApprovedFieldOption>({
  table: "approved_field_options",
  fileName: "sooqna-approved-field-options.json",
});

export async function listApprovedFieldOptions(input?: {
  categoryId?: string;
  fieldKey?: string;
}) {
  const rows = await store.listAll();
  return rows
    .filter((row) => row.enabled !== false)
    .filter((row) =>
      input?.categoryId ? row.categoryId === input.categoryId : true,
    )
    .filter((row) => (input?.fieldKey ? row.fieldKey === input.fieldKey : true))
    .sort((a, b) => a.label.localeCompare(b.label, "ar"));
}

export async function upsertApprovedFieldOption(input: {
  categoryId: string;
  fieldKey: string;
  label: string;
  value: string;
  approvedByAdminId?: string;
}): Promise<ApprovedFieldOption> {
  const rows = await store.listAll();
  const existing = rows.find(
    (row) =>
      row.categoryId === input.categoryId &&
      row.fieldKey === input.fieldKey &&
      row.value.toLowerCase() === input.value.trim().toLowerCase(),
  );
  if (existing) {
    const next: ApprovedFieldOption = {
      ...existing,
      label: input.label.trim(),
      value: input.value.trim(),
      enabled: true,
      approvedByAdminId: input.approvedByAdminId,
    };
    await store.upsert(next);
    return next;
  }

  const record: ApprovedFieldOption = {
    id: `afopt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    categoryId: input.categoryId,
    fieldKey: input.fieldKey,
    label: input.label.trim(),
    value: input.value.trim(),
    enabled: true,
    createdAt: new Date().toISOString(),
    approvedByAdminId: input.approvedByAdminId,
  };
  await store.upsert(record);
  return record;
}
