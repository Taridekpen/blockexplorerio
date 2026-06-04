import type { IndexedTxJson } from "@/lib/indexedTransactionTypes";
import { promises as fs } from "fs";
import path from "path";

export type { IndexedPendingNotice, IndexedTxJson } from "@/lib/indexedTransactionTypes";
export { createEmptyIndexedTransaction } from "@/lib/indexedTransactionTypes";

const DATA_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "indexed-transactions.json",
);

export async function readIndexedTransactions(): Promise<IndexedTxJson[]> {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as { transactions: IndexedTxJson[] };
  return parsed.transactions;
}

export async function writeIndexedTransactions(
  transactions: IndexedTxJson[],
): Promise<void> {
  const body = JSON.stringify({ transactions }, null, 2) + "\n";
  await fs.writeFile(DATA_FILE, body, "utf-8");
}
