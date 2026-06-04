"use client";

import { SearchResults } from "@/components/SearchResults";
import type { Chain, SearchResult } from "@/types/explorer";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const chain = (params.get("chain") ?? "bitcoin") as Chain;

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResult(null);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&chain=${chain}`)
      .then((r) => r.json())
      .then(setResult)
      .finally(() => setLoading(false));
  }, [q, chain]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
      {!q && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm sm:p-8">
          Enter a query in the search bar above to explore the blockchain.
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm sm:p-8">
          Searching…
        </div>
      )}

      {!loading && result && <SearchResults result={result} />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
