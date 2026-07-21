import { NextResponse } from "next/server";
import { patchDispute } from "@/services/admin/admin-ops-store";
import type { AdminDisputePatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminDisputePatch;
  const dispute = patchDispute(id, body);

  if (!dispute) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ dispute });
}
