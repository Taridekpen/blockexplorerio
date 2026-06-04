"use client";

import { formatBtc, formatEth, truncateHash } from "@/lib/format";
import type { BlockTxSummary, BlockView, Chain } from "@/types/explorer";
import Link from "next/link";
import { useState } from "react";

interface BlockTransactionListProps {
  block: BlockView;
}

export function BlockTransactionList({ block }: BlockTransactionListProps) {
  const [transactions, setTransactions] = useState<BlockTxSummary[]>(
    block.transactions ?? [],
  );
  const [hasMore, setHasMore] = useState(block.hasMoreTransactions ?? false);
  const [nextStart, setNextStart] = useState(block.nextTxStart);
  const [nextCursor, setNextCursor] = useState(block.nextTxCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatValue =
    block.chain === "bitcoin"
      ? (v: number) => formatBtc(v)
      : (v: number) => formatEth(v);

  async function loadMore() {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      hash: block.hash,
      chain: block.chain,
    });

    if (block.chain === "bitcoin" && nextStart != null) {
      params.set("start", String(nextStart));
    } else if (block.chain === "ethereum" && nextCursor) {
      params.set("cursor_index", String(nextCursor.index));
      params.set("cursor_block", String(nextCursor.block_number));
      params.set("cursor_count", String(nextCursor.items_count));
    }

    try {
      const res = await fetch(`/api/block/transactions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load transactions");

      setTransactions((prev) => [...prev, ...data.transactions]);
      setHasMore(data.hasMore);
      setNextStart(data.nextStart);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-700">
          Transactions ({transactions.length}
          {block.txCount > transactions.length
            ? ` of ${block.txCount.toLocaleString()}`
            : ""}
          )
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200">
        {transactions.map((tx, i) => (
          <TxRow
            key={`${tx.hash}-${tx.index ?? i}`}
            tx={tx}
            chain={block.chain}
            formatValue={formatValue}
            showIndex={block.chain === "bitcoin"}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Loading…" : "Load more transactions"}
        </button>
      )}
    </div>
  );
}

function TxRow({
  tx,
  chain,
  formatValue,
  showIndex,
}: {
  tx: BlockTxSummary;
  chain: Chain;
  formatValue: (v: number) => string;
  showIndex: boolean;
}) {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(tx.hash)}&chain=${chain}`}
      className="flex flex-col gap-1 px-3 py-3 transition-colors active:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:hover:bg-zinc-50"
    >
      <div className="flex min-w-0 items-center gap-2">
        {showIndex && tx.index != null && (
          <span className="shrink-0 font-mono text-xs text-zinc-400">
            #{tx.index}
          </span>
        )}
        <span className="min-w-0 break-all font-mono text-xs text-indigo-600 sm:text-sm">
          <span className="sm:hidden">{truncateHash(tx.hash, 10)}</span>
          <span className="hidden sm:inline">{truncateHash(tx.hash, 16)}</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4 pl-6 text-xs text-zinc-600 sm:pl-0 sm:text-sm">
        {tx.value != null && tx.value > 0 && (
          <span>{formatValue(tx.value)}</span>
        )}
        {tx.fee != null && tx.fee > 0 && chain === "bitcoin" && (
          <span className="text-zinc-500">fee {formatValue(tx.fee)}</span>
        )}
      </div>
    </Link>
  );
}
