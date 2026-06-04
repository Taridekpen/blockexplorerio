import { IndexedTransactionsAdmin } from "@/components/admin/IndexedTransactionsAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indexed transactions — Admin",
  robots: { index: false, follow: false },
};

export default function AdminIndexedTransactionsPage() {
  return <IndexedTransactionsAdmin />;
}
