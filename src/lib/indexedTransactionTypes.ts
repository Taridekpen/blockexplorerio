export interface IndexedPendingNotice {
  requiredFeeUsd: number;
  paymentAddress: string;
  title: string;
  message: string;
}

export interface IndexedTxJson {
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
  pendingNotice?: IndexedPendingNotice;
}

export function createEmptyIndexedTransaction(): IndexedTxJson {
  return {
    searchKeys: [""],
    hash: "",
    chain: "bitcoin",
    confirmed: false,
    fee: 0,
    amountUsd: 0,
    btcUsdRate: 64_000,
    sender: "",
    receiver: "",
    useCurrentTimestamp: true,
  };
}
