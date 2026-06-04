"use client";

import type { Chain } from "@/types/explorer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SearchBar } from "./SearchBar";

function HeaderSearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const chain = (params.get("chain") ?? "bitcoin") as Chain;

  return <SearchBar compact defaultQuery={q} defaultChain={chain} />;
}

export function HeaderSearch() {
  return (
    <Suspense fallback={<SearchBar compact />}>
      <HeaderSearchInner />
    </Suspense>
  );
}
