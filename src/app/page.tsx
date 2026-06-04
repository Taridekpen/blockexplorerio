"use client";

import { ChainToggle } from "@/components/ChainToggle";
import { LatestBlocks } from "@/components/LatestBlocks";
import type { Chain } from "@/types/explorer";
import { useState } from "react";

export default function Home() {
  const [chain, setChain] = useState<Chain>("bitcoin");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
      <section className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
          Explore Bitcoin & Ethereum
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 sm:text-base">
          Search transactions, blocks, and addresses across Bitcoin and Ethereum
          using live on-chain data.
        </p>
        <div className="mt-6 flex justify-center sm:mt-8">
          <ChainToggle chain={chain} onChange={setChain} />
        </div>
      </section>

      <LatestBlocks chain={chain} />
    </div>
  );
}
