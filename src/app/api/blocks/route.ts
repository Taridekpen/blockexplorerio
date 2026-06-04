import { getLatestBlocks } from "@/lib/search";
import type { Chain } from "@/types/explorer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const chain = (request.nextUrl.searchParams.get("chain") ?? "bitcoin") as Chain;

  try {
    const blocks = await getLatestBlocks(chain);
    return NextResponse.json({ blocks, chain });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch blocks";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
