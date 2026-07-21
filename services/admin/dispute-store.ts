import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { getAllOrders } from "@/services/payments/order-store";
import type { AdminDisputePatch, AdminDisputeRecord } from "@/types/domain/admin";

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
