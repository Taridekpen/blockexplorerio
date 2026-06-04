import type { Chain } from "@/types/explorer";

interface ChainToggleProps {
  chain: Chain;
  onChange: (chain: Chain) => void;
  fullWidth?: boolean;
}

export function ChainToggle({ chain, onChange, fullWidth = false }: ChainToggleProps) {
  return (
    <div
      className={`inline-flex rounded-lg border border-zinc-300 bg-zinc-100 p-1 ${
        fullWidth ? "w-full" : "w-full sm:w-auto"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange("bitcoin")}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 sm:py-1.5 ${
          chain === "bitcoin"
            ? "bg-orange-500 text-white shadow-sm"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Bitcoin
      </button>
      <button
        type="button"
        onClick={() => onChange("ethereum")}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 sm:py-1.5 ${
          chain === "ethereum"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        Ethereum
      </button>
    </div>
  );
}
