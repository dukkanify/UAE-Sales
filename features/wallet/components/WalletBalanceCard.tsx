"use client";

import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

export function WalletBalanceCard() {
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    const sync = () => {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        setAvailable(0);
        return;
      }
      fetch(`/api/wallet?userId=${encodeURIComponent(sessionUser.id)}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailable(Number(data.wallet?.availableBalance) || 0);
        })
        .catch(() => setAvailable(0));
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  return (
<LocalizedTree>
    <Card className="p-5" variant="flat">
      <p className="text-xs font-medium text-muted">الرصيد المتاح</p>
      <div className="mt-1">
        <CurrencyAmount amount={available} size="lg" />
      </div>
      <Button className="mt-4 w-full" href="/wallet" size="sm" variant="secondary">
        المحفظة
      </Button>
    </Card>
  </LocalizedTree>
);
}
