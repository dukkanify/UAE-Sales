"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";

type WalletRow = {
  availableBalance: number;
  currency: string;
  heldInEscrow: number;
  lastTransaction: { date: string; description: string; type: string } | null;
  pendingBalance: number;
  transactionsCount: number;
  userId: string;
};

type WalletsPayload = {
  summary: {
    accounts: number;
    available: number;
    currency: string;
    held: number;
    pending: number;
  };
  wallets: WalletRow[];
};

export function AdminWalletsPanel() {
  const [data, setData] = useState<WalletsPayload | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/wallets", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.summary) setData(payload as WalletsPayload);
      })
      .catch(() => undefined);
  }, []);

  if (!data) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل المحافظ...</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">عدد المحافظ</p>
          <p className="admin-ops__kpi-value">{data.summary.accounts}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">متاح</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={data.summary.available} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">معلّق</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={data.summary.pending} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">محجوز ضمان</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={data.summary.held} size="md" />
          </div>
        </div>
      </div>

      <ul className="admin-ops__queue">
        {data.wallets.length === 0 ? (
          <li className="admin-ops__queue-item">
            <p className="admin-ops__queue-meta">لا توجد محافظ بعد.</p>
          </li>
        ) : (
          data.wallets.map((wallet) => (
            <li key={wallet.userId} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{wallet.userId}</p>
                <p className="admin-ops__queue-meta">
                  {wallet.transactionsCount} حركة
                  {wallet.lastTransaction
                    ? ` · ${wallet.lastTransaction.type} — ${new Date(
                        wallet.lastTransaction.date,
                      ).toLocaleString("ar-AE")}`
                    : ""}
                </p>
              </div>
              <div className="text-end text-xs font-bold">
                <CurrencyAmount amount={wallet.availableBalance} size="sm" />
                <p className="admin-ops__queue-meta">
                  محجوز {wallet.heldInEscrow.toLocaleString("ar-AE")}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      <Link className="admin-ops__text-link" href="/admin/escrow">
        عرض الضمان ←
      </Link>
    </div>
  );
}
