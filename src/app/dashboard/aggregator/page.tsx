"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Package, Users, TrendingUp, DollarSign, Clock, CheckCircle, Plus, Copy, Share2, ExternalLink, Loader2, Stars } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, StatCard, Spinner, Empty } from "@/components/ui";
import { formatNaira, formatDate, statusColor, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const fetchDashboard = () => api.get("/aggregator/dashboard").then(r => r.data.data);

export default function AggregatorDashboard() {
  const qc = useQueryClient();
  const [copiedId,  setCopiedId]  = useState<string | null>(null);
  const [aiMarket,  setAiMarket]  = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function loadMarketSummary() {
    if (aiMarket) return;
    setAiLoading(true);
    try {
      const res = await api.get("/ai/market-summary");
      setAiMarket(res.data.result);
    } catch { setAiMarket({ headline: "Market data unavailable", topDemand: [], priceAlert: "", tip: "Check back soon", sentiment: "NEUTRAL" }); }
    finally { setAiLoading(false); }
  }
  const [assisting, setAssisting] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["aggregator-dashboard"], queryFn: fetchDashboard });

  if (isLoading) return <DashboardLayout title="Platform Overview"><Spinner text="Loading..." /></DashboardLayout>;

  const { stats, recentTransactions } = data || {};
  const pendingTxns = (recentTransactions || []).filter((t: Transaction) => t.status === "PENDING");

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day  = d.toLocaleDateString("en-NG", { weekday: "short" });
    const paid = (recentTransactions || []).filter((t: Transaction) => t.paidAt && new Date(t.paidAt).toDateString() === d.toDateString());
    return { day, volume: paid.reduce((s: number, t: Transaction) => s + t.totalAmount, 0) };
  });

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Payment link copied! Send to buyer");
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function markAssisted(id: string) {
    if (!confirm("Confirm this was paid in cash?")) return;
    setAssisting(id);
    try {
      await api.post(`/transactions/${id}/assist`, { notes: "Confirmed by aggregator" });
      toast.success("Marked as paid");
      qc.invalidateQueries({ queryKey: ["aggregator-dashboard"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setAssisting(null); }
  }

  return (
    <DashboardLayout title="Platform Overview">

      {/* PRIMARY ACTION */}
      <div className="bg-brand-900 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-0.5">Log a new delivery</p>
          <p className="text-white/60 text-sm">Pick farmer → produce → buyer → send payment link</p>
        </div>
        <a href="/dashboard/aggregator/transactions"
          className="flex items-center gap-2 bg-white text-brand-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gold-400 transition-all whitespace-nowrap flex-shrink-0">
          <Plus className="w-4 h-4" /> New Transaction
        </a>
      </div>

      {/* PENDING PAYMENTS */}
      {pendingTxns.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-semibold text-slate-900">{pendingTxns.length} Awaiting Payment</h3>
          </div>
          <div className="space-y-3">
            {pendingTxns.map((txn: Transaction) => {
              const buyerName  = txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer";
              const buyerPhone = txn.buyerContact?.phone || txn.buyer?.user?.phone || "";
              return (
                <div key={txn.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
                      <p className="text-slate-500 text-sm">{txn.farmer?.user?.name} → {buyerName}</p>
                      <p className="text-slate-400 text-xs mt-0.5 font-mono">{txn.txnRef}</p>
                    </div>
                    <p className="font-bold text-slate-900 text-lg flex-shrink-0">{formatNaira(txn.totalAmount)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {txn.paymentLink && (
                      <>
                        <button onClick={() => copyLink(txn.paymentLink!, txn.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-800 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors">
                          {copiedId === txn.id ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                        </button>
                        {buyerPhone && (
                          <a href={`https://wa.me/${buyerPhone.replace(/^0/,"234")}?text=${encodeURIComponent(`Hello ${buyerName}!\n\nYour JustAgro payment:\n${txn.cropType} (${txn.quantity}kg) = ₦${txn.totalAmount.toLocaleString()}\n\nPay here: ${txn.paymentLink}`)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-700 transition-colors">
                            <Share2 className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        <a href={txn.paymentLink} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold bg-brand-900 text-white px-3 py-2 rounded-xl hover:bg-brand-800 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Open Payment Page
                        </a>
                      </>
                    )}
                    <button onClick={() => markAssisted(txn.id)} disabled={assisting === txn.id}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-60">
                      {assisting === txn.id
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                        : <><CheckCircle className="w-3.5 h-3.5" /> Mark Paid (Cash)</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* AI Market Summary */}
      <div className="bg-gradient-to-r from-emerald-900 to-brand-900 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold"><Stars /> AI Market Intelligence</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            aiMarket?.sentiment === "BULLISH" ? "bg-emerald-400/20 text-emerald-300" :
            aiMarket?.sentiment === "BEARISH" ? "bg-red-400/20 text-red-300" :
            "bg-white/10 text-white/70"
          }`}>
            {aiMarket?.sentiment || "LOADING"}
          </span>
        </div>
        {aiLoading ? (
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analysing market data...
          </div>
        ) : aiMarket ? (
          <div>
            <p className="text-white text-sm font-semibold mb-2">📰 {aiMarket.headline}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiMarket.topDemand?.length > 0 && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">High Demand Today</p>
                  <p className="text-white text-sm font-medium">{aiMarket.topDemand.join(", ")}</p>
                </div>
              )}
              {aiMarket.priceAlert && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Price Alert</p>
                  <p className="text-yellow-300 text-sm">{aiMarket.priceAlert}</p>
                </div>
              )}
              {aiMarket.tip && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-1">Today's Tip</p>
                  <p className="text-white text-sm">{aiMarket.tip}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={<Package className="w-5 h-5" />}     label="Total Transactions" value={stats?.totalTransactions || 0}              color="bg-blue-50 text-blue-700" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Paid"                value={stats?.paidCount || 0}                     color="bg-emerald-50 text-emerald-700" />
        <StatCard icon={<Clock className="w-5 h-5" />}       label="Pending"             value={stats?.pendingCount || 0}                   color="bg-amber-50 text-amber-700" />
        <StatCard icon={<DollarSign className="w-5 h-5" />}  label="Platform Revenue"    value={formatNaira(stats?.totalRevenue || 0)}      color="bg-purple-50 text-purple-700" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<TrendingUp className="w-5 h-5" />}  label="Total Volume"    value={formatNaira(stats?.totalVolume || 0)}  color="bg-brand-50 text-brand-700" />
        <StatCard icon={<Users className="w-5 h-5" />}       label="Farmers"         value={stats?.totalFarmers || 0}              color="bg-slate-100 text-slate-700" />
        <StatCard icon={<Users className="w-5 h-5" />}       label="Buyer Contacts"  value={stats?.totalBuyerContacts || 0}        color="bg-slate-100 text-slate-700" />
        <StatCard icon={<Package className="w-5 h-5" />}     label="Available Stock" value={stats?.availableStock || 0}            color="bg-slate-100 text-slate-700" />
      </div>

      {/* CHART */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-5">7-Day Payment Volume</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#064E3B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#064E3B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : `₦${v}`} />
            <Tooltip formatter={(v: any) => [formatNaira(v), "Volume"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
            <Area type="monotone" dataKey="volume" stroke="#064E3B" strokeWidth={2.5} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* RECENT PAID */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Recent Paid Transactions</h3>
          <a href="/dashboard/aggregator/transactions" className="text-brand-600 text-xs font-medium hover:text-brand-800">View all →</a>
        </div>
        <div className="divide-y divide-slate-50">
          {!(recentTransactions || []).some((t: Transaction) => ["PAID","ASSISTED"].includes(t.status)) ? (
            <Empty title="No paid transactions yet" />
          ) : (
            (recentTransactions || [])
              .filter((t: Transaction) => ["PAID","ASSISTED"].includes(t.status))
              .slice(0, 5)
              .map((txn: Transaction) => (
                <div key={txn.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {txn.cropType} ({txn.quantity}kg) — {txn.farmer?.user?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      → {txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer"} · {formatDate(txn.paidAt || txn.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{formatNaira(txn.totalAmount)}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
