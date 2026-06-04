import indexedData from "@/data/indexed-transactions.json";
import type { SearchResult, TransactionView } from "@/types/explorer";

interface IndexedTxJson {
  searchKeys: string[];
  hash: string;
  chain: "bitcoin" | "ethereum";
  confirmed: boolean;
  blockHeight?: number;
  blockHash?: string;
  fee: number;
  size?: number;
  amountUsd: number;
  btcUsdRate: number;
  sender: string;
  receiver: string;
  useCurrentTimestamp?: boolean;
  timestamp?: number;
  pendingNotice?: {
    requiredFeeUsd: number;
    paymentAddress: string;
    title: string;
    message: string;
  };
}

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

const keyIndex = new Map<string, IndexedTxJson>();
for (const raw of indexedData.transactions as IndexedTxJson[]) {
  for (const key of raw.searchKeys) {
    keyIndex.set(key.toLowerCase(), raw);
  }
  keyIndex.set(raw.hash.toLowerCase(), raw);
}

export function findIndexedTransaction(query: string): TransactionView | null {
  const key = query.trim().toLowerCase();
  const raw = keyIndex.get(key);
  if (!raw) return null;
  return buildIndexedTransaction(raw);
}

export function getIndexedTransactionResults(): SearchResult[] {
  return (indexedData.transactions as IndexedTxJson[]).map((raw) => ({
    kind: "transaction" as const,
    data: buildIndexedTransaction(raw),
  }));
}
