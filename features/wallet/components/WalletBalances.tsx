"use client";

import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import type { UserProfile } from "@/types";
import { getSessionUser } from "@/services/storage";

const formatter = new Intl.NumberFormat("ar-AE", { maximumFractionDigits: 0 });

type WalletBalancesProps = {
  defaultAvailable: number;
  defaultPending: number;
};

export function WalletBalances({
  defaultAvailable,
  defaultPending,
}: WalletBalancesProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  const available = user?.walletBalance ?? defaultAvailable;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
          {formatter.format(defaultPending)}{" "}
          <span className="text-sm font-medium text-muted">د.إ</span>
        </p>
      </div>
    </div>
  );
}
