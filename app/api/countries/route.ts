import { NextResponse } from "next/server";

import { listCountries } from "@/constants/countries";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: listCountries(),
    error: null,
  });
}
