interface Ad {
  title: string;
  description: string;
  cta: string;
  sponsor: string;
  accent: string;
}

const ADS: Ad[] = [
  {
    title: "Secure Your Crypto Wallet",
    description: "Hardware wallets with military-grade encryption. Free shipping today.",
    cta: "Shop Now",
    sponsor: "VaultGuard",
    accent: "from-orange-50 to-amber-50 ring-orange-200 border-orange-100",
  },
  {
    title: "Zero-Fee Trading Week",
    description: "Trade BTC & ETH with no fees for 7 days. New users only.",
    cta: "Start Trading",
    sponsor: "NovaExchange",
    accent: "from-indigo-50 to-violet-50 ring-indigo-200 border-indigo-100",
  },
  {
    title: "Learn Blockchain Dev",
    description: "Master smart contracts in 30 days. Beginner-friendly course.",
    cta: "Enroll Free",
    sponsor: "ChainAcademy",
    accent: "from-emerald-50 to-teal-50 ring-emerald-200 border-emerald-100",
  },
  {
    title: "Stake ETH — Earn 4.2% APY",
    description: "Liquid staking with instant withdrawals. No lock-up period.",
    cta: "Stake Now",
    sponsor: "EtherYield",
    accent: "from-blue-50 to-cyan-50 ring-blue-200 border-blue-100",
  },
  {
    title: "Bitcoin Tax Calculator",
    description: "Auto-import transactions. Generate IRS-ready reports in minutes.",
    cta: "Try Free",
    sponsor: "CryptoTax Pro",
    accent: "from-rose-50 to-pink-50 ring-rose-200 border-rose-100",
  },
  {
    title: "VPN for Crypto Traders",
    description: "Browse exchanges securely from anywhere. 50% off annual plan.",
    cta: "Get Deal",
    sponsor: "ShieldNet",
    accent: "from-zinc-100 to-zinc-50 ring-zinc-200 border-zinc-200",
  },
];

interface AdBannerProps {
  slot: "top" | "bottom";
}

/** Stable per slot so SSR and client hydration render the same ad. */
function adIndexForSlot(slot: AdBannerProps["slot"]): number {
  const topIndex = ("top".length + "top".charCodeAt(0)) % ADS.length;
  if (slot === "top") return topIndex;
  return (topIndex + 1 + "bottom".length) % ADS.length;
}

export function AdBanner({ slot }: AdBannerProps) {
  const ad = ADS[adIndexForSlot(slot)];

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4">
      <div
        className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${ad.accent} px-4 py-3 ring-1 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4`}
      >
        <span className="mb-2 inline-block rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:mb-0">
          Ad
        </span>
        <div className="min-w-0 flex-1 sm:mx-4">
          <p className="text-sm font-semibold text-zinc-900">{ad.title}</p>
          <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm">
            {ad.description}
          </p>
          <p className="mt-1 text-[10px] text-zinc-400">Sponsored · {ad.sponsor}</p>
        </div>
        <button
          type="button"
          className="mt-3 w-full shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 sm:mt-0 sm:w-auto sm:text-sm"
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}
