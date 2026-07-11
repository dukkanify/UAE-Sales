"use client";

import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import type { UserProfile } from "@/types";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

type WalletBalanceCardProps = {
  fallbackAvailable?: number;
  fallbackPending?: number;
};

export function WalletBalanceCard({
  fallbackAvailable = 2450,
  fallbackPending = 850,
}: WalletBalanceCardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  const available = user?.walletBalance ?? fallbackAvailable;
  const pending = fallbackPending;

  return (
    <Card className="p-5" variant="flat">
      <p className="text-xs font-medium text-muted">رصيد المحفظة</p>
      <div className="mt-1">
        <CurrencyAmount amount={available} size="lg" />
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted">
        <CurrencyAmount amount={pending} size="sm" />
        <span>قيد المعالجة</span>
      </p>
      <Button className="mt-4 w-full" href="/wallet" size="sm" variant="secondary">
        إدارة المحفظة
      </Button>
    </Card>
  );
}
