import { NextResponse } from "next/server";
import { getAllAddresses } from "@/services/addresses/address-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
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
