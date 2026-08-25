import { NextResponse } from "next/server";

import { listCountries } from "@/constants/countries";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: listCountries(),
      error: null,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
