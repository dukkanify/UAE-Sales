"use client";

import * as React from "react";
import { CreditCard, Tag, Upload } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CHECKOUT_PAYMENT_MODE_LABELS,
  PAYMENT_METHOD_LABELS,
  PRICING_MODEL_LABELS,
} from "@/constants/payments";
import { formatMinor } from "@/services/payments/money";
import { payFetch, payJson } from "@/features/payments/lib/api";
import { ensureBrowserCsrf, csrfHeaders } from "@/features/auth/services/auth-api";
import type {
  CatalogProduct,
  CheckoutPaymentMode,
  Order,
  PaymentMethodBrand,
  PaymentRecord,
  RegionalPaymentRule,
  StudentKycDocument,
} from "@/types/payments";

function CheckoutView() {
  const [products, setProducts] = React.useState<CatalogProduct[]>([]);
  const [selected, setSelected] = React.useState<string>("");
  const [coupon, setCoupon] = React.useState("");
  const [billingName, setBillingName] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [billingCountry, setBillingCountry] = React.useState("KW");
  const [method, setMethod] = React.useState<PaymentMethodBrand>("visa");
  const [token, setToken] = React.useState("tok_4242");
  const [paymentMode, setPaymentMode] = React.useState<CheckoutPaymentMode>("full");
  const [modes, setModes] = React.useState<CheckoutPaymentMode[]>(["full"]);
  const [rule, setRule] = React.useState<RegionalPaymentRule | null>(null);
  const [agreementText, setAgreementText] = React.useState("");
  const [agreementAccepted, setAgreementAccepted] = React.useState(false);
  const [passport, setPassport] = React.useState<StudentKycDocument | null>(null);
  const [installmentCount, setInstallmentCount] = React.useState(4);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    void payFetch<CatalogProduct[]>("/api/payments/catalog?active=1").then((r) => {
      setProducts(r.data ?? []);
      const atpl = r.data?.find((p) => p.metadata?.sku === "ATPL-PACKAGE");
      setSelected(atpl?.id ?? r.data?.[0]?.id ?? "");
    });
    void payFetch<StudentKycDocument[]>("/api/payments/kyc").then((r) => {
      setPassport(r.data?.[0] ?? null);
    });
  }, []);

  React.useEffect(() => {
    void payFetch<{
      rule: RegionalPaymentRule;
      modes: CheckoutPaymentMode[];
      agreementText: string;
      defaultInstallmentCount: number;
    }>(`/api/payments/regional-rules?country=${billingCountry}`).then((r) => {
      if (!r.data) return;
      setRule(r.data.rule);
      setModes(r.data.modes);
      setAgreementText(r.data.agreementText);
      setInstallmentCount(r.data.defaultInstallmentCount);
      if (!r.data.modes.includes(paymentMode)) {
        setPaymentMode(r.data.modes[0] ?? "full");
      }
    });
  }, [billingCountry, paymentMode]);

  const product = products.find((p) => p.id === selected);
  const needsKyc =
    paymentMode !== "full" && Boolean(rule?.requiresPassport || rule?.requiresAgreement);

  async function uploadPassport(file: File) {
    setError(null);
    await ensureBrowserCsrf();
    const form = new FormData();
    form.append("file", file);
    const headers = new Headers(csrfHeaders());
    headers.delete("Content-Type");
    const res = await fetch("/api/payments/kyc", {
      method: "POST",
      headers,
      credentials: "include",
      body: form,
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: StudentKycDocument;
      error?: string;
    };
    if (!json.success || !json.data) {
      setError(json.error ?? "Passport upload failed");
      return;
    }
    setPassport(json.data);
    setSuccess("Passport uploaded");
  }

  async function startCheckout() {
    setError(null);
    setSuccess(null);
    if (needsKyc && rule?.requiresAgreement && !agreementAccepted) {
      setError("Accept the installment agreement to continue.");
      return;
    }
    if (needsKyc && rule?.requiresPassport && !passport) {
      setError("Upload your passport before installments or BNPL.");
      return;
    }

    const result = await payJson<Order>("/api/payments/orders", "POST", {
      action: "checkout",
      productId: selected,
      billingName,
      billingEmail,
      billingCountry,
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

    const payMethod: PaymentMethodBrand =
      paymentMode === "tamara" ? "tamara" : paymentMode === "tabby" ? "tabby" : method;

    const paid = await payJson<{ order: Order; payment: PaymentRecord }>(
      "/api/payments/orders",
      "POST",
      {
        action: "pay",
        orderId: result.data.id,
        methodBrand: payMethod,
        paymentToken: token,
        paymentMode,
        installmentCount,
        agreementAccepted,
        passportDocumentId: passport?.id ?? null,
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
    } else if (paymentMode === "installments") {
      setSuccess(
        `First installment received — ${paid.data.order.orderNumber}. Remaining dues are on your billing schedule.`,
      );
    } else {
      setError(paid.data.order.failureReason ?? "Payment failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secure checkout"
        description="ATPL package checkout with full payment, installments, or Tamara / Tabby (تالي) by country."
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
                  <Badge variant="secondary">{PRICING_MODEL_LABELS[product.pricingModel]}</Badge>
                </div>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
                <p className="mt-3 font-display text-2xl">
                  {product.isFree ? "Free" : formatMinor(product.priceAmount, product.currency)}
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
              Regional payment & KYC
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
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
            >
              {["KW", "SA", "AE", "BH", "QA", "OM", "XX"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {rule ? (
              <p className="text-xs text-muted-foreground">
                {rule.countryName}: {rule.notes}
              </p>
            ) : null}

            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as CheckoutPaymentMode)}
            >
              {modes.map((m) => (
                <option key={m} value={m}>
                  {CHECKOUT_PAYMENT_MODE_LABELS[m]}
                </option>
              ))}
            </select>

            {paymentMode === "installments" ? (
              <Input
                type="number"
                min={2}
                max={rule?.maxInstallments ?? 4}
                value={installmentCount}
                onChange={(e) => setInstallmentCount(Number(e.target.value) || 4)}
              />
            ) : null}

            {paymentMode === "full" || paymentMode === "installments" ? (
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethodBrand)}
              >
                {Object.entries(PAYMENT_METHOD_LABELS)
                  .filter(([k]) => !["tamara", "tabby"].includes(k))
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
              </select>
            ) : null}

            {paymentMode === "full" || paymentMode === "installments" ? (
              <Input
                placeholder="Payment token (never enter a real card number)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                {CHECKOUT_PAYMENT_MODE_LABELS[paymentMode]} will open a mock BNPL checkout for this
                country.
              </p>
            )}

            {needsKyc ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                {rule?.requiresPassport ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Passport upload</p>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadPassport(file);
                      }}
                    />
                    {passport ? (
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {passport.fileName} ({passport.status})
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {rule?.requiresAgreement ? (
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={agreementAccepted}
                      onChange={(e) => setAgreementAccepted(e.target.checked)}
                    />
                    <span>
                      I accept the installment / BNPL agreement
                      <span className="mt-1 block max-h-24 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                        {agreementText}
                      </span>
                    </span>
                  </label>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void startCheckout()}>
                <Upload className="mr-2 size-4" />
                Pay securely
              </Button>
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
