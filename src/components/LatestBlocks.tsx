"use client";

import { formatTimestamp, formatTimestampShort, truncateHash } from "@/lib/format";
import type { BlockView, Chain } from "@/types/explorer";
import { useEffect, useState } from "react";
import { SourceBadge } from "./SourceBadge";

interface LatestBlocksProps {
  chain: Chain;
}

export function LatestBlocks({ chain }: LatestBlocksProps) {
  const [blocks, setBlocks] = useState<BlockView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/blocks?chain=${chain}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBlocks(data.blocks);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load blocks"),
      )
      .finally(() => setLoading(false));
  }, [chain]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-sm sm:p-6">
        Loading latest blocks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm sm:p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-3 sm:px-4">
        <h2 className="text-sm font-semibold text-zinc-800">
          Latest {chain === "bitcoin" ? "Bitcoin" : "Ethereum"} Blocks
        </h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {blocks.map((block) => (
          <a
            key={block.hash}
            href={`/search?q=${block.height}&chain=${chain}`}
            className="flex flex-col gap-2 px-3 py-3 transition-colors active:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:hover:bg-zinc-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium text-indigo-600">
                  #{block.height.toLocaleString()}
                </span>
                <SourceBadge source={block.source} />
              </div>
              <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
                {truncateHash(block.hash, 8)}
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 text-xs text-zinc-500 sm:block sm:text-right">
              <p>{block.txCount.toLocaleString()} txs</p>
              <p className="sm:hidden">{formatTimestampShort(block.timestamp)}</p>
              <p className="hidden sm:block">{formatTimestamp(block.timestamp)}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
