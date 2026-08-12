import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllAddresses } from "@/services/addresses/address-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const addresses = await getAllAddresses();
  return NextResponse.json({
    summary: {
      total: addresses.length,
      users: new Set(addresses.map((item) => item.userId)).size,
    },
    addresses,
  });
}
