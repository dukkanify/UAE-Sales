import type { Order } from "@/types/domain/order";
import type { AdminListingRecord } from "@/types/domain/admin";

export type DailyPoint = {
  date: string;
  label: string;
  orders: number;
  volume: number;
  fees: number;
};

export type StatusSlice = {
  key: string;
  label: string;
  count: number;
};

export function buildDailySeries(orders: Order[], days = 7): DailyPoint[] {
  const points: DailyPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("ar-AE", {
      weekday: "short",
      day: "numeric",
    });

    const dayOrders = orders.filter((order) => {
      const created = order.createdAt?.slice(0, 10);
      return created === key && order.paymentStatus === "succeeded";
    });

    points.push({
      date: key,
      label,
      orders: dayOrders.length,
      volume: dayOrders.reduce((sum, o) => sum + o.fees.total, 0),
      fees: dayOrders.reduce((sum, o) => sum + o.fees.platformFee, 0),
    });
  }

  return points;
}

export function buildOrderStatusSlices(orders: Order[]): StatusSlice[] {
  const map = new Map<string, number>();
  for (const order of orders) {
    map.set(order.status, (map.get(order.status) ?? 0) + 1);
  }

  const labels: Record<string, string> = {
    pending_payment: "بانتظار الدفع",
    paid_held_in_escrow: "مدفوع — ضمان",
    delivered: "تم التسليم",
    confirmed: "مؤكد",
    released: "محرّر",
    refunded: "مسترد",
    disputed: "نزاع",
  };

  return [...map.entries()]
    .map(([key, count]) => ({
      key,
      label: labels[key] ?? key,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildListingCategorySlices(
  listings: AdminListingRecord[],
): StatusSlice[] {
  const map = new Map<string, number>();
  for (const listing of listings) {
    map.set(listing.categoryId, (map.get(listing.categoryId) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function buildPaymentStatusSlices(orders: Order[]): StatusSlice[] {
  const map = new Map<string, number>();
  for (const order of orders) {
    map.set(order.paymentStatus, (map.get(order.paymentStatus) ?? 0) + 1);
  }
  const labels: Record<string, string> = {
    pending: "معلّق",
    processing: "قيد المعالجة",
    succeeded: "ناجح",
    failed: "فشل",
    refunded: "مسترد",
    cancelled: "ملغى",
  };
  return [...map.entries()]
    .map(([key, count]) => ({
      key,
      label: labels[key] ?? key,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
