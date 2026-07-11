import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteAddress,
  updateAddress,
} from "@/services/addresses/address-store";

const patchSchema = z.object({
  userId: z.string().min(1),
  label: z.string().min(1).optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  emirate: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  building: z.string().optional(),
  unit: z.string().optional(),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { userId, ...patch } = parsed.data;
  const address = await updateAddress(id, userId, patch);
  if (!address) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ address });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }

  const deleted = await deleteAddress(id, userId);
  if (!deleted) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
