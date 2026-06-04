import type { AddressView, BlockView, TransactionView } from "@/types/explorer";

const BASE = "https://eth.blockscout.com/api/v2";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Ethereum API error: ${res.status}`);
  return res.json() as Promise<T>;
}

interface EthBlockItem {
  hash: string;
  height: number;
  timestamp: string;
  transactions_count: number;
  size: number;
}

interface EthBlockResponse {
  items: EthBlockItem[];
}

interface EthBlock {
  hash: string;
  height: number;
  timestamp: string;
  transactions_count: number;
  size: number;
}

interface EthTx {
  hash: string;
  block_number: number | null;
  timestamp: string | null;
  fee: { value: string } | null;
  from: { hash: string } | null;
  to: { hash: string } | null;
  value: string;
  status: string;
  gas_used: string;
  confirmations: number;
}

interface EthAddress {
  hash: string;
  coin_balance: string;
  transactions_count: number;
}

interface EthAddressTx {
  hash: string;
  timestamp: string;
  value: string;
}

interface EthAddressTxResponse {
  items: EthAddressTx[];
}

export async function fetchLatestBlocks(): Promise<BlockView[]> {
  const data = await fetchJson<EthBlockResponse>(`${BASE}/blocks?type=block`);
  return data.items.slice(0, 10).map((b) => ({
    hash: b.hash,
    chain: "ethereum" as const,
    height: b.height,
    txCount: b.transactions_count,
    timestamp: Math.floor(new Date(b.timestamp).getTime() / 1000),
    size: b.size,
    source: "live" as const,
  }));
}

export async function fetchTransaction(hash: string): Promise<TransactionView> {
  const tx = await fetchJson<EthTx>(`${BASE}/transactions/${hash}`);
  const fee = tx.fee ? Number(BigInt(tx.fee.value)) : 0;
  const value = Number(BigInt(tx.value));
  const confirmed = tx.status === "ok" && tx.block_number != null;

  const inputs = [{ address: tx.from?.hash, value }];
  const outputs = [{ address: tx.to?.hash, value }];

  return {
    hash: tx.hash,
    chain: "ethereum",
    confirmed,
    blockHeight: tx.block_number ?? undefined,
    timestamp: tx.timestamp
      ? Math.floor(new Date(tx.timestamp).getTime() / 1000)
      : undefined,
    fee,
    gasUsed: Number(tx.gas_used),
    confirmations: confirmed ? tx.confirmations : 0,
    inputs,
    outputs,
    totalInput: value,
    totalOutput: value,
    amountTransacted: value,
    source: "live",
  };
}

export async function fetchBlockByHeight(height: number): Promise<BlockView> {
  const block = await fetchJson<EthBlock>(`${BASE}/blocks/${height}`);
  return mapBlock(block);
}

export async function fetchBlock(hash: string): Promise<BlockView> {
  const block = await fetchJson<EthBlock>(`${BASE}/blocks/${hash}`);
  return mapBlock(block);
}

function mapBlock(block: EthBlock): BlockView {
  return {
    hash: block.hash,
    chain: "ethereum",
    height: block.height,
    txCount: block.transactions_count,
    timestamp: Math.floor(new Date(block.timestamp).getTime() / 1000),
    size: block.size,
    source: "live",
  };
}

export async function fetchAddress(address: string): Promise<AddressView> {
  const [info, txData] = await Promise.all([
    fetchJson<EthAddress>(`${BASE}/addresses/${address}`),
    fetchJson<EthAddressTxResponse>(
      `${BASE}/addresses/${address}/transactions`,
    ),
  ]);

  return {
    address: info.hash,
    chain: "ethereum",
    balance: Number(BigInt(info.coin_balance)),
    balanceUnit: "wei",
    txCount: info.transactions_count,
    transactions: txData.items.slice(0, 10).map((t) => ({
      hash: t.hash,
      value: Number(BigInt(t.value)),
      timestamp: Math.floor(new Date(t.timestamp).getTime() / 1000),
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

export interface EthTxCursor {
  index: number;
  block_number: number;
  items_count: number;
}

export interface BlockTxPage {
  transactions: { hash: string; index?: number; fee?: number; value?: number }[];
  hasMore: boolean;
  nextCursor?: EthTxCursor;
}

export async function fetchBlockTransactions(
  blockId: string | number,
  cursor?: EthTxCursor,
): Promise<BlockTxPage> {
  let url = `${BASE}/blocks/${blockId}/transactions`;
  if (cursor) {
    const params = new URLSearchParams({
      index: String(cursor.index),
      block_number: String(cursor.block_number),
      items_count: String(cursor.items_count),
    });
    url += `?${params}`;
  }

  const data = await fetchJson<{
    items: EthTx[];
    next_page_params: EthTxCursor | null;
  }>(url);

  return {
    transactions: data.items.map((tx) => ({
      hash: tx.hash,
      index: undefined,
      fee: tx.fee ? Number(BigInt(tx.fee.value)) : undefined,
      value: Number(BigInt(tx.value)),
    })),
    hasMore: data.next_page_params != null,
    nextCursor: data.next_page_params ?? undefined,
  };
}

export async function fetchBlockWithTransactions(
  blockId: string | number,
): Promise<BlockView> {
  const [block, txPage] = await Promise.all([
    fetchBlock(String(blockId)),
    fetchBlockTransactions(blockId),
  ]);

  return {
    ...block,
    transactions: txPage.transactions,
    hasMoreTransactions: txPage.hasMore,
    nextTxCursor: txPage.nextCursor,
  };
}

export async function fetchBlockByHeightWithTransactions(
  height: number,
): Promise<BlockView> {
  return fetchBlockWithTransactions(height);
}
