import {
  formatBtc,
  formatEth,
  formatTimestamp,
  formatTimestampShort,
  truncateHash,
} from "@/lib/format";
import type { SearchResult } from "@/types/explorer";
import { BlockTransactionList } from "./BlockTransactionList";
import { SourceBadge } from "./SourceBadge";
import { TransactionDetail } from "./TransactionDetail";

const cardClass =
  "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6";
const emptyClass =
  "rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8";

export function SearchResults({ result }: { result: SearchResult }) {
  if (result.kind === "not_found") {
    return (
      <div className={emptyClass}>
        <p className="text-zinc-700">No results for</p>
        <p className="mt-1 break-all font-mono text-sm text-zinc-500">
          {result.query}
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          Try a tx hash, block height, or address.
        </p>
      </div>
    );
  }

  if (result.kind === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
        <p className="font-medium text-red-800">Lookup failed</p>
        <p className="mt-2 text-sm text-red-600">{result.message}</p>
        <p className="mt-2 break-all font-mono text-xs text-zinc-500">
          {result.query}
        </p>
      </div>
    );
  }

  if (result.kind === "transaction") {
    return <TransactionDetail data={result.data} />;
  }

  if (result.kind === "block") {
    const { data } = result;
    return (
      <div className={cardClass}>
        <ResultHeader
          title={`Block #${data.height.toLocaleString()}`}
          source={data.source}
          chain={data.chain}
        />
        <p className="break-all font-mono text-xs text-indigo-600 sm:text-sm">
          {data.hash}
        </p>
        <dl className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
          <Detail label="Transactions" value={data.txCount.toLocaleString()} />
          <Detail label="Timestamp" value={formatTimestamp(data.timestamp)} />
          {data.size != null && (
            <Detail label="Size" value={`${data.size.toLocaleString()} bytes`} />
          )}
        </dl>
        <BlockTransactionList block={data} />
      </div>
    );
  }

  if (result.kind === "address") {
    const { data } = result;
    const balance =
      data.chain === "bitcoin"
        ? formatBtc(data.balance)
        : formatEth(data.balance);
    const formatValue =
      data.chain === "bitcoin"
        ? (v: number) => formatBtc(v)
        : (v: number) => formatEth(v);

    return (
      <div className={cardClass}>
        <ResultHeader title="Address" source={data.source} chain={data.chain} />
        <p className="break-all font-mono text-xs text-indigo-600 sm:text-sm">
          {data.address}
        </p>
        <dl className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
          <Detail label="Balance" value={balance} />
          <Detail label="Transactions" value={data.txCount.toLocaleString()} />
        </dl>
        {data.transactions.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <h3 className="mb-3 text-sm font-medium text-zinc-700">
              Recent Transactions
            </h3>
            <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
              {data.transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <span className="min-w-0 break-all font-mono text-xs text-indigo-600 sm:text-sm">
                    {truncateHash(tx.hash, 8)}
                  </span>
                  <div className="text-left text-sm text-zinc-600 sm:text-right">
                    <p>{formatValue(tx.value)}</p>
                    {tx.timestamp && (
                      <>
                        <p className="text-xs sm:hidden">
                          {formatTimestampShort(tx.timestamp)}
                        </p>
                        <p className="hidden text-xs sm:block">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function ResultHeader({
  title,
  source,
  chain,
}: {
  title: string;
  source: "live";
  chain: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
      <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">{title}</h2>
      <SourceBadge source={source} />
      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-600">
        {chain}
      </span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-zinc-800">
        {value}
      </dd>
    </div>
  );
}
