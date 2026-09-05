"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";

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
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/wallets")
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.summary) setData(payload as WalletsPayload);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdjust() {
    const session = getSessionUser();
    if (!session) return;
    const parsedAmount = Number(amount);
    if (!userId.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage("أدخل معرّف مستخدم ومبلغاً صالحاً.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await adminFetch("/api/admin/wallets", {
        method: "POST",
        body: JSON.stringify({
          userId: userId.trim(),
          amount: parsedAmount,
          type,
          description: description.trim() || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setMessage("تعذّر تعديل المحفظة.");
        return;
      }
      if (payload?.summary) setData(payload as WalletsPayload);
      setMessage(type === "deposit" ? "تم الإيداع." : "تم السحب.");
      setAmount("");
      setDescription("");
    } catch {
      setMessage("تعذّر تعديل المحفظة.");
    } finally {
      setBusy(false);
    }
  }

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

      <Card className="grid gap-3 p-5" variant="flat">
        <h2 className="text-sm font-bold text-ink">تعديل رصيد إداري</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="معرّف المستخدم"
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user-..."
            value={userId}
          />
          <Input
            label="المبلغ (د.إ)"
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            value={amount}
          />
          <Select
            label="النوع"
            onChange={(e) =>
              setType(
                e.target.value === "withdrawal" ? "withdrawal" : "deposit",
              )
            }
            options={[
              { label: "إيداع", value: "deposit" },
              { label: "سحب", value: "withdrawal" },
            ]}
            value={type}
          />
          <Input
            label="ملاحظة (اختياري)"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            loading={busy}
            onClick={handleAdjust}
            size="sm"
            variant="primary"
          >
            تنفيذ
          </Button>
          {message ? <p className="text-xs text-muted">{message}</p> : null}
        </div>
      </Card>

      <ul className="admin-ops__queue">
        {data.wallets.length === 0 ? (
          <li className="admin-ops__queue-item">
            <p className="admin-ops__queue-meta">لا توجد محافظ بعد.</p>
          </li>
        ) : (
          data.wallets.map((wallet) => (
            <li key={wallet.userId} className="admin-ops__queue-item">
              <div>
                <button
                  className="admin-ops__queue-label text-start"
                  onClick={() => setUserId(wallet.userId)}
                  type="button"
                >
                  {wallet.userId}
                </button>
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
