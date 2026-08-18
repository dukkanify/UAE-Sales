import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { getAllOrders, getOrdersForUser } from "@/services/payments/order-store";
import type {
  AdminDisputePatch,
  AdminDisputeRecord,
  DisputeReasonCode,
} from "@/types/domain/admin";

const FILE = "disputes.json";

const DEMO_DISPUTES: AdminDisputeRecord[] = [
  {
    id: "dispute-001",
    orderId: "order-demo-1001",
    listingTitle: "نيسان باترول بلاتينيوم 2022",
    buyerName: "Ahmed Al Mansoori",
    sellerName: "Emirates Motors LLC",
    reason: "السيارة وصلت بحالة مختلفة عن الوصف — خدوش غير مذكورة في الإعلان.",
    status: "open",
    amount: 185000,
    createdAt: "2026-07-18T09:30:00+04:00",
  },
  {
    id: "dispute-002",
    orderId: "order-demo-1002",
    listingTitle: "آيفون 15 برو 128 جيجابايت",
    buyerName: "Sara Al Nuaimi",
    sellerName: "Ahmed Al Mansoori",
    reason: "الجهاز لم يُشحن خلال المهلة المتفق عليها رغم الدفع عبر الضمان.",
    status: "under_review",
    amount: 4200,
    createdAt: "2026-07-16T14:15:00+04:00",
  },
  {
    id: "dispute-003",
    orderId: "order-demo-1003",
    listingTitle: "فيلا نخلة جميرا",
    buyerName: "Khalid Al Suwaidi",
    sellerName: "Palm Properties",
    reason: "طلب استرداد عربون المعاينة بعد إلغاء البائع للموعد مرتين.",
    status: "open",
    amount: 5000,
    createdAt: "2026-07-19T11:00:00+04:00",
  },
  {
    id: "dispute-004",
    orderId: "order-demo-1004",
    listingTitle: "طاولة طعام عصرية 8 كراسي",
    buyerName: "Mariam Hassan",
    sellerName: "Home Studio Dubai",
    reason: "قطعة مكسورة عند الاستلام — البائع يرفض الاستبدال.",
    status: "resolved_buyer",
    amount: 2800,
    createdAt: "2026-07-10T16:45:00+04:00",
    resolutionNote: "تم استرداد المبلغ للمشتري وإغلاق الضمان.",
  },
];

async function loadDisputes(): Promise<AdminDisputeRecord[]> {
  const stored = await loadCollection<AdminDisputeRecord>(FILE).catch(
    () => [] as AdminDisputeRecord[],
  );
  if (stored.length === 0) {
    await saveCollection(FILE, DEMO_DISPUTES);
    return DEMO_DISPUTES.map((row) => ({ ...row }));
  }
  return stored.map((row) => ({ ...row }));
}

export async function createDispute(input: {
  orderId: string;
  listingTitle: string;
  buyerName: string;
  sellerName: string;
  buyerId?: string;
  sellerId?: string;
  reason: string;
  reasonCode?: DisputeReasonCode;
  amount: number;
  evidenceUrls?: string[];
  windowDays?: number;
  windowClosesAt?: string;
  responseDueAt?: string;
}): Promise<AdminDisputeRecord> {
  const disputes = await loadDisputes();
  const existing = disputes.find((row) => row.orderId === input.orderId);
  if (existing && (existing.status === "open" || existing.status === "under_review")) {
    return { ...existing };
  }

  const record: AdminDisputeRecord = {
    id: `dispute-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    listingTitle: input.listingTitle,
    buyerName: input.buyerName,
    sellerName: input.sellerName,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    reason: input.reason.trim(),
    reasonCode: input.reasonCode,
    status: "open",
    amount: input.amount,
    createdAt: new Date().toISOString(),
    evidenceUrls:
      input.evidenceUrls && input.evidenceUrls.length > 0
        ? input.evidenceUrls.filter((url) => url.trim().length > 0)
        : undefined,
    windowDays: input.windowDays,
    windowClosesAt: input.windowClosesAt,
    responseDueAt: input.responseDueAt,
  };

  disputes.unshift(record);
  await saveCollection(FILE, disputes);
  return { ...record };
}

/** Merge persisted disputes with live disputed orders from the site. */
export async function getAdminDisputes(): Promise<AdminDisputeRecord[]> {
  const [stored, orders] = await Promise.all([loadDisputes(), getAllOrders()]);
  const byOrder = new Map(stored.map((row) => [row.orderId, row]));

  for (const order of orders) {
    if (order.status !== "disputed") continue;
    if (byOrder.has(order.id)) continue;
    const row: AdminDisputeRecord = {
      id: `dispute-order-${order.id}`,
      orderId: order.id,
      listingTitle: order.listingTitle,
      buyerName: order.buyerName,
      sellerName: order.sellerName,
      reason: "نزاع مفتوح من طلب الضمان في الموقع.",
      status: "open",
      amount: order.fees.total,
      createdAt: order.updatedAt || order.createdAt,
    };
    byOrder.set(order.id, row);
  }

  return Array.from(byOrder.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function patchAdminDispute(
  id: string,
  patch: AdminDisputePatch,
): Promise<AdminDisputeRecord | undefined> {
  const disputes = await getAdminDisputes();
  const index = disputes.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  disputes[index] = { ...disputes[index], ...patch };
  await saveCollection(FILE, disputes);
  return { ...disputes[index] };
}

export async function getOpenDisputeCount(): Promise<number> {
  const disputes = await getAdminDisputes();
  return disputes.filter(
    (item) => item.status === "open" || item.status === "under_review",
  ).length;
}

export async function getDisputesForUser(
  userId: string,
): Promise<AdminDisputeRecord[]> {
  const [disputes, orders] = await Promise.all([
    getAdminDisputes(),
    getOrdersForUser(userId),
  ]);
  const orderIds = new Set(orders.map((order) => order.id));
  return disputes.filter(
    (item) =>
      item.buyerId === userId ||
      item.sellerId === userId ||
      orderIds.has(item.orderId),
  );
}

export async function getDisputeById(
  id: string,
): Promise<AdminDisputeRecord | undefined> {
  const disputes = await getAdminDisputes();
  return disputes.find((item) => item.id === id);
}
