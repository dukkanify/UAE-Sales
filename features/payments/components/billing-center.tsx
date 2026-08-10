"use client";

import * as React from "react";
import { Download, FileText, Receipt } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORDER_STATUS_LABELS,
  INSTALLMENT_PLAN_STATUS_LABELS,
  INSTALLMENT_ITEM_STATUS_LABELS,
} from "@/constants/payments";
import { formatMinor } from "@/services/payments/money";
import { payFetch, payJson } from "@/features/payments/lib/api";
import type {
  InstallmentPlan,
  InstallmentScheduleItem,
  Invoice,
  Order,
  RefundRequest,
  Subscription,
} from "@/types/payments";

function BillingCenter() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [subs, setSubs] = React.useState<Subscription[]>([]);
  const [refunds, setRefunds] = React.useState<RefundRequest[]>([]);
  const [installments, setInstallments] = React.useState<
    Array<{ plan: InstallmentPlan; schedule: InstallmentScheduleItem[] }>
  >([]);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [o, i, s, r, inst] = await Promise.all([
      payFetch<Order[]>("/api/payments/orders"),
      payFetch<Invoice[]>("/api/payments/invoices"),
      payFetch<Subscription[]>("/api/payments/orders?view=subscriptions"),
      payFetch<RefundRequest[]>("/api/payments/refunds"),
      payFetch<Array<{ plan: InstallmentPlan; schedule: InstallmentScheduleItem[] }>>(
        "/api/payments/installments",
      ),
    ]);
    setOrders(o.data ?? []);
    setInvoices(i.data ?? []);
    setSubs(s.data ?? []);
    setRefunds(r.data ?? []);
    setInstallments(inst.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function requestRefund(orderId: string) {
    const result = await payJson("/api/payments/refunds", "POST", {
      action: "request",
      orderId,
      reason: "Student requested refund from billing center",
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    void load();
  }

  async function payInstallment(plan: InstallmentPlan, item: InstallmentScheduleItem) {
    const result = await payJson("/api/payments/orders", "POST", {
      action: "pay",
      orderId: plan.orderId,
      scheduleItemId: item.id,
      methodBrand: "visa",
      paymentToken: "tok_4242",
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing center"
        description="Orders, installment schedules, invoices, and refund requests."
        breadcrumbs={[{ label: "Student" }, { label: "Billing" }]}
        actions={
          <Button asChild size="sm">
            <a href="/student/checkout">Checkout</a>
          </Button>
        }
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Installment plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {installments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No installment plans yet.</p>
          ) : (
            installments.map(({ plan, schedule }) => (
              <div key={plan.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{plan.productName}</span>
                  <Badge variant="secondary">{INSTALLMENT_PLAN_STATUS_LABELS[plan.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.mode} · {plan.countryCode} · {formatMinor(plan.totalAmount, plan.currency)}
                </p>
                <ul className="mt-2 space-y-1">
                  {schedule.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 px-2 py-1"
                    >
                      <span>
                        #{item.sequence} · {formatMinor(item.amount, item.currency)} · due{" "}
                        {new Date(item.dueAt).toLocaleDateString()} ·{" "}
                        {INSTALLMENT_ITEM_STATUS_LABELS[item.status]}
                      </span>
                      {item.status === "due" || item.status === "overdue" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void payInstallment(plan, item)}
                        >
                          Pay
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{o.orderNumber}</span>
                  <Badge variant="secondary">{ORDER_STATUS_LABELS[o.status]}</Badge>
                </div>
                <p className="mt-1">
                  {o.items[0]?.productName} · {formatMinor(o.totalAmount, o.currency)}
                </p>
                {o.status === "paid" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7 px-2"
                    onClick={() => void requestRefund(o.id)}
                  >
                    Request refund
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-mono text-xs">{inv.invoiceNumber}</p>
                  <p>{formatMinor(inv.totalAmount, inv.currency)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`/api/payments/invoices?id=${inv.id}&print=1`, "_blank")
                  }
                >
                  <Download className="size-4" />
                  PDF
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active subscriptions.</p>
          ) : (
            subs.map((s) => (
              <div key={s.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {s.productName} · {s.status} · renews{" "}
                {new Date(s.currentPeriodEnd).toLocaleDateString()}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Refund history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {refunds.map((r) => (
            <div key={r.id} className="rounded-md border border-border px-3 py-2 text-sm">
              {r.refundNumber} · {r.status} · {formatMinor(r.amount, r.currency)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export { BillingCenter };
