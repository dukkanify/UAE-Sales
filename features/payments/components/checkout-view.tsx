"use client";

import * as React from "react";
import { CreditCard, Tag } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PAYMENT_METHOD_LABELS,
  PRICING_MODEL_LABELS,
} from "@/constants/payments";
import { formatMinor } from "@/services/payments/money";
import { payFetch, payJson } from "@/features/payments/lib/api";
import type {
  CatalogProduct,
  Order,
  PaymentMethodBrand,
  PaymentRecord,
} from "@/types/payments";

function CheckoutView() {
  const [products, setProducts] = React.useState<CatalogProduct[]>([]);
  const [selected, setSelected] = React.useState<string>("");
  const [coupon, setCoupon] = React.useState("");
  const [billingName, setBillingName] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [method, setMethod] = React.useState<PaymentMethodBrand>("visa");
  const [token, setToken] = React.useState("tok_4242");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    void payFetch<CatalogProduct[]>("/api/payments/catalog?active=1").then((r) => {
      setProducts(r.data ?? []);
      if (r.data?.[0]) setSelected(r.data[0].id);
    });
  }, []);

  const product = products.find((p) => p.id === selected);

  async function startCheckout() {
    setError(null);
    setSuccess(null);
    const result = await payJson<Order>("/api/payments/orders", "POST", {
      action: "checkout",
      productId: selected,
      billingName,
      billingEmail,
      couponCode: coupon || undefined,
      idempotencyKey: `ui-${selected}-${Date.now()}`,
    });
    if (!result.success || !result.data) {
      setError(result.error);
      return;
    }
    setOrder(result.data);
    if (result.data.status === "paid") {
      setSuccess(`Order ${result.data.orderNumber} completed (free / zero total).`);
      return;
    }
    const paid = await payJson<{ order: Order; payment: PaymentRecord }>(
      "/api/payments/orders",
      "POST",
      {
        action: "pay",
        orderId: result.data.id,
        methodBrand: method,
        paymentToken: token,
      },
    );
    if (!paid.success || !paid.data) {
      setError(paid.error);
      setOrder(paid.data?.order ?? result.data);
      return;
    }
    setOrder(paid.data.order);
    if (paid.data.order.status === "paid") {
      setSuccess(`Payment successful — ${paid.data.order.orderNumber}`);
    } else {
      setError(paid.data.order.failureReason ?? "Payment failed");
    }
  }

  async function retry() {
    if (!order) return;
    const paid = await payJson<{ order: Order; payment: PaymentRecord }>(
      "/api/payments/orders",
      "POST",
      {
        action: "retry",
        orderId: order.id,
        methodBrand: method,
        paymentToken: token === "fail" ? "tok_ok" : token,
      },
    );
    if (!paid.success || !paid.data) {
      setError(paid.error);
      return;
    }
    setOrder(paid.data.order);
    setError(null);
    setSuccess(`Retry succeeded — ${paid.data.order.orderNumber}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secure checkout"
        description="PCI-aware checkout — cards are tokenized; raw PAN is never stored."
        breadcrumbs={[{ label: "Billing" }, { label: "Checkout" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.isFree ? "Free" : formatMinor(p.priceAmount, p.currency)}
                </option>
              ))}
            </select>
            {product ? (
              <div className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="secondary">
                    {PRICING_MODEL_LABELS[product.pricingModel]}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
                <p className="mt-3 font-display text-2xl">
                  {product.isFree
                    ? "Free"
                    : formatMinor(product.priceAmount, product.currency)}
                </p>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <Button variant="outline" type="button">
                <Tag className="size-4" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Billing & payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Full name"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
            />
            <Input
              placeholder="Billing email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
            />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethodBrand)}
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Input
              placeholder="Payment token (never enter a real card number)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Demo: use token <code>fail</code> to simulate decline, then Retry.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void startCheckout()}>Pay securely</Button>
              {order?.status === "failed" ? (
                <Button variant="outline" onClick={() => void retry()}>
                  Retry payment
                </Button>
              ) : null}
            </div>
            {order ? (
              <p className="text-xs text-muted-foreground">
                {order.orderNumber} · {order.status} ·{" "}
                {formatMinor(order.totalAmount, order.currency)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { CheckoutView };
