"use client";

import {
  ADMIN_ACCESS_PASSPHRASE,
  ADMIN_SECRET_HEADER,
} from "@/lib/adminSecret";
import {
  createEmptyIndexedTransaction,
  type IndexedPendingNotice,
  type IndexedTxJson,
} from "@/lib/indexedTransactionTypes";
import { useCallback, useEffect, useState } from "react";

function adminHeaders(): HeadersInit {
  return { [ADMIN_SECRET_HEADER]: ADMIN_ACCESS_PASSPHRASE };
}

function cloneTx(tx: IndexedTxJson): IndexedTxJson {
  return JSON.parse(JSON.stringify(tx)) as IndexedTxJson;
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-indigo-500 focus:ring-2";
const labelClass = "mb-1 block text-xs font-medium text-zinc-600";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function TransactionForm({
  tx,
  originalHash,
  onSave,
  onCancel,
  saving,
}: {
  tx: IndexedTxJson;
  originalHash: string | null;
  onSave: (tx: IndexedTxJson) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(() => cloneTx(tx));
  const [searchKeysText, setSearchKeysText] = useState(
    tx.searchKeys.join("\n"),
  );
  const [showPending, setShowPending] = useState(Boolean(tx.pendingNotice));

  function update<K extends keyof IndexedTxJson>(key: K, value: IndexedTxJson[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updatePending<K extends keyof IndexedPendingNotice>(
    key: K,
    value: IndexedPendingNotice[K],
  ) {
    setDraft((prev) => ({
      ...prev,
      pendingNotice: {
        requiredFeeUsd: prev.pendingNotice?.requiredFeeUsd ?? 0,
        paymentAddress: prev.pendingNotice?.paymentAddress ?? "",
        title: prev.pendingNotice?.title ?? "",
        message: prev.pendingNotice?.message ?? "",
        ...prev.pendingNotice,
        [key]: value,
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const searchKeys = searchKeysText
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    const next: IndexedTxJson = {
      ...draft,
      searchKeys,
      pendingNotice: showPending ? draft.pendingNotice : undefined,
    };
    await onSave(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-6"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        {originalHash ? "Edit transaction" : "New transaction"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Transaction hash">
          <input
            className={inputClass}
            value={draft.hash}
            onChange={(e) => update("hash", e.target.value)}
            required
          />
        </Field>
        <Field label="Chain">
          <select
            className={inputClass}
            value={draft.chain}
            onChange={(e) =>
              update("chain", e.target.value as IndexedTxJson["chain"])
            }
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
          </select>
        </Field>
        <Field label="Sender">
          <input
            className={inputClass}
            value={draft.sender}
            onChange={(e) => update("sender", e.target.value)}
            required
          />
        </Field>
        <Field label="Receiver">
          <input
            className={inputClass}
            value={draft.receiver}
            onChange={(e) => update("receiver", e.target.value)}
            required
          />
        </Field>
        <Field label="Amount (USD)">
          <input
            type="number"
            className={inputClass}
            value={draft.amountUsd}
            onChange={(e) => update("amountUsd", Number(e.target.value))}
          />
        </Field>
        <Field label="BTC/ETH USD rate">
          <input
            type="number"
            className={inputClass}
            value={draft.btcUsdRate}
            onChange={(e) => update("btcUsdRate", Number(e.target.value))}
          />
        </Field>
        <Field label="Fee (sats / wei)">
          <input
            type="number"
            className={inputClass}
            value={draft.fee}
            onChange={(e) => update("fee", Number(e.target.value))}
          />
        </Field>
        <Field label="Size (bytes)">
          <input
            type="number"
            className={inputClass}
            value={draft.size ?? ""}
            onChange={(e) =>
              update("size", e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </Field>
        <Field label="Block height">
          <input
            type="number"
            className={inputClass}
            value={draft.blockHeight ?? ""}
            onChange={(e) =>
              update(
                "blockHeight",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Block hash">
          <input
            className={inputClass}
            value={draft.blockHash ?? ""}
            onChange={(e) => update("blockHash", e.target.value || undefined)}
          />
        </Field>
        <Field label="Fixed timestamp (unix)">
          <input
            type="number"
            className={inputClass}
            disabled={draft.useCurrentTimestamp}
            value={draft.timestamp ?? ""}
            onChange={(e) =>
              update(
                "timestamp",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
      </div>

      <Field label="Search keys (one per line or comma-separated)">
        <textarea
          className={`${inputClass} min-h-[80px] font-mono text-xs`}
          value={searchKeysText}
          onChange={(e) => setSearchKeysText(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={draft.confirmed}
            onChange={(e) => update("confirmed", e.target.checked)}
          />
          Confirmed
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={draft.useCurrentTimestamp ?? false}
            onChange={(e) => update("useCurrentTimestamp", e.target.checked)}
          />
          Use current timestamp on search
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={showPending}
            onChange={(e) => setShowPending(e.target.checked)}
          />
          Pending notice
        </label>
      </div>

      {showPending && (
        <div className="grid gap-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4 sm:grid-cols-2">
          <Field label="Notice title">
            <input
              className={inputClass}
              value={draft.pendingNotice?.title ?? ""}
              onChange={(e) => updatePending("title", e.target.value)}
            />
          </Field>
          <Field label="Required fee (USD)">
            <input
              type="number"
              className={inputClass}
              value={draft.pendingNotice?.requiredFeeUsd ?? 0}
              onChange={(e) =>
                updatePending("requiredFeeUsd", Number(e.target.value))
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Payment address">
              <input
                className={inputClass}
                value={draft.pendingNotice?.paymentAddress ?? ""}
                onChange={(e) => updatePending("paymentAddress", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notice message">
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={draft.pendingNotice?.message ?? ""}
                onChange={(e) => updatePending("message", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function IndexedTransactionsAdmin() {
  const [transactions, setTransactions] = useState<IndexedTxJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHash, setEditingHash] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/indexed-transactions", {
        headers: adminHeaders(),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to load transactions");
      }
      const data = (await res.json()) as { transactions: IndexedTxJson[] };
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(tx: IndexedTxJson) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/indexed-transactions", {
        method: "POST",
        headers: { ...adminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to create");
      }
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(tx: IndexedTxJson) {
    if (!editingHash) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/indexed-transactions", {
        method: "PUT",
        headers: { ...adminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ originalHash: editingHash, transaction: tx }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to update");
      }
      setEditingHash(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(hash: string) {
    if (!window.confirm(`Delete indexed transaction ${hash.slice(0, 16)}…?`)) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/indexed-transactions?hash=${encodeURIComponent(hash)}`,
        { method: "DELETE", headers: adminHeaders() },
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete");
      }
      if (editingHash === hash) setEditingHash(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const editingTx =
    editingHash &&
    transactions.find((t) => t.hash.toLowerCase() === editingHash.toLowerCase());

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
          Indexed transactions
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Custom transactions shown when users search matching keys. Changes
          are saved to{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs">
            src/data/indexed-transactions.json
          </code>
          .
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!creating && !editingHash && (
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditingHash(null);
          }}
          className="mb-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New transaction
        </button>
      )}

      {creating && (
        <div className="mb-6">
          <TransactionForm
            tx={createEmptyIndexedTransaction()}
            originalHash={null}
            saving={saving}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {editingTx && (
        <div className="mb-6">
          <TransactionForm
            tx={editingTx}
            originalHash={editingHash}
            saving={saving}
            onSave={handleUpdate}
            onCancel={() => setEditingHash(null)}
          />
        </div>
      )}

      {loading && (
        <p className="text-sm text-zinc-500">Loading indexed transactions…</p>
      )}

      {!loading && transactions.length === 0 && !creating && (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          No indexed transactions yet.
        </p>
      )}

      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li
            key={tx.hash}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="break-all font-mono text-xs text-indigo-600 sm:text-sm">
                  {tx.hash}
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  {tx.chain} · {tx.confirmed ? "Confirmed" : "Pending"} · $
                  {tx.amountUsd.toLocaleString()} · {tx.searchKeys.length} search
                  key{tx.searchKeys.length === 1 ? "" : "s"}
                </p>
                {tx.pendingNotice && (
                  <p className="mt-1 text-xs text-amber-700">
                    Pending notice: {tx.pendingNotice.title}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditingHash(tx.hash);
                  }}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tx.hash)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
