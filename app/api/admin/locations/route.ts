import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import {
  createLocation,
  getLocations,
} from "@/services/locations/location-store";
import type { LocationCreateInput } from "@/types/domain/location";

export async function GET() {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) {
    return admin;
  }
  return NextResponse.json({ locations: await getLocations() });
}

export async function POST(request: Request) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const body = (await request.json()) as LocationCreateInput;
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const location = await createLocation({
    name: body.name,
    emirate: body.emirate,
    enabled: body.enabled,
    sortOrder: body.sortOrder,
  });

  return NextResponse.json({ location }, { status: 201 });
}
