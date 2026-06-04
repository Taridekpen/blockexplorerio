import { readIndexedTransactions } from "@/lib/indexedTransactionStore";
import type { IndexedTxJson } from "@/lib/indexedTransactionTypes";
import type { SearchResult, TransactionView } from "@/types/explorer";

export type { IndexedTxJson } from "@/lib/indexedTransactionTypes";

let keyIndex: Map<string, IndexedTxJson> | null = null;

function buildIndexedTransaction(raw: IndexedTxJson): TransactionView {
  const amountSats = Math.round((raw.amountUsd / raw.btcUsdRate) * 100_000_000);
  const totalInput = amountSats + raw.fee;

  return {
    hash: raw.hash,
    chain: raw.chain,
    confirmed: raw.confirmed,
    blockHeight: raw.blockHeight,
    blockHash: raw.blockHash,
    timestamp: raw.useCurrentTimestamp
      ? Math.floor(Date.now() / 1000)
      : raw.timestamp,
    fee: raw.fee,
    size: raw.size,
    confirmations: raw.confirmed ? 1 : 0,
    inputs: [{ address: raw.sender, value: totalInput }],
    outputs: [{ address: raw.receiver, value: amountSats }],
    totalInput,
    totalOutput: amountSats,
    amountTransacted: amountSats,
    source: "live",
    usdPrice: raw.btcUsdRate,
    displayAmountUsd: raw.amountUsd,
    status: raw.confirmed ? "confirmed" : "pending",
    pendingNotice: raw.pendingNotice,
  };
}

function rebuildIndex(transactions: IndexedTxJson[]) {
  const index = new Map<string, IndexedTxJson>();
  for (const raw of transactions) {
    for (const key of raw.searchKeys) {
      index.set(key.toLowerCase(), raw);
    }
    index.set(raw.hash.toLowerCase(), raw);
  }
  keyIndex = index;
}

async function ensureIndex() {
  if (!keyIndex) {
    rebuildIndex(await readIndexedTransactions());
  }
}

export function invalidateIndexedCache() {
  keyIndex = null;
}

export async function findIndexedTransaction(
  query: string,
): Promise<TransactionView | null> {
  await ensureIndex();
  const key = query.trim().toLowerCase();
  const raw = keyIndex!.get(key);
  if (!raw) return null;
  return buildIndexedTransaction(raw);
}

export async function getIndexedTransactionResults(): Promise<SearchResult[]> {
  const transactions = await readIndexedTransactions();
  return transactions.map((raw) => ({
    kind: "transaction" as const,
    data: buildIndexedTransaction(raw),
  }));
}
