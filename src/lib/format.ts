function formatCryptoAmount(amount: number, symbol: string): string {
  if (amount === 0) return `0 ${symbol}`;

  if (amount >= 1) {
    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })} ${symbol}`;
  }

  if (amount >= 0.0001) {
    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    })} ${symbol}`;
  }

  const fixed = amount.toFixed(8).replace(/\.?0+$/, "");
  return `${fixed} ${symbol}`;
}

export function formatBtc(sats: number): string {
  return formatCryptoAmount(sats / 100_000_000, "BTC");
}

export function formatEth(wei: number): string {
  return formatCryptoAmount(wei / 1e18, "ETH");
}

/** @deprecated Use formatBtc */
export function formatSats(sats: number): string {
  return formatBtc(sats);
}

/** @deprecated Use formatEth */
export function formatWei(wei: number): string {
  return formatEth(wei);
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export function formatTimestampShort(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTxDateTime(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function cryptoToUsd(cryptoAmount: number, usdPrice: number): number {
  return cryptoAmount * usdPrice;
}

export function satsToBtc(sats: number): number {
  return sats / 100_000_000;
}

export function weiToEth(wei: number): number {
  return wei / 1e18;
}
