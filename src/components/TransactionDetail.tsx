"use client";

import {
  cryptoToUsd,
  formatBtc,
  formatEth,
  formatTxDateTime,
  formatUsd,
  satsToBtc,
  weiToEth,
} from "@/lib/format";
import type { Chain, TransactionView } from "@/types/explorer";
import Link from "next/link";
import { SourceBadge } from "./SourceBadge";

interface TransactionDetailProps {
  data: TransactionView;
}

export function TransactionDetail({ data }: TransactionDetailProps) {
  const isBtc = data.chain === "bitcoin";
  const unit = isBtc ? "BTC" : "ETH";
  const usdPrice = data.usdPrice ?? (isBtc ? 64_000 : 1_778);

  const toCrypto = (raw: number) => (isBtc ? satsToBtc(raw) : weiToEth(raw));
  const formatCrypto = (raw: number) => (isBtc ? formatBtc(raw) : formatEth(raw));

  const amountCrypto = toCrypto(data.amountTransacted);
  const amountUsd = data.displayAmountUsd ?? cryptoToUsd(amountCrypto, usdPrice);
  const feeCrypto = toCrypto(data.fee);
  const feeUsd = cryptoToUsd(feeCrypto, usdPrice);
  const totalUsd = cryptoToUsd(
    toCrypto(data.totalInput || data.totalOutput + data.fee),
    usdPrice,
  );

  const isPending =
    data.status === "pending" || (!data.confirmed && data.confirmations === 0);

  const confirmationsLabel = isPending
    ? "Pending"
    : data.confirmations === 0 || data.confirmations === null
      ? "0 Unconfirmed"
      : data.confirmations.toLocaleString();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">
            Transaction
          </h2>
          <SourceBadge source={data.source} />
          {isPending && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-300">
              Pending
            </span>
          )}
          <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs capitalize text-zinc-600">
            {data.chain}
          </span>
        </div>
        <p className="break-all font-mono text-xs text-indigo-600 sm:text-sm">
          {data.hash}
        </p>
      </div>

      <div className="border-b border-zinc-200 px-4 py-5 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Amount Transacted
        </p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 sm:text-3xl">
          {amountCrypto.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })}{" "}
          {unit}
        </p>
        <p className="mt-1 text-lg text-zinc-600">
          {formatUsd(amountUsd)} USD
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-zinc-100 border-b border-zinc-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
        <StatItem
          label="Included in block"
          value={
            isPending ? (
              <span className="text-amber-700">
                Pending (mempool)
                {data.blockHeight != null && (
                  <>
                    {" "}
                    · next ~{" "}
                    <Link
                      href={`/search?q=${data.blockHeight}&chain=${data.chain}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {data.blockHeight.toLocaleString()}
                    </Link>
                  </>
                )}
              </span>
            ) : data.blockHeight != null ? (
              <Link
                href={`/search?q=${data.blockHeight}&chain=${data.chain}`}
                className="text-indigo-600 hover:underline"
              >
                {data.blockHeight.toLocaleString()}
              </Link>
            ) : (
              "Unconfirmed"
            )
          }
        />
        <StatItem label="Fee" value={formatCrypto(data.fee)} />
        <StatItem label="Confirmations" value={confirmationsLabel} />
        <StatItem
          label="Size"
          value={
            data.size != null
              ? `${data.size.toLocaleString()} bytes`
              : data.gasUsed != null
                ? `${data.gasUsed.toLocaleString()} gas`
                : "—"
          }
        />
        <StatItem
          label="Date/Time"
          value={data.timestamp ? formatTxDateTime(data.timestamp) : "—"}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {data.pendingNotice && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-5 sm:px-6">
          <p className="text-sm font-semibold text-amber-900">
            {data.pendingNotice.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            {data.pendingNotice.message}
          </p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Priority fee required — $
              {data.pendingNotice.requiredFeeUsd.toLocaleString()} USD
            </p>
            <p className="mt-2 break-all font-mono text-sm text-amber-950">
              {data.pendingNotice.paymentAddress}
            </p>
            <p className="mt-2 text-xs text-amber-700/80">
              Send the acceleration payment to this address only. Include your
              transaction hash in the payment memo if your wallet supports it.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-5 sm:px-6">
        <div className="space-y-4">
          <IoSection
            label="From"
            items={data.inputs}
            chain={data.chain}
            usdPrice={usdPrice}
            isBtc={isBtc}
          />

          <div className="flex justify-center">
            <span className="text-2xl text-zinc-300" aria-hidden>
              →
            </span>
          </div>

          <IoSection
            label="To"
            items={data.outputs}
            chain={data.chain}
            usdPrice={usdPrice}
            isBtc={isBtc}
          />
        </div>

        <div className="mt-6 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm">
          <SummaryRow
            label="Fee"
            crypto={formatCrypto(data.fee)}
            usd={formatUsd(feeUsd)}
          />
          <SummaryRow
            label="Total value"
            crypto={formatCrypto(
              data.totalInput || data.totalOutput + data.fee,
            )}
            usd={formatUsd(totalUsd)}
            bold
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 py-4 sm:border-r sm:border-zinc-100 sm:last:border-r-0 ${className}`}
    >
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-zinc-800">{value}</dd>
    </div>
  );
}

function IoSection({
  label,
  items,
  chain,
  usdPrice,
  isBtc,
}: {
  label: string;
  items: { address?: string; value: number }[];
  chain: Chain;
  usdPrice: number;
  isBtc: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
        {items.map((item, i) => {
          const cryptoAmt = isBtc ? satsToBtc(item.value) : weiToEth(item.value);
          const usdAmt = cryptoToUsd(cryptoAmt, usdPrice);
          const cryptoLabel = isBtc
            ? formatBtc(item.value)
            : formatEth(item.value);

          return (
            <div
              key={i}
              className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            >
              {item.address && item.address !== "Coinbase" ? (
                <Link
                  href={`/search?q=${encodeURIComponent(item.address)}&chain=${chain}`}
                  className="min-w-0 break-all font-mono text-xs text-indigo-600 hover:underline sm:text-sm"
                >
                  {item.address}
                </Link>
              ) : (
                <span className="font-mono text-xs text-zinc-600 sm:text-sm">
                  {item.address ?? "Unknown"}
                </span>
              )}
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-sm font-medium text-zinc-900">{cryptoLabel}</p>
                <p className="text-xs text-zinc-500">
                  ({formatUsd(usdAmt)} USD)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  crypto,
  usd,
  bold = false,
}: {
  label: string;
  crypto: string;
  usd: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-2 ${bold ? "font-medium text-zinc-900" : "text-zinc-700"}`}
    >
      <span>{label}:</span>
      <span>
        {crypto} <span className="text-zinc-500">({usd} USD)</span>
      </span>
    </div>
  );
}
