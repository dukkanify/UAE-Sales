"use client";

import * as React from "react";
import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PAYOUT_STATUS_LABELS } from "@/constants/payments";
import { formatMinor } from "@/services/payments/money";
import { payFetch, payJson } from "@/features/payments/lib/api";
import type {
  InstructorWallet,
  PayoutRequest,
  WalletTransaction,
} from "@/types/payments";

function WalletDashboard({ manage = false }: { manage?: boolean }) {
  const [wallet, setWallet] = React.useState<InstructorWallet | null>(null);
  const [txns, setTxns] = React.useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = React.useState<PayoutRequest[]>([]);
  const [allWallets, setAllWallets] = React.useState<InstructorWallet[]>([]);
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (manage) {
      const all = await payFetch<InstructorWallet[]>("/api/payments/wallet?view=all");
      setAllWallets(all.data ?? []);
    }
    const detail = await payFetch<{
      wallet: InstructorWallet;
      transactions: WalletTransaction[];
    }>("/api/payments/wallet?view=transactions");
    setWallet(detail.data?.wallet ?? null);
    setTxns(detail.data?.transactions ?? []);
    const p = await payFetch<PayoutRequest[]>("/api/payments/wallet?view=payouts");
    setPayouts(p.data ?? []);
  }, [manage]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function requestPayout() {
    const result = await payJson("/api/payments/wallet", "POST", {
      action: "request_payout",
      amount: Number(amount),
      methodSummary: "Bank transfer",
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setAmount("");
    void load();
  }

  async function review(payoutId: string, decision: "approve" | "reject" | "paid" | "review") {
    await payJson("/api/payments/wallet", "POST", {
      action: "review_payout",
      payoutId,
      decision,
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={manage ? "Instructor wallets" : "Instructor wallet"}
        description="Available balance, pending earnings, payouts, and revenue breakdown."
        breadcrumbs={[{ label: "Finance" }, { label: "Wallet" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {wallet ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Available", wallet.availableBalance],
            ["Pending", wallet.pendingBalance],
            ["Lifetime earned", wallet.lifetimeEarned],
            ["Withdrawn", wallet.lifetimeWithdrawn],
          ].map(([label, value]) => (
            <Card key={String(label)}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="font-display text-2xl">
                  {formatMinor(Number(value), wallet.currency)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {wallet ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue mix</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
            <p>Courses: {formatMinor(wallet.courseRevenue, wallet.currency)}</p>
            <p>Live classes: {formatMinor(wallet.liveClassRevenue, wallet.currency)}</p>
            <p>Subscriptions: {formatMinor(wallet.subscriptionRevenue, wallet.currency)}</p>
          </CardContent>
        </Card>
      ) : null}

      {!manage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4" />
              Request payout
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Input
              placeholder="Amount in minor units (fils)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => void requestPayout()}>Submit request</Button>
          </CardContent>
        </Card>
      ) : null}

      {manage && allWallets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All instructor wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allWallets.map((w) => (
              <div key={w.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {w.instructorName} · available {formatMinor(w.availableBalance, w.currency)} ·
                lifetime {formatMinor(w.lifetimeEarned, w.currency)}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Earning history</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 space-y-2 overflow-auto">
            {txns.map((t) => (
              <div key={t.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span>{t.description}</span>
                  <span>
                    {t.direction === "credit" ? "+" : "-"}
                    {formatMinor(t.amount, t.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.type}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payout requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{p.payoutNumber}</span>
                  <Badge variant="secondary">{PAYOUT_STATUS_LABELS[p.status]}</Badge>
                </div>
                <p className="mt-1">
                  {p.instructorName} · {formatMinor(p.amount, p.currency)}
                </p>
                {manage ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => void review(p.id, "review")}>
                      Review
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void review(p.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void review(p.id, "paid")}>
                      Mark paid
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void review(p.id, "reject")}>
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

export { WalletDashboard };
