const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

interface PriceCache {
  btc: number;
  eth: number;
  fetchedAt: number;
}

let cache: PriceCache | null = null;
const TTL_MS = 60_000;

export async function getUsdPrices(): Promise<{ btc: number; eth: number }> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return { btc: cache.btc, eth: cache.eth };
  }

  const res = await fetch(COINGECKO_URL, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch USD prices");

  const data = (await res.json()) as {
    bitcoin: { usd: number };
    ethereum: { usd: number };
  };

  cache = {
    btc: data.bitcoin.usd,
    eth: data.ethereum.usd,
    fetchedAt: Date.now(),
  };

  return { btc: cache.btc, eth: cache.eth };
}

export function getUsdPriceForChain(
  chain: "bitcoin" | "ethereum",
  prices: { btc: number; eth: number },
): number {
  return chain === "bitcoin" ? prices.btc : prices.eth;
}
