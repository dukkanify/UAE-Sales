export async function getWalletSummary() {
  return {
    availableBalance: 2450,
    pendingBalance: 850,
    currency: "AED" as const,
    recentActivity: [
      {
        id: "txn-001",
        type: "deposit" as const,
        amount: 1500,
        description: "إيداع عبر بطاقة بنكية",
        date: "2026-06-28T14:30:00+04:00",
      },
      {
        id: "txn-002",
        type: "escrow_hold" as const,
        amount: -3200,
        description: "حجز ضمان — آيفون 15 برو",
        date: "2026-06-25T10:15:00+04:00",
      },
      {
        id: "txn-003",
        type: "release" as const,
        amount: 168000,
        description: "تحويل مبيعات — نيسان باترول",
        date: "2026-06-20T16:00:00+04:00",
      },
      {
        id: "txn-004",
        type: "withdrawal" as const,
        amount: -5000,
        description: "سحب إلى الحساب البنكي",
        date: "2026-06-15T09:00:00+04:00",
      },
    ],
  };
}
