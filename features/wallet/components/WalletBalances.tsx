"use client";

import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import type { UserProfile } from "@/types";
import { getSessionUser } from "@/services/storage";

const formatter = new Intl.NumberFormat("ar-AE", { maximumFractionDigits: 0 });

type WalletBalancesProps = {
  defaultAvailable: number;
  defaultPending: number;
  defaultHeldInEscrow?: number;
};

export function WalletBalances({
  defaultAvailable,
  defaultPending,
  defaultHeldInEscrow = 0,
}: WalletBalancesProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ledger, setLedger] = useState({
    available: defaultAvailable,
    pending: defaultPending,
    heldInEscrow: defaultHeldInEscrow,
  });

  useEffect(() => {
    const sync = () => {
      const sessionUser = getSessionUser();
      setUser(sessionUser);
      if (!sessionUser) return;
      fetch(`/api/wallet?userId=${encodeURIComponent(sessionUser.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.wallet) {
            setLedger({
              available: data.wallet.availableBalance,
              pending: data.wallet.pendingBalance,
              heldInEscrow: data.wallet.heldInEscrow,
            });
          }
        })
        .catch(() => undefined);
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  const available = ledger.available || user?.walletBalance || defaultAvailable;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-sm font-medium text-muted">الرصيد المتاح</p>
        <p className="mt-2 text-3xl font-bold text-ink">
          {formatter.format(available)}{" "}
          <span className="text-sm font-medium text-muted">د.إ</span>
        </p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-sm font-medium text-muted">قيد المعالجة</p>
        <p className="mt-2 text-3xl font-bold text-ink">
          {formatter.format(ledger.pending)}{" "}
          <span className="text-sm font-medium text-muted">د.إ</span>
        </p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-sm font-medium text-muted">محجوز في الضمان</p>
        <p className="mt-2 text-3xl font-bold text-ink">
          {formatter.format(ledger.heldInEscrow)}{" "}
          <span className="text-sm font-medium text-muted">د.إ</span>
        </p>
      </div>
    </div>
  );
}
