import { NextResponse } from "next/server";
import { getCategories } from "@/services/categories";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}
