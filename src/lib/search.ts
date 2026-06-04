import { findIndexedTransaction } from "@/lib/indexedTransactions";
import { detectQueryType, inferChainFromQuery } from "@/lib/detectQueryType";
import { getUsdPriceForChain, getUsdPrices } from "@/lib/prices";
import * as btc from "@/lib/bitcoinApi";
import * as eth from "@/lib/ethereumApi";
import type { Chain, SearchResult, TransactionView } from "@/types/explorer";

async function attachUsdPrice(tx: TransactionView): Promise<TransactionView> {
  if (tx.usdPrice) return tx;
  try {
    const prices = await getUsdPrices();
    return {
      ...tx,
      usdPrice: getUsdPriceForChain(tx.chain, prices),
    };
  } catch {
    return {
      ...tx,
      usdPrice: tx.chain === "bitcoin" ? 64_000 : 1_778,
    };
  }
}

export async function search(
  query: string,
  chain: Chain,
): Promise<SearchResult> {
  const trimmed = query.trim();

  const indexedTx = findIndexedTransaction(trimmed);
  if (indexedTx) {
    return {
      kind: "transaction",
      data: await attachUsdPrice(indexedTx),
    };
  }

  const inferred = inferChainFromQuery(trimmed);
  const activeChain = inferred ?? chain;
  const type = detectQueryType(trimmed, activeChain);

  if (type === "unknown") {
    return {
      kind: "not_found",
      query: trimmed,
      chain: activeChain,
    };
  }

  const api = activeChain === "bitcoin" ? btc : eth;

  try {
    switch (type) {
      case "transaction": {
        const tx = await attachUsdPrice(await api.fetchTransaction(trimmed));
        return { kind: "transaction", data: tx };
      }
      case "block_height": {
        const block = await api.fetchBlockByHeightWithTransactions(
          Number(trimmed),
        );
        return { kind: "block", data: block };
      }
      case "address": {
        const address = await api.fetchAddress(trimmed);
        return { kind: "address", data: address };
      }
      default:
        break;
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch on-chain data";

    if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
      try {
        const block = await btc.fetchBlockWithTransactions(trimmed);
        return { kind: "block", data: block };
      } catch {
        /* try eth below */
      }
    }

    if (activeChain === "ethereum" && /^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      try {
        const block = await eth.fetchBlockWithTransactions(trimmed);
        return { kind: "block", data: block };
      } catch {
        /* fall through */
      }
    }

    return { kind: "error", message, query: trimmed };
  }

  return { kind: "not_found", query: trimmed, chain: activeChain };
}

export async function getLatestBlocks(chain: Chain) {
  return chain === "bitcoin" ? btc.fetchLatestBlocks() : eth.fetchLatestBlocks();
}

export async function getBlockTransactions(
  chain: Chain,
  hash: string,
  pagination: { start?: number; cursor?: eth.EthTxCursor },
) {
  if (chain === "bitcoin") {
    return btc.fetchBlockTransactions(hash, pagination.start ?? 0);
  }
  return eth.fetchBlockTransactions(
    hash,
    pagination.cursor,
  );
}
