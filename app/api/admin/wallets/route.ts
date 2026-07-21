import { NextResponse } from "next/server";
import { getAllWalletAccounts } from "@/services/payments/wallet-ledger";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const wallets = await getAllWalletAccounts();
  const summary = {
    accounts: wallets.length,
    available: wallets.reduce((sum, w) => sum + w.availableBalance, 0),
    pending: wallets.reduce((sum, w) => sum + w.pendingBalance, 0),
    held: wallets.reduce((sum, w) => sum + w.heldInEscrow, 0),
    currency: "AED" as const,
  };

  return NextResponse.json({
    summary,
    wallets: wallets.map((wallet) => ({
      userId: wallet.userId,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      heldInEscrow: wallet.heldInEscrow,
      currency: wallet.currency,
      transactionsCount: wallet.transactions.length,
      lastTransaction: wallet.transactions[0] ?? null,
    })),
  });
}
