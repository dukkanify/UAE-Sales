import { NextResponse } from "next/server";
import { getLocations } from "@/services/locations/location-store";

export async function GET() {
  const locations = await getLocations({ enabledOnly: true });
  return NextResponse.json({
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      emirate: loc.emirate,
      sortOrder: loc.sortOrder,
    })),
  });
}
