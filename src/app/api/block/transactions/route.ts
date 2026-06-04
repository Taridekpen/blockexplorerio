import { getBlockTransactions } from "@/lib/search";
import type { Chain } from "@/types/explorer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash");
  const chain = (request.nextUrl.searchParams.get("chain") ?? "bitcoin") as Chain;
  const start = request.nextUrl.searchParams.get("start");
  const cursorIndex = request.nextUrl.searchParams.get("cursor_index");
  const cursorBlock = request.nextUrl.searchParams.get("cursor_block");
  const cursorCount = request.nextUrl.searchParams.get("cursor_count");

  if (!hash) {
    return NextResponse.json({ error: "Missing hash parameter" }, { status: 400 });
  }

  try {
    const cursor =
      cursorIndex && cursorBlock && cursorCount
        ? {
            index: Number(cursorIndex),
            block_number: Number(cursorBlock),
            items_count: Number(cursorCount),
          }
        : undefined;

    const page = await getBlockTransactions(chain, hash, {
      start: start ? Number(start) : undefined,
      cursor,
    });

    return NextResponse.json(page);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch block transactions";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
