"use client";

import { ADMIN_ACCESS_PASSPHRASE } from "@/lib/adminSecret";
import type { Chain } from "@/types/explorer";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ChainToggle } from "./ChainToggle";

interface SearchBarProps {
  defaultChain?: Chain;
  defaultQuery?: string;
  compact?: boolean;
  chain?: Chain;
  onChainChange?: (chain: Chain) => void;
}

export function SearchBar({
  defaultChain = "bitcoin",
  defaultQuery = "",
  compact = false,
  chain: controlledChain,
  onChainChange,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [internalChain, setInternalChain] = useState<Chain>(defaultChain);
  const chain = controlledChain ?? internalChain;

  function setChain(next: Chain) {
    if (onChainChange) onChainChange(next);
    else setInternalChain(next);
  }

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    setInternalChain(defaultChain);
  }, [defaultChain]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q === ADMIN_ACCESS_PASSPHRASE) {
      router.push("/admin/indexed-transactions");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}&chain=${chain}`);
  }

  const placeholder =
    chain === "bitcoin"
      ? compact
        ? "Search Bitcoin…"
        : "Tx hash, block height, or address"
      : compact
        ? "Search Ethereum…"
        : "Tx hash, block height, or address";

  return (
    <div className={compact ? "w-full min-w-0" : "w-full min-w-0 max-w-3xl"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <ChainToggle chain={chain} onChange={setChain} fullWidth={!compact} />

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900 placeholder-zinc-400 shadow-sm outline-none ring-indigo-500 focus:ring-2 sm:px-4 sm:py-2.5 sm:text-sm"
          />
          <button
            type="submit"
            className="w-full shrink-0 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto sm:py-2.5"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
