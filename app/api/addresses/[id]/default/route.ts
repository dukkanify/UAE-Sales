import { NextResponse } from "next/server";
import { z } from "zod";
import { setDefaultAddress } from "@/services/addresses/address-store";

const defaultSchema = z.object({
  userId: z.string().min(1),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = defaultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const address = await setDefaultAddress(id, parsed.data.userId);
  if (!address) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ address });
}
