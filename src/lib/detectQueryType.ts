import type { Chain } from "@/types/explorer";

export type QueryType =
  | "transaction"
  | "block"
  | "address"
  | "block_height"
  | "unknown";

export function detectQueryType(query: string, chain: Chain): QueryType {
  const q = query.trim();

  if (chain === "ethereum") {
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) return "transaction";
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) return "address";
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) return "block";
    if (/^\d+$/.test(q)) return "block_height";
    return "unknown";
  }

  // Bitcoin
  if (/^[a-fA-F0-9]{64}$/.test(q)) return "transaction";
  if (/^\d+$/.test(q)) return "block_height";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(q)) return "address";

  return "unknown";
}

export function inferChainFromQuery(query: string): Chain | null {
  const q = query.trim().toLowerCase();

  if (q.includes("-eth") || q.startsWith("0x")) return "ethereum";
  if (q.includes("-btc") || /^(bc1|[13])/.test(q)) return "bitcoin";
  if (/^[a-fA-F0-9]{64}$/.test(q)) return null;

  return null;
}
