"use client";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, Package, Clock, Copy, CheckCircle, ExternalLink, Download, Share2, StarIcon, Lightbulb } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty } from "@/components/ui";
import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
import type { Farmer, Transaction } from "@/types";

const fetchDashboard = async (): Promise<Farmer> => {
  const res = await api.get("/farmer/dashboard/me");
  return res.data.data;
};

export default function FarmerDashboard() {
  const [copied,    setCopied]    = useState(false);
  const [showAI,    setShowAI]    = useState(false);
  const [aiData,    setAiData]    = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function loadAiAdvice() {
    if (aiData) { setShowAI(true); return; }
    setShowAI(true);
    setAiLoading(true);
    try {
      const res = await api.get("/ai/farmer-advice");
      setAiData(res.data.result);
    } catch { setAiData({ greeting: "Hello!", encouragement: "Keep farming!", topAdvice: ["Keep your inventory updated", "Add quality notes to listings"], performance: "" }); }
    finally { setAiLoading(false); }
  }

  const { data: farmer, isLoading } = useQuery({
    queryKey: ["farmer-dashboard"],
    queryFn:  fetchDashboard,
  });

  const copyAccount = () => {
    if (!farmer?.virtualAccountNo) return;
    navigator.clipboard.writeText(farmer.virtualAccountNo);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <DashboardLayout title="My Dashboard">
      <Spinner text="Loading your dashboard..." />
    </DashboardLayout>
  );

  if (!farmer) return null;

  return (
    <DashboardLayout title={`Welcome, ${farmer.user.name.split(" ")[0]}`}>

      {/*WALLET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0.5">Wallet Balance</p>
          <p className="font-bold text-2xl text-slate-900">{formatNaira(farmer.walletBalance)}</p>
          <p className="text-slate-400 text-xs mt-1">After 1% platform fee</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0.5">Total Earned (Gross)</p>
          <p className="font-bold text-2xl text-slate-900">{formatNaira(farmer.totalEarned)}</p>
          <p className="text-slate-400 text-xs mt-1">Total buyers paid for your goods</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0.5">Available Stock</p>
          <p className="font-bold text-2xl text-slate-900">{(farmer.inventory?.filter((i: any) => i.status === "AVAILABLE")?.length) || 0}</p>
          <p className="text-slate-400 text-xs mt-1">Items listed for sale</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-0.5">Pending Payment</p>
          <p className="font-bold text-2xl text-slate-900">{farmer.stats?.pendingCount ?? 0}</p>
          <p className="text-slate-400 text-xs mt-1">Awaiting buyer payment</p>
        </div>
      </div>

      {farmer.totalEarned > 0 && (
        <div className="bg-gradient-to-r from-brand-900 to-emerald-800 rounded-2xl p-5 mb-6 text-white">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Earnings Breakdown</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Buyers paid</p>
              <p className="font-display text-xl font-bold">{formatNaira(farmer.totalEarned)}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Platform fee (1%)</p>
              <p className="font-display text-xl font-bold text-red-300">-{formatNaira(farmer.totalEarned * 0.01)}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">You received</p>
              <p className="font-display text-xl font-bold text-gold-400">{formatNaira(farmer.walletBalance)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Virtual Account Card */}
        <div className="relative overflow-hidden bg-brand-900 rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">Virtual Payment Account</p>
            <p className="text-white/60 text-xs mb-1">Account Number</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-2xl font-bold tracking-wider">
                {farmer.virtualAccountNo || "Setting up..."}
              </span>
              {farmer.virtualAccountNo && (
                <button onClick={copyAccount} className="text-white/60 hover:text-white transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-gold-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <p className="text-white/50 text-xs">Bank</p>
                <p className="text-sm font-semibold mt-0.5">{farmer.bankName || "Access Bank"}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">Balance</p>
                <p className="text-sm font-semibold mt-0.5 text-gold-400">{formatNaira(farmer.walletBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Info */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Farm Profile</h3>
          <div className="space-y-3">
            {[
              ["Farm Name", farmer.farmName],
              ["Location",  farmer.location],
              ["Phone",     farmer.user.phone],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-slate-500">{l}</span>
                <span className="font-medium font-mono text-xs">{v}</span>
              </div>
            ))}
            {farmer.cropTypes?.length > 0 && (
              <div>
                <p className="text-slate-500 text-sm mb-2">Crop Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {farmer.cropTypes.map((c, i) => (
                    <span key={i} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full font-medium border border-brand-100">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Inventory Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">My Stock</h3>
            <a href="/dashboard/farmer/inventory" className="text-brand-600 text-xs font-medium hover:text-brand-800 flex items-center gap-1">
              Manage <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {!farmer.inventory?.length ? (
            <Empty title="No stock listed" desc="Add your produce to get started" />
          ) : (
            <div className="space-y-2">
              {farmer.inventory.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.cropType}</p>
                    <p className="text-xs text-slate-400">{inv.quantity}kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNaira(inv.pricePerKg)}/kg</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(inv.status))}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>


      {/* AI Advice Panel */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold mb-0.5"><StarIcon /> AI Farm Advisor</p>
            <p className="text-white/60 text-sm">Get personalised tips for your farm based on your data</p>
          </div>
          <button onClick={loadAiAdvice}
            className="bg-white text-purple-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors whitespace-nowrap flex-shrink-0">
            {showAI ? "Hide" : "Get Advice"}
          </button>
        </div>

        {showAI && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/20">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-white">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">AI is analysing your farm data...</span>
              </div>
            ) : aiData ? (
              <div>
                <p className="text-white font-semibold mb-2">{aiData.greeting}</p>
                {aiData.performance && <p className="text-white/80 text-sm mb-3">{aiData.performance}</p>}
                {aiData.topAdvice?.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {aiData.topAdvice.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-white/90 text-xs">
                        <span className="text-green-400 flex-shrink-0">✓</span> {tip}
                      </li>
                    ))}
                  </ul>
                )}
                {aiData.pricingTip && (
                  <p className="text-yellow-300 text-xs italic"><Lightbulb /> {aiData.pricingTip}</p>
                )}
                <p className="text-white/70 text-xs mt-2">{aiData.encouragement}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <a href="/dashboard/farmer/transactions" className="text-brand-600 text-xs font-medium hover:text-brand-800">View all →</a>
        </div>

        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 grid grid-cols-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span className="col-span-2">Produce / Buyer</span>
          <span>Buyer Paid</span>
          <span className="text-right">You Received</span>
        </div>

        <div className="divide-y divide-slate-50">
          {!farmer.recentTransactions?.length ? (
            <Empty title="No transactions yet" desc="Transactions appear once buyers make payments" />
          ) : (
            farmer.recentTransactions.slice(0, 8).map((txn: Transaction) => (
              <div key={txn.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="grid grid-cols-4 items-center gap-2">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
                    <p className="text-xs text-slate-400">
                      {txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer"} · {formatDate(txn.createdAt)}
                    </p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold inline-block mt-1", statusColor(txn.status))}>
                      {txn.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{formatNaira(txn.totalAmount)}</p>
                    <p className="text-xs text-slate-400">gross</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-700">{formatNaira(txn.farmerReceives)}</p>
                    <p className="text-xs text-slate-400">after fee</p>
                    {txn.receipt && (
                      <div className="flex justify-end gap-1 mt-1">
                        <button onClick={() => printReceipt(txn.receipt!)}
                          className="w-6 h-6 rounded bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors" title="Download PDF">
                          <Download className="w-3 h-3" />
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(`RECEIPT: ${txn.cropType} ${txn.quantity}kg = ₦${txn.totalAmount.toLocaleString()} | Ref: ${txn.txnRef}`)}`}
                          target="_blank" rel="noreferrer"
                          className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Share WhatsApp">
                          <Share2 className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}