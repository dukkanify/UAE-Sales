"use client";

import * as React from "react";
import { BarChart3, Download, Percent } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { REFUND_STATUS_LABELS } from "@/constants/payments";
import { formatMinor } from "@/services/payments/money";
import { payFetch, payJson } from "@/features/payments/lib/api";
import type { Coupon, RefundRequest } from "@/types/payments";

type FinanceDash = {
  platformRevenue: number;
  netRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  pendingPayments: number;
  instructorEarnings: number;
  refundRequests: number;
  refundTotal: number;
  topSellingCourses: Array<{ name: string; revenue: number; orders: number }>;
  revenueByInstructor: Array<{
    name: string;
    available: number;
    pending: number;
    lifetime: number;
  }>;
  monthlyGrowth: Array<{ name: string; value: number }>;
  currency: string;
};

function FinanceDashboard() {
  const [dash, setDash] = React.useState<FinanceDash | null>(null);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [refunds, setRefunds] = React.useState<RefundRequest[]>([]);
  const [code, setCode] = React.useState("SAVE15");
  const [value, setValue] = React.useState("15");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [d, c, r] = await Promise.all([
      payFetch<FinanceDash>("/api/payments/reports"),
      payFetch<Coupon[]>("/api/payments/catalog?view=coupons"),
      payFetch<RefundRequest[]>("/api/payments/refunds"),
    ]);
    setDash(d.data);
    setCoupons(c.data ?? []);
    setRefunds(r.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function createCoupon() {
    const result = await payJson("/api/payments/catalog", "POST", {
      action: "coupon",
      code,
      type: "percent",
      value: Number(value),
      maxUses: 50,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    void load();
  }

  async function reviewRefund(id: string, decision: "approve" | "reject") {
    await payJson("/api/payments/refunds", "POST", {
      action: "review",
      refundId: id,
      decision,
      adminNotes: decision === "approve" ? "Approved by finance" : "Rejected",
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial dashboard"
        description="Platform revenue, instructor earnings, refunds, and coupon management."
        breadcrumbs={[{ label: "Finance" }, { label: "Payments" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {(["orders", "payments", "refunds", "payouts", "instructors", "ledger"] as const).map(
              (report) => (
                <Button key={report} size="sm" variant="outline" asChild>
                  <a href={`/api/payments/reports?format=csv&report=${report}`}>
                    <Download className="size-4" />
                    {report}
                  </a>
                </Button>
              ),
            )}
          </div>
        }
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {dash ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Platform revenue", dash.platformRevenue],
            ["Net revenue", dash.netRevenue],
            ["Instructor earnings", dash.instructorEarnings],
            ["Pending payments", dash.pendingPayments],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="font-display text-2xl">
                  {typeof value === "number" && String(label).includes("Pending")
                    ? value
                    : formatMinor(Number(value), dash.currency)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4" />
              Top selling courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dash?.topSellingCourses.map((c) => (
              <div key={c.name} className="flex justify-between text-sm">
                <span>
                  {c.name} · {c.orders} orders
                </span>
                <span>{formatMinor(c.revenue, dash.currency)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by instructor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dash?.revenueByInstructor.map((i) => (
              <div key={i.name} className="rounded-md border border-border px-3 py-2 text-sm">
                {i.name} · lifetime {formatMinor(i.lifetime, dash.currency)} · available{" "}
                {formatMinor(i.available, dash.currency)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="size-4" />
              Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-[140px]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CODE"
              />
              <Input
                className="max-w-[100px]"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="%"
              />
              <Button onClick={() => void createCoupon()}>Create</Button>
            </div>
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="font-mono">
                  {c.code} · {c.type} {c.value}
                </span>
                <Badge variant="secondary">
                  {c.usedCount}
                  {c.maxUses ? `/${c.maxUses}` : ""} used
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Refund center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {refunds.map((r) => (
              <div key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{r.refundNumber}</span>
                  <Badge variant="secondary">{REFUND_STATUS_LABELS[r.status]}</Badge>
                </div>
                <p className="mt-1">
                  {formatMinor(r.amount, r.currency)} · {r.reason}
                </p>
                {r.status === "requested" ? (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => void reviewRefund(r.id, "approve")}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void reviewRefund(r.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { FinanceDashboard };
