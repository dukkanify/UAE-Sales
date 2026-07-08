import { NextResponse } from "next/server";
import { getWalletAccount } from "@/services/payments/wallet-ledger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }

  const wallet = await getWalletAccount(userId);
  return NextResponse.json({ wallet });
}
