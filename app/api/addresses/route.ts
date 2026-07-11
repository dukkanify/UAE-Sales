import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAddress,
  getAddressesForUser,
} from "@/services/addresses/address-store";

const addressSchema = z.object({
  userId: z.string().min(1),
  label: z.string().min(1),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  emirate: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().min(1),
  building: z.string().optional(),
  unit: z.string().optional(),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const addresses = await getAddressesForUser(userId);
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const address = await createAddress({
    ...parsed.data,
    isDefault: parsed.data.isDefault ?? false,
  });
  return NextResponse.json({ address });
}
