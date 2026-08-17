"use client";

import { useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";

type WalletBalancesProps = {
  defaultAvailable?: number;
  defaultPending?: number;
  defaultHeldInEscrow?: number;
};

export function WalletBalances({
  defaultAvailable = 0,
  defaultPending = 0,
  defaultHeldInEscrow = 0,
}: WalletBalancesProps) {
  const [ledger, setLedger] = useState({
    available: defaultAvailable,
    pending: defaultPending,
    heldInEscrow: defaultHeldInEscrow,
  });

  useEffect(() => {
    const sync = () => {
      const sessionUser = getSessionUser();
      if (!sessionUser) return;
      fetch(`/api/wallet?userId=${encodeURIComponent(sessionUser.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.wallet) {
            setLedger({
              available: data.wallet.availableBalance ?? 0,
              pending: data.wallet.pendingBalance ?? 0,
              heldInEscrow: data.wallet.heldInEscrow ?? 0,
            });
          }
        })
        .catch(() => undefined);
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  const cards = [
    { label: "الرصيد المتاح", amount: ledger.available, hint: "جاهز للاستخدام أو السحب" },
    { label: "قيد المعالجة", amount: ledger.pending, hint: "عمليات لم تُكمل بعد" },
    { label: "محجوز في الضمان", amount: ledger.heldInEscrow, hint: "محتجز حتى تأكيد الصفقة" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[1.25rem] border border-border/80 bg-surface px-5 py-5 shadow-[var(--shadow-xs)]"
        >
          <p className="text-xs font-semibold text-muted">{card.label}</p>
          <div className="mt-2">
            <CurrencyAmount amount={card.amount} size="xl" />
          </div>
          <p className="mt-1.5 text-[11px] leading-5 text-muted">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
