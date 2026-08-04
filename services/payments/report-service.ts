/**
 * Financial reporting + CSV export.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { assertCanManageFinance } from "@/services/payments/access";
import { listOrders, listPayments, listTransactionLogs } from "@/services/payments/checkout-service";
import { listRefunds } from "@/services/payments/refund-service";
import { listPayouts } from "@/services/payments/payout-service";
import { listWallets } from "@/services/payments/wallet-service";
import { readPaymentsDb } from "@/services/payments/store";
import { formatMinor } from "@/services/payments/money";
import type { UserProfile } from "@/types";

export function getFinanceDashboard() {
  const orders = listOrders();
  const paid = orders.filter((o) => o.status === "paid" || o.status === "refunded");
  const revenue = paid.reduce((s, o) => s + (o.status === "refunded" ? 0 : o.totalAmount), 0);
  const refunded = listRefunds().filter((r) => r.status === "processed");
  const refundTotal = refunded.reduce((s, r) => s + r.amount, 0);
  const pendingPayments = orders.filter((o) => o.status === "pending" || o.status === "failed").length;
  const wallets = listWallets();
  const instructorEarnings = wallets.reduce((s, w) => s + w.lifetimeEarned, 0);

  const byCourse = new Map<string, { name: string; revenue: number; orders: number }>();
  for (const o of paid.filter((x) => x.status === "paid")) {
    for (const item of o.items) {
      const key = item.courseId ?? item.productId;
      const row = byCourse.get(key) ?? { name: item.productName, revenue: 0, orders: 0 };
      row.revenue += item.totalAmount;
      row.orders += 1;
      byCourse.set(key, row);
    }
  }

  const byInstructor = wallets.map((w) => ({
    instructorId: w.instructorId,
    name: w.instructorName,
    available: w.availableBalance,
    pending: w.pendingBalance,
    lifetime: w.lifetimeEarned,
    courseRevenue: w.courseRevenue,
    liveClassRevenue: w.liveClassRevenue,
  }));

  const monthly = buildMonthlySeries(paid.filter((o) => o.status === "paid"));
  const daily = buildDailySeries(paid.filter((o) => o.status === "paid"));

  return {
    platformRevenue: revenue,
    netRevenue: revenue - refundTotal,
    monthlyRevenue: monthly[monthly.length - 1]?.value ?? 0,
    dailyRevenue: daily[daily.length - 1]?.value ?? 0,
    pendingPayments,
    instructorEarnings,
    refundRequests: listRefunds({ status: "requested" }).length,
    refundTotal,
    topSellingCourses: [...byCourse.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    revenueByInstructor: byInstructor,
    monthlyGrowth: monthly,
    dailyGrowth: daily,
    currency: readPaymentsDb().settings.currency,
  };
}

function buildMonthlySeries(orders: ReturnType<typeof listOrders>) {
  const map = new Map<string, number>();
  for (const o of orders) {
    const key = (o.paidAt ?? o.createdAt).slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + o.totalAmount);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => ({ name, value }));
}

function buildDailySeries(orders: ReturnType<typeof listOrders>) {
  const map = new Map<string, number>();
  for (const o of orders) {
    const key = (o.paidAt ?? o.createdAt).slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + o.totalAmount);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([name, value]) => ({ name, value }));
}

export function exportFinanceCsv(
  user: UserProfile,
  report: "orders" | "payments" | "refunds" | "payouts" | "ledger" | "instructors",
): string {
  assertCanManageFinance(user);
  const currency = readPaymentsDb().settings.currency;
  void formatMinor;
  void logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.FINANCE_REPORT_EXPORTED,
    entityType: "finance_report",
    entityId: report,
  });

  if (report === "orders") {
    const rows = listOrders();
    return toCsv(
      ["orderNumber", "student", "status", "total", "currency", "paidAt"],
      rows.map((o) => [
        o.orderNumber,
        o.studentEmail,
        o.status,
        String(o.totalAmount),
        o.currency,
        o.paidAt ?? "",
      ]),
    );
  }
  if (report === "payments") {
    return toCsv(
      ["id", "orderId", "status", "method", "amount", "provider"],
      listPayments().map((p) => [
        p.id,
        p.orderId,
        p.status,
        p.methodBrand,
        String(p.amount),
        p.provider,
      ]),
    );
  }
  if (report === "refunds") {
    return toCsv(
      ["refundNumber", "orderId", "status", "amount", "reason"],
      listRefunds().map((r) => [
        r.refundNumber,
        r.orderId,
        r.status,
        String(r.amount),
        r.reason,
      ]),
    );
  }
  if (report === "payouts") {
    return toCsv(
      ["payoutNumber", "instructor", "status", "amount", "currency"],
      listPayouts().map((p) => [
        p.payoutNumber,
        p.instructorName,
        p.status,
        String(p.amount),
        p.currency,
      ]),
    );
  }
  if (report === "instructors") {
    return toCsv(
      ["instructor", "available", "pending", "lifetime", "withdrawn", "currency"],
      listWallets().map((w) => [
        w.instructorName,
        String(w.availableBalance),
        String(w.pendingBalance),
        String(w.lifetimeEarned),
        String(w.lifetimeWithdrawn),
        w.currency || currency,
      ]),
    );
  }
  return toCsv(
    ["kind", "referenceId", "amount", "currency", "description", "createdAt"],
    listTransactionLogs(500).map((t) => [
      t.kind,
      t.referenceId,
      String(t.amount),
      t.currency,
      t.description,
      t.createdAt,
    ]),
  );
}

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}
