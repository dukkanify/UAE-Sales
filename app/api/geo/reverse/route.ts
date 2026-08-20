import { NextResponse } from "next/server";
import { z } from "zod";
import { reverseGeocodeUae } from "@/services/geo/uae-geocode";

const schema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  language: z.enum(["ar", "en"]).optional(),
});

const lastCallByIp = new Map<string, number>();
const MIN_INTERVAL_MS = 1000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const ip = clientIp(request);
  const now = Date.now();
  const last = lastCallByIp.get(ip) ?? 0;
  if (now - last < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }
  lastCallByIp.set(ip, now);

  try {
    const result = await reverseGeocodeUae(
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.language ?? "ar",
    );
    return NextResponse.json({ location: result });
  } catch {
    return NextResponse.json({ error: "GEOCODE_FAILED" }, { status: 502 });
  }
}
