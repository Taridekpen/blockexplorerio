import { getLatestBlocks, search } from "@/lib/search";
import type { Chain } from "@/types/explorer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const chain = (request.nextUrl.searchParams.get("chain") ?? "bitcoin") as Chain;

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  const result = await search(q, chain);
  return NextResponse.json(result);
}
