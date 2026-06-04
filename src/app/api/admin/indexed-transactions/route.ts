import { isAdminAuthorized } from "@/lib/adminAuth";
import { invalidateIndexedCache } from "@/lib/indexedTransactions";
import {
  createEmptyIndexedTransaction,
  readIndexedTransactions,
  writeIndexedTransactions,
  type IndexedTxJson,
} from "@/lib/indexedTransactionStore";
import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizeTransaction(body: IndexedTxJson): IndexedTxJson {
  const searchKeys = body.searchKeys
    .map((k) => k.trim())
    .filter(Boolean);
  if (!searchKeys.includes(body.hash.trim())) {
    searchKeys.unshift(body.hash.trim());
  }
  return {
    ...body,
    hash: body.hash.trim(),
    searchKeys,
    sender: body.sender.trim(),
    receiver: body.receiver.trim(),
    pendingNotice: body.pendingNotice
      ? {
          ...body.pendingNotice,
          paymentAddress: body.pendingNotice.paymentAddress.trim(),
          title: body.pendingNotice.title.trim(),
          message: body.pendingNotice.message.trim(),
        }
      : undefined,
  };
}

function validateTransaction(tx: IndexedTxJson): string | null {
  if (!tx.hash) return "Hash is required";
  if (!tx.sender) return "Sender is required";
  if (!tx.receiver) return "Receiver is required";
  if (!tx.searchKeys.length) return "At least one search key is required";
  return null;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) return unauthorized();
  const transactions = await readIndexedTransactions();
  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const body = (await request.json()) as IndexedTxJson | null;
  const tx = normalizeTransaction(body ?? createEmptyIndexedTransaction());
  const error = validateTransaction(tx);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const transactions = await readIndexedTransactions();
  if (transactions.some((t) => t.hash.toLowerCase() === tx.hash.toLowerCase())) {
    return NextResponse.json(
      { error: "A transaction with this hash already exists" },
      { status: 409 },
    );
  }

  transactions.push(tx);
  await writeIndexedTransactions(transactions);
  invalidateIndexedCache();
  return NextResponse.json({ transaction: tx }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const payload = (await request.json()) as {
    originalHash?: string;
    transaction: IndexedTxJson;
  };
  const originalHash = payload.originalHash?.trim();
  const tx = normalizeTransaction(payload.transaction);
  const error = validateTransaction(tx);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!originalHash) {
    return NextResponse.json(
      { error: "originalHash is required" },
      { status: 400 },
    );
  }

  const transactions = await readIndexedTransactions();
  const index = transactions.findIndex(
    (t) => t.hash.toLowerCase() === originalHash.toLowerCase(),
  );
  if (index === -1) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const duplicate = transactions.some(
    (t, i) =>
      i !== index && t.hash.toLowerCase() === tx.hash.toLowerCase(),
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "Another transaction already uses this hash" },
      { status: 409 },
    );
  }

  transactions[index] = tx;
  await writeIndexedTransactions(transactions);
  invalidateIndexedCache();
  return NextResponse.json({ transaction: tx });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) return unauthorized();

  const hash = request.nextUrl.searchParams.get("hash")?.trim();
  if (!hash) {
    return NextResponse.json({ error: "hash query parameter is required" }, {
      status: 400,
    });
  }

  const transactions = await readIndexedTransactions();
  const next = transactions.filter(
    (t) => t.hash.toLowerCase() !== hash.toLowerCase(),
  );
  if (next.length === transactions.length) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  await writeIndexedTransactions(next);
  invalidateIndexedCache();
  return NextResponse.json({ ok: true });
}
