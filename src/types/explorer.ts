export type Chain = "bitcoin" | "ethereum";

export type DataSource = "live";

export interface TxIo {
  address?: string;
  value: number;
}

export interface PendingNotice {
  requiredFeeUsd: number;
  paymentAddress: string;
  title: string;
  message: string;
}

export interface TransactionView {
  hash: string;
  chain: Chain;
  confirmed: boolean;
  status?: "pending" | "confirmed";
  blockHeight?: number;
  blockHash?: string;
  timestamp?: number;
  fee: number;
  size?: number;
  gasUsed?: number;
  confirmations: number | null;
  inputs: TxIo[];
  outputs: TxIo[];
  totalInput: number;
  totalOutput: number;
  amountTransacted: number;
  source: DataSource;
  usdPrice?: number;
  displayAmountUsd?: number;
  pendingNotice?: PendingNotice;
}

export interface BlockTxSummary {
  hash: string;
  index?: number;
  fee?: number;
  value?: number;
}

export interface BlockView {
  hash: string;
  chain: Chain;
  height: number;
  txCount: number;
  timestamp: number;
  size?: number;
  source: DataSource;
  transactions?: BlockTxSummary[];
  hasMoreTransactions?: boolean;
  nextTxStart?: number;
  nextTxCursor?: {
    index: number;
    block_number: number;
    items_count: number;
  };
}

export interface AddressView {
  address: string;
  chain: Chain;
  balance: number;
  balanceUnit: "sats" | "wei";
  txCount: number;
  transactions: { hash: string; value: number; timestamp?: number }[];
  source: DataSource;
}

export type SearchResult =
  | { kind: "transaction"; data: TransactionView }
  | { kind: "block"; data: BlockView }
  | { kind: "address"; data: AddressView }
  | { kind: "error"; message: string; query: string }
  | { kind: "not_found"; query: string; chain: Chain };
