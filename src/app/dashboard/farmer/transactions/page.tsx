"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Share2, Banknote, Clock, CircleX } from "lucide-react";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty, Pagination } from "@/components/ui";
import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

function fetchTxns(page: number, status: string) {
  const q = status !== "ALL" ? `&status=${status}` : "";
  return api.get(`/transactions?page=${page}&limit=10${q}`).then(r => r.data);
}

const TABS = ["ALL", "PAID", "ASSISTED", "PENDING", "CANCELLED"];

function TxnIcon({ status }: { status: string }) {
  if (["PAID", "ASSISTED"].includes(status))
    return <Banknote className="w-5 h-5 text-emerald-600" />;
  if (status === "PENDING")
    return <Clock className="w-5 h-5 text-amber-500" />;
  return <CircleX className="w-5 h-5 text-red-500" />;
}

export default function FarmerTransactions() {
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-transactions", page, status],
    queryFn:  () => fetchTxns(page, status),
  });

  return (
    <DashboardLayout title="My Transactions">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => { setStatus(t); setPage(1); }}
            className={cn("px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              status === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner text="Loading transactions..." /> : (
        <Card>
          {!data?.data?.length ? (
            <Empty title="No transactions found" desc="Transactions will appear once buyers make payments" />
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {data.data.map((txn: Transaction) => (
                  <div key={txn.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TxnIcon status={txn.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
                      <p className="text-xs text-slate-400">
                        {txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer"} · {txn.txnRef} · {formatDate(txn.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">{formatNaira(txn.farmerReceives)}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
                        {txn.status}
                      </span>
                    </div>
                    {txn.receipt && (
                      <div className="flex gap-2 ml-2">
                        <button onClick={() => printReceipt(txn.receipt!)}
                          title="Download PDF receipt"
                          className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`✅ PAYMENT RECEIPT — JustAgro\nRef: ${txn.txnRef}\nProduce: ${txn.cropType} (${txn.quantity}kg)\nAmount: ₦${txn.totalAmount.toLocaleString()}\nDate: ${formatDate(txn.paidAt || txn.createdAt)}`)}`}
                          target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                          title="Share via WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4">
                <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} onPage={setPage} />
              </div>
            </>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}