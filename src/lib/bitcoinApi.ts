import type { AddressView, BlockView, TransactionView } from "@/types/explorer";

const BASE = "https://blockstream.info/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Bitcoin API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Bitcoin API error: ${res.status}`);
  return res.text();
}

interface BtcBlock {
  id: string;
  height: number;
  timestamp: number;
  tx_count: number;
  size: number;
}

interface BtcTx {
  txid: string;
  fee: number;
  size: number;
  vin: {
    prevout?: { scriptpubkey_address?: string; value?: number };
    is_coinbase?: boolean;
  }[];
  vout: { scriptpubkey_address?: string; value: number }[];
  status?: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

async function fetchTipHeight(): Promise<number> {
  const res = await fetch(`${BASE}/blocks/tip/height`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch tip height");
  return Number(await res.text());
}

function mapBtcTransaction(tx: BtcTx, confirmations: number | null): TransactionView {
  const inputs = tx.vin.map((i) => ({
    address: i.is_coinbase ? "Coinbase" : i.prevout?.scriptpubkey_address,
    value: i.prevout?.value ?? 0,
  }));
  const outputs = tx.vout.map((o) => ({
    address: o.scriptpubkey_address,
    value: o.value,
  }));
  const totalInput = inputs.reduce((sum, i) => sum + i.value, 0);
  const totalOutput = outputs.reduce((sum, o) => sum + o.value, 0);

  return {
    hash: tx.txid,
    chain: "bitcoin",
    confirmed: tx.status?.confirmed ?? false,
    blockHeight: tx.status?.block_height,
    blockHash: tx.status?.block_hash,
    timestamp: tx.status?.block_time,
    fee: tx.fee,
    size: tx.size,
    confirmations,
    inputs,
    outputs,
    totalInput,
    totalOutput,
    amountTransacted: totalOutput,
    source: "live",
  };
}

interface BtcAddressInfo {
  chain_stats: {
    tx_count: number;
    funded_txo_sum: number;
    spent_txo_sum: number;
  };
}

export async function fetchLatestBlocks(): Promise<BlockView[]> {
  const blocks = await fetchJson<BtcBlock[]>(`${BASE}/blocks`);
  return blocks.map((b) => ({
    hash: b.id,
    chain: "bitcoin" as const,
    height: b.height,
    txCount: b.tx_count,
    timestamp: b.timestamp,
    size: b.size,
    source: "live" as const,
  }));
}

export async function fetchTransaction(txid: string): Promise<TransactionView> {
  const tx = await fetchJson<BtcTx>(`${BASE}/tx/${txid}`);

  let confirmations: number | null = 0;
  if (tx.status?.confirmed && tx.status.block_height != null) {
    const tip = await fetchTipHeight();
    confirmations = tip - tx.status.block_height + 1;
  }

  return mapBtcTransaction(tx, confirmations);
}

export async function fetchBlockByHeight(height: number): Promise<BlockView> {
  const hash = await fetchText(`${BASE}/block-height/${height}`);
  return fetchBlock(hash.trim());
}

export async function fetchBlock(hash: string): Promise<BlockView> {
  const block = await fetchJson<BtcBlock>(`${BASE}/block/${hash}`);
  return {
    hash: block.id,
    chain: "bitcoin",
    height: block.height,
    txCount: block.tx_count,
    timestamp: block.timestamp,
    size: block.size,
    source: "live",
  };
}

export async function fetchAddress(address: string): Promise<AddressView> {
  const [info, txs] = await Promise.all([
    fetchJson<BtcAddressInfo>(`${BASE}/address/${address}`),
    fetchJson<BtcTx[]>(`${BASE}/address/${address}/txs`),
  ]);

  const balance =
    info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum;

  return {
    address,
    chain: "bitcoin",
    balance,
    balanceUnit: "sats",
    txCount: info.chain_stats.tx_count,
    transactions: txs.slice(0, 10).map((t) => ({
      hash: t.txid,
      value: t.vout.reduce((sum, o) => sum + o.value, 0),
      timestamp: t.status?.block_time,
    })),
    source: "live",
  };
}

export async function tryFetchBlock(hash: string): Promise<BlockView | null> {
  try {
    return await fetchBlock(hash);
  } catch {
    return null;
  }
}

export interface BlockTxPage {
  transactions: { hash: string; index?: number; fee?: number; value?: number }[];
  hasMore: boolean;
  nextStart?: number;
}

export async function fetchBlockTransactions(
  hash: string,
  startIndex = 0,
): Promise<BlockTxPage> {
  const path =
    startIndex > 0
      ? `${BASE}/block/${hash}/txs/${startIndex}`
      : `${BASE}/block/${hash}/txs`;
  const txs = await fetchJson<BtcTx[]>(path);

  return {
    transactions: txs.map((tx, i) => ({
      hash: tx.txid,
      index: startIndex + i,
      fee: tx.fee,
      value: tx.vout.reduce((sum, o) => sum + o.value, 0),
    })),
    hasMore: txs.length === 25,
    nextStart: startIndex + txs.length,
  };
}

export async function fetchBlockWithTransactions(
  hash: string,
): Promise<BlockView> {
  const [block, txPage] = await Promise.all([
    fetchBlock(hash),
    fetchBlockTransactions(hash),
  ]);

  return {
    ...block,
    transactions: txPage.transactions,
    hasMoreTransactions: txPage.hasMore,
    nextTxStart: txPage.hasMore ? txPage.nextStart : undefined,
  };
}

export async function fetchBlockByHeightWithTransactions(
  height: number,
): Promise<BlockView> {
  const hash = await fetchText(`${BASE}/block-height/${height}`);
  return fetchBlockWithTransactions(hash.trim());
}
