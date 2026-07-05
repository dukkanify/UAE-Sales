export async function getEscrowTransactions() {
  return [
    {
      id: "escrow-001",
      listingTitle: "آيفون 15 برو 128 جيجابايت",
      amount: 3200,
      status: "held" as const,
      buyer: "سارة الكعبي",
      createdAt: "2026-06-25T10:15:00+04:00",
    },
    {
      id: "escrow-002",
      listingTitle: "طقم كنب إيطالي فاخر",
      amount: 18500,
      status: "released" as const,
      buyer: "محمد الشامسي",
      createdAt: "2026-06-18T14:00:00+04:00",
    },
    {
      id: "escrow-003",
      listingTitle: "سوني بلايستيشن 5",
      amount: 1899,
      status: "pending_delivery" as const,
      buyer: "علي النعيمي",
      createdAt: "2026-06-29T09:30:00+04:00",
    },
  ];
}

export async function getEscrowSummary() {
  return {
    activeHolds: 2,
    totalProtected: 12413,
    currency: "AED" as const,
  };
}
