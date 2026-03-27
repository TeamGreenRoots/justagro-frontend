"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ShoppingBag, Clock, CheckCircle, CreditCard, Download,
  ExternalLink, ArrowRight, Wheat, Package, AlertCircle
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, StatCard, Spinner } from "@/components/ui";
import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import type { Transaction } from "@/types";

const fetchTransactions = () => api.get("/transactions?limit=50").then(r => r.data);

function HowToBuyBanner() {
  return (
    <div className="bg-gradient-to-br from-brand-900 to-brand-800 rounded-2xl p-6 mb-6 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">How to buy on JustAgro</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: "01", icon: <Wheat className="w-4 h-4" />, title: "Browse Produce", desc: "Find available crops from verified farmers" },
          { step: "02", icon: <CreditCard className="w-4 h-4" />, title: "Receive Payment Link", desc: "Aggregator sends a secure link via WhatsApp or SMS" },
          { step: "03", icon: <CheckCircle className="w-4 h-4" />, title: "Pay & Download Receipt", desc: "Pay via card, bank transfer, or USSD. Get PDF receipt instantly." },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              {s.icon}
            </div>
            <div>
              <p className="font-bold text-sm">{s.title}</p>
              <p className="text-white/55 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-white/60 text-xs">Ready to start? Browse available produce now.</p>
        <Link href="/browse"
          className="flex items-center gap-1.5 bg-white text-brand-900 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gold-50 transition-colors">
          Browse Produce <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const user = getUser();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["buyer-transactions"],
    queryFn:  fetchTransactions,
    refetchInterval: 15000,
  });

  const txns: Transaction[] = data?.data || [];
  const pending  = txns.filter(t => t.status === "PENDING");
  const paid     = txns.filter(t => ["PAID", "ASSISTED"].includes(t.status));
  const totalSpent = paid.reduce((s, t) => s + t.totalAmount, 0);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (isLoading) return (
    <DashboardLayout title="My Dashboard">
      <Spinner text="Loading your orders..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={`Welcome back, ${firstName}`}>

      {/* First visit — no transactions yet */}
      {txns.length === 0 && (
        <>
          <HowToBuyBanner />
          <Card>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
                <Package className="w-10 h-10 text-brand-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-800 mb-2">No orders yet</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                When an aggregator creates a transaction for you, it will appear here.
                You'll receive a WhatsApp or SMS with a payment link to pay directly.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 max-w-sm text-left mb-6">
                <p className="text-amber-800 text-xs font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> How do I get a payment link?
                </p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Contact an aggregator or farm supplier and ask them to create a transaction for you on JustAgro.
                  They will send you a payment link by WhatsApp.
                </p>
              </div>
              <Link href="/browse"
                className="inline-flex items-center gap-2 bg-brand-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
                Browse Available Produce
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </>
      )}

      {/* Has transactions */}
      {txns.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={<Clock className="w-5 h-5" />}       label="Awaiting Payment" value={pending.length}          color="bg-amber-50 text-amber-700" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed"        value={paid.length}             color="bg-emerald-50 text-emerald-700" />
            <StatCard icon={<CreditCard className="w-5 h-5" />}  label="Total Spent"      value={formatNaira(totalSpent)} color="bg-blue-50 text-blue-700" />
          </div>

          {/* PENDING — action required */}
          {pending.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-semibold text-slate-900 text-sm">Action Required · {pending.length} awaiting payment</h3>
              </div>
              <div className="space-y-3">
                {pending.map(txn => (
                  <div key={txn.id} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                            PAYMENT PENDING
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-base">{txn.cropType}</p>
                        <p className="text-slate-500 text-sm">{txn.quantity}kg from {txn.farmer?.farmName || "—"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-xl font-bold text-brand-900">{formatNaira(txn.totalAmount)}</p>
                        <p className="text-slate-400 text-xs">{formatNaira(txn.pricePerKg)}/kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {txn.txnRef && (
                        <Link
                          href={`/pay/${txn.txnRef}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-brand-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-800 transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now — {formatNaira(txn.totalAmount)}
                        </Link>
                      )}
                      <p className="text-slate-400 text-xs">Created {formatDate(txn.createdAt)}</p>
                    </div>
                    <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                      <span className="text-emerald-600 font-semibold">✓</span>
                      Secure payment via Interswitch · Card, Bank Transfer, or USSD accepted
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAID history */}
          {paid.length > 0 && (
            <Card>
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Payment History</h3>
                <span className="text-slate-400 text-xs">{paid.length} completed</span>
              </div>
              <div className="divide-y divide-slate-50">
                {paid.map(txn => (
                  <div key={txn.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-900 text-sm">{txn.cropType}</p>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
                          {txn.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{txn.quantity}kg · {txn.farmer?.farmName || "—"} · {formatDate(txn.paidAt || txn.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900 text-sm">{formatNaira(txn.totalAmount)}</p>
                      {txn.receipt && (
                        <button
                          onClick={() => printReceipt(txn.receipt!)}
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-semibold mt-1 transition-colors"
                        >
                          <Download className="w-3 h-3" /> Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Browse CTA at bottom */}
          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Need to buy more produce?</p>
              <p className="text-slate-500 text-xs mt-0.5">Browse stock from all registered farmers</p>
            </div>
            <Link href="/browse"
              className="flex items-center gap-1.5 bg-brand-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-colors">
              Browse <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}




// "use client";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useState, useEffect } from "react";
// import { ShoppingBag, Clock, CheckCircle, DollarSign, Download, ExternalLink, Loader2, CreditCard } from "lucide-react";
// import toast from "react-hot-toast";
// import api from "@/lib/api";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { Card, StatCard, Spinner, Empty } from "@/components/ui";
// import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
// import type { Transaction } from "@/types";

// const fetchTransactions = () => api.get("/transactions?limit=50").then(r => r.data);

// export default function BuyerDashboard() {
//   const qc = useQueryClient();
//   const [payingId, setPayingId] = useState<string | null>(null);

//   const { data, isLoading, refetch } = useQuery({
//     queryKey: ["buyer-transactions"],
//     queryFn:  fetchTransactions,
//     refetchInterval: 15000, // auto-refresh every 15s
//   });

//   const txns: Transaction[]    = data?.data || [];
//   const pending   = txns.filter(t => t.status === "PENDING");
//   const paid      = txns.filter(t => ["PAID","ASSISTED"].includes(t.status));
//   const totalSpent = paid.reduce((s, t) => s + t.totalAmount, 0);

//   if (isLoading) return (
//     <DashboardLayout title="My Dashboard">
//       <Spinner text="Loading your orders..." />
//     </DashboardLayout>
//   );

//   return (
//     <DashboardLayout title="Buyer Dashboard">

//       {/* Browse banner */}
//       <div className="bg-brand-900 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
//         <div>
//           <p className="text-white font-semibold mb-0.5">Looking for produce?</p>
//           <p className="text-white/60 text-sm">Browse available stock from verified Nigerian farmers</p>
//         </div>
//         <a href="/browse"
//           className="flex items-center gap-2 bg-white text-brand-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-400 transition-all whitespace-nowrap flex-shrink-0">
//           Browse Produce →
//         </a>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <StatCard icon={<Clock className="w-5 h-5" />}       label="Pending Payment" value={pending.length}          color="bg-amber-50 text-amber-700" />
//         <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed"       value={paid.length}            color="bg-emerald-50 text-emerald-700" />
//         <StatCard icon={<DollarSign className="w-5 h-5" />}  label="Total Spent"     value={formatNaira(totalSpent)} color="bg-blue-50 text-blue-700" />
//       </div>

//       {/* PENDING — pay from here */}
//       {pending.length > 0 && (
//         <div className="mb-6">
//           <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
//             <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
//             Awaiting Your Payment ({pending.length})
//           </h3>
//           <div className="space-y-4">
//             {pending.map((txn: Transaction) => (
//               <div key={txn.id} className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-card">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <p className="font-bold text-slate-900 text-lg">{txn.cropType}</p>
//                     <p className="text-slate-500 text-sm">
//                       From: {txn.farmer?.user?.name || "Farmer"}
//                     </p>
//                     <p className="text-slate-400 text-xs mt-1 font-mono">{txn.txnRef}</p>
//                     <p className="text-slate-400 text-xs">{formatDate(txn.createdAt)}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-display text-2xl font-bold text-brand-900">{formatNaira(txn.totalAmount)}</p>
//                     <p className="text-slate-500 text-sm">{txn.quantity}kg @ {formatNaira(txn.pricePerKg)}/kg</p>
//                   </div>
//                 </div>

//                 {/* Payment options */}
//                 <div className="flex gap-3">
//                   {txn.paymentLink && (
//                     <a
//                       href={txn.paymentLink}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="flex-1 flex items-center justify-center gap-2 bg-brand-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-800 transition-all shadow-sm"
//                     >
//                       <CreditCard className="w-4 h-4" />
//                       Pay {formatNaira(txn.totalAmount)} Now
//                     </a>
//                   )}
//                   <button
//                     onClick={() => refetch()}
//                     className="border border-slate-200 text-slate-600 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
//                     title="Refresh status"
//                   >
//                     ↻
//                   </button>
//                 </div>
//                 <p className="text-slate-400 text-xs mt-2 text-center">
//                   Click "Pay Now" to complete via Interswitch · Card, Transfer, USSD accepted
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* empty state */}
//       {txns.length === 0 && (
//         <Card className="p-8 text-center">
//           <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
//           <p className="font-semibold text-slate-700 mb-1">No orders yet</p>
//           <p className="text-slate-400 text-sm mb-4">
//             Orders appear here when an aggregator assigns a delivery to you.
//             Your phone number must match the one registered on this account.
//           </p>
//           <a href="/browse" className="inline-flex items-center gap-2 bg-brand-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
//             Browse Available Produce
//           </a>
//         </Card>
//       )}

//       {/* Order History */}
//       {paid.length > 0 && (
//         <Card>
//           <div className="px-6 py-4 border-b border-slate-100">
//             <h3 className="font-semibold text-slate-900">Order History</h3>
//           </div>
//           <div className="divide-y divide-slate-50">
//             {paid.map((txn: Transaction) => (
//               <div key={txn.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
//                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✅</div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold text-slate-900">{txn.cropType} ({txn.quantity}kg)</p>
//                   <p className="text-xs text-slate-400">
//                     {txn.farmer?.user?.name} · {formatDate(txn.paidAt || txn.createdAt)}
//                   </p>
//                 </div>
//                 <div className="text-right flex-shrink-0">
//                   <p className="font-bold text-slate-900">{formatNaira(txn.totalAmount)}</p>
//                   <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
//                     {txn.status}
//                   </span>
//                 </div>
//                 {txn.receipt && (
//                   <button
//                     onClick={() => printReceipt(txn.receipt!)}
//                     title="Download PDF receipt"
//                     className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors flex-shrink-0"
//                   >
//                     <Download className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </Card>
//       )}
//     </DashboardLayout>
//   );
// }
