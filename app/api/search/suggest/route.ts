import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/services/search/suggest.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  const items = await getSearchSuggestions(query, {
    category: params.get("category") ?? undefined,
    city: params.get("city") ?? undefined,
  });
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
