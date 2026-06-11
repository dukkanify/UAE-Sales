export async function getWalletSummary() {
  return {
    availableBalance: 0,
    pendingBalance: 0,
    currency: "AED" as const,
  };
}
