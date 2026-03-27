"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, ChevronRight, X, Loader2, Wheat, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Pagination, Button } from "@/components/ui";
import { formatNaira, formatDate, statusColor, cn } from "@/lib/utils";
import type { Farmer, Inventory } from "@/types";

function fetchFarmers(page: number, search: string) {
  return api.get(`/farmers?page=${page}&limit=10${search ? `&search=${search}` : ""}`).then(r => r.data);
}

function fetchFarmerDetail(id: string) {
  return api.get(`/farmers/${id}`).then(r => r.data.data);
}

function AddStockModal({ farmerId, farmerName, onClose, onSaved }: {
  farmerId: string; farmerName: string; onClose: () => void; onSaved: () => void;
}) {
  const [cropType,   setCropType]   = useState("");
  const [quantity,   setQuantity]   = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [notes,      setNotes]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

  async function save() {
    setError("");
    if (!cropType || !quantity || !pricePerKg) { setError("All fields are required"); return; }
    setLoading(true);
    try {
      await api.post("/inventory", {
        farmerId, cropType: cropType.trim(),
        quantity: parseFloat(quantity), pricePerKg: parseFloat(pricePerKg),
        notes: notes.trim() || null,
      });
      toast.success(`Stock added for ${farmerName}`);
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add stock");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Add Stock</h3>
            <p className="text-slate-500 text-xs mt-0.5">For {farmerName}</p>
          </div>
          <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Type *</label>
            <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} placeholder="e.g. Rice, Maize" className={ic} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity (kg) *</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="500" min="0" className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price/kg (₦) *</label>
              <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} placeholder="180" min="0" className={ic} />
            </div>
          </div>
          {quantity && pricePerKg && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <p className="text-brand-600 text-xs font-semibold">TOTAL VALUE</p>
              <p className="font-display text-xl font-bold text-brand-700">{formatNaira(parseFloat(quantity || "0") * parseFloat(pricePerKg || "0"))}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Grade, quality notes..." className={ic} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={save} disabled={loading}
              className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Add Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FarmerPanel({ farmerId, onClose }: { farmerId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [showAddStock, setShowAddStock] = useState(false);

  const { data: farmer, isLoading, refetch } = useQuery({
    queryKey: ["farmer-detail", farmerId],
    queryFn:  () => fetchFarmerDetail(farmerId),
  });

  return (
    <>
      {showAddStock && farmer && (
        <AddStockModal
          farmerId={farmerId}
          farmerName={farmer.user.name}
          onClose={() => setShowAddStock(false)}
          onSaved={() => { refetch(); qc.invalidateQueries({ queryKey: ["aggregator-inventory"] }); }}
        />
      )}
      <div className="fixed inset-0 bg-black/40 z-40 flex justify-end" onClick={onClose}>
        <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Farmer Details</h2>
            <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          {isLoading ? <Spinner text="Loading farmer..." /> : !farmer ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Could not load farmer details</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Wheat className="w-7 h-7 text-brand-700" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{farmer.user.name}</p>
                  <p className="text-slate-500 text-sm">{farmer.farmName} · {farmer.location}</p>
                  <p className="text-slate-400 text-xs font-mono">{farmer.user.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-emerald-600 text-xs font-semibold mb-0.5">Wallet Balance</p>
                  <p className="font-bold text-emerald-800">{formatNaira(farmer.walletBalance)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-blue-600 text-xs font-semibold mb-0.5">Total Earned</p>
                  <p className="font-bold text-blue-800">{formatNaira(farmer.totalEarned)}</p>
                </div>
              </div>

              {farmer.cropTypes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Crop Types</p>
                  <div className="flex flex-wrap gap-2">
                    {farmer.cropTypes.map((c: string, i: number) => (
                      <span key={i} className="bg-brand-50 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium border border-brand-100">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Inventory</p>
                  <button onClick={() => setShowAddStock(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-full transition-colors">
                    <Plus className="w-3 h-3" /> Add Stock
                  </button>
                </div>
                {!farmer.inventory?.length ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                    <Wheat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm font-medium mb-1">No stock listed yet</p>
                    <p className="text-slate-400 text-xs mb-3">Add inventory so this farmer can receive payments</p>
                    <button onClick={() => setShowAddStock(true)}
                      className="inline-flex items-center gap-1.5 bg-brand-900 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-brand-800 transition-colors">
                      <Plus className="w-3 h-3" /> Add First Stock
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {farmer.inventory.map((inv: Inventory) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{inv.cropType}</p>
                          <p className="text-xs text-slate-400">{inv.quantity}kg · {formatNaira(inv.pricePerKg)}/kg</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 text-sm">{formatNaira(inv.totalValue)}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(inv.status))}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {farmer.transactions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Transactions</p>
                  <div className="space-y-2">
                    {farmer.transactions.slice(0, 5).map((txn: any) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{txn.cropType} ({txn.quantity}kg)</p>
                          <p className="text-xs text-slate-400">{formatDate(txn.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatNaira(txn.farmerReceives)}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>{txn.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Empty state with strong CTA 
function EmptyFarmers({ searched }: { searched: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
        <Wheat className="w-10 h-10 text-brand-300" />
      </div>
      <h3 className="font-display text-xl font-semibold text-slate-800 mb-2">
        {searched ? "No farmers match your search" : "No farmers registered yet"}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
        {searched
          ? "Try a different name, phone number, or location."
          : "Farmers you register will appear here. You can register farmers with or without smartphones — they receive SMS notifications for every payment."
        }
      </p>
      {!searched && (
        <Link
          href="/dashboard/aggregator/add-farmer"
          className="inline-flex items-center gap-2 bg-brand-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Register Your First Farmer
        </Link>
      )}
    </div>
  );
}

export default function AggregatorFarmers() {
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aggregator-farmers", page, search],
    queryFn:  () => fetchFarmers(page, search),
  });

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  return (
    <DashboardLayout title="Farmers">
      {selectedId && (
        <FarmerPanel farmerId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6">
        <form onSubmit={doSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, location or phone..."
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            {searchInput && (
              <button aria-label="close" type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
            Search
          </button>
        </form>
        <Link href="/dashboard/aggregator/add-farmer">
          <Button icon={<UserPlus className="w-4 h-4" />}>Register Farmer</Button>
        </Link>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-semibold text-sm">Could not load farmers</p>
            <p className="text-red-500 text-xs mt-0.5">Check your connection and try refreshing the page.</p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <Spinner text="Loading farmers..." />
      ) : !data?.data?.length ? (
        <Card padding={false}>
          <EmptyFarmers searched={!!search} />
        </Card>
      ) : (
        <Card padding={false}>
          {/* Count header */}
          <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold">
              {data.pagination.total} farmer{data.pagination.total !== 1 ? "s" : ""} registered
            </p>
            {search && (
              <button onClick={clearSearch} className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-50">
            {data.data.map((farmer: Farmer) => (
              <button
                key={farmer.id}
                onClick={() => setSelectedId(farmer.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                  <Wheat className="w-5 h-5 text-brand-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{farmer.user.name}</p>
                  <p className="text-slate-500 text-sm">{farmer.farmName} · {farmer.location}</p>
                  {(farmer.inventory as Inventory[])?.length > 0 ? (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(farmer.inventory as Inventory[]).slice(0, 3).map((inv, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                          {inv.cropType} {inv.quantity}kg
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-block text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full mt-1.5">
                      No stock yet — add inventory
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900 text-sm">{formatNaira(farmer.walletBalance)}</p>
                  <p className="text-xs text-slate-400">{(farmer.inventory as Inventory[])?.length || 0} stock items</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-slate-50">
            <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} onPage={setPage} />
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}



// "use client";
// import { useQuery } from "@tanstack/react-query";
// import { Wallet, TrendingUp, Package, Clock, Copy, CheckCircle, ExternalLink, Download, Share2, StarIcon, Lightbulb } from "lucide-react";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import api from "@/lib/api";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { Card, Spinner, Empty } from "@/components/ui";
// import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
// import type { Farmer, Transaction } from "@/types";

// const fetchDashboard = async (): Promise<Farmer> => {
//   const res = await api.get("/farmer/dashboard/me");
//   return res.data.data;
// };

// export default function FarmerDashboard() {
//   const [copied,    setCopied]    = useState(false);
//   const [showAI,    setShowAI]    = useState(false);
//   const [aiData,    setAiData]    = useState<any>(null);
//   const [aiLoading, setAiLoading] = useState(false);

//   async function loadAiAdvice() {
//     if (aiData) { setShowAI(true); return; }
//     setShowAI(true);
//     setAiLoading(true);
//     try {
//       const res = await api.get("/ai/farmer-advice");
//       setAiData(res.data.result);
//     } catch { setAiData({ greeting: "Hello!", encouragement: "Keep farming!", topAdvice: ["Keep your inventory updated", "Add quality notes to listings"], performance: "" }); }
//     finally { setAiLoading(false); }
//   }

//   const { data: farmer, isLoading } = useQuery({
//     queryKey: ["farmer-dashboard"],
//     queryFn:  fetchDashboard,
//   });

//   const copyAccount = () => {
//     if (!farmer?.virtualAccountNo) return;
//     navigator.clipboard.writeText(farmer.virtualAccountNo);
//     setCopied(true);
//     toast.success("Account number copied!");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (isLoading) return (
//     <DashboardLayout title="My Dashboard">
//       <Spinner text="Loading your dashboard..." />
//     </DashboardLayout>
//   );

//   if (!farmer) return null;

//   return (
//     <DashboardLayout title={`Welcome, ${farmer.user.name.split(" ")[0]}`}>

//       {/*WALLET CARDS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

//         <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
//           <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
//             <Wallet className="w-5 h-5" />
//           </div>
//           <p className="text-slate-500 text-xs font-medium mb-0.5">Wallet Balance</p>
//           <p className="font-bold text-2xl text-slate-900">{formatNaira(farmer.walletBalance)}</p>
//           <p className="text-slate-400 text-xs mt-1">After 1% platform fee</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
//           <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-3">
//             <TrendingUp className="w-5 h-5" />
//           </div>
//           <p className="text-slate-500 text-xs font-medium mb-0.5">Total Earned (Gross)</p>
//           <p className="font-bold text-2xl text-slate-900">{formatNaira(farmer.totalEarned)}</p>
//           <p className="text-slate-400 text-xs mt-1">Total buyers paid for your goods</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
//           <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
//             <Package className="w-5 h-5" />
//           </div>
//           <p className="text-slate-500 text-xs font-medium mb-0.5">Available Stock</p>
//           <p className="font-bold text-2xl text-slate-900">{(farmer.inventory?.filter((i: any) => i.status === "AVAILABLE")?.length) || 0}</p>
//           <p className="text-slate-400 text-xs mt-1">Items listed for sale</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
//           <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center mb-3">
//             <Clock className="w-5 h-5" />
//           </div>
//           <p className="text-slate-500 text-xs font-medium mb-0.5">Pending Payment</p>
//           <p className="font-bold text-2xl text-slate-900">{farmer.stats?.pendingCount ?? 0}</p>
//           <p className="text-slate-400 text-xs mt-1">Awaiting buyer payment</p>
//         </div>
//       </div>

//       {farmer.totalEarned > 0 && (
//         <div className="bg-gradient-to-r from-brand-900 to-emerald-800 rounded-2xl p-5 mb-6 text-white">
//           <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Earnings Breakdown</p>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className="text-white/60 text-xs mb-1">Buyers paid</p>
//               <p className="font-display text-xl font-bold">{formatNaira(farmer.totalEarned)}</p>
//             </div>
//             <div>
//               <p className="text-white/60 text-xs mb-1">Platform fee (1%)</p>
//               <p className="font-display text-xl font-bold text-red-300">-{formatNaira(farmer.totalEarned * 0.01)}</p>
//             </div>
//             <div>
//               <p className="text-white/60 text-xs mb-1">You received</p>
//               <p className="font-display text-xl font-bold text-gold-400">{formatNaira(farmer.walletBalance)}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

//         {/* Virtual Account Card */}
//         <div className="relative overflow-hidden bg-brand-900 rounded-2xl p-6 text-white">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
//           <div className="relative z-10">
//             <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">Virtual Payment Account</p>
//             <p className="text-white/60 text-xs mb-1">Account Number</p>
//             <div className="flex items-center gap-3 mb-4">
//               <span className="font-display text-2xl font-bold tracking-wider">
//                 {farmer.virtualAccountNo || "Setting up..."}
//               </span>
//               {farmer.virtualAccountNo && (
//                 <button onClick={copyAccount} className="text-white/60 hover:text-white transition-colors">
//                   {copied ? <CheckCircle className="w-4 h-4 text-gold-400" /> : <Copy className="w-4 h-4" />}
//                 </button>
//               )}
//             </div>
//             <div className="flex items-center justify-between border-t border-white/10 pt-3">
//               <div>
//                 <p className="text-white/50 text-xs">Bank</p>
//                 <p className="text-sm font-semibold mt-0.5">{farmer.bankName || "Access Bank"}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-white/50 text-xs">Balance</p>
//                 <p className="text-sm font-semibold mt-0.5 text-gold-400">{formatNaira(farmer.walletBalance)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Farm Info */}
//         <Card className="p-6">
//           <h3 className="font-semibold text-slate-900 mb-4">Farm Profile</h3>
//           <div className="space-y-3">
//             {[
//               ["Farm Name", farmer.farmName],
//               ["Location",  farmer.location],
//               ["Phone",     farmer.user.phone],
//             ].map(([l, v]) => (
//               <div key={l} className="flex justify-between text-sm">
//                 <span className="text-slate-500">{l}</span>
//                 <span className="font-medium font-mono text-xs">{v}</span>
//               </div>
//             ))}
//             {farmer.cropTypes?.length > 0 && (
//               <div>
//                 <p className="text-slate-500 text-sm mb-2">Crop Types</p>
//                 <div className="flex flex-wrap gap-1.5">
//                   {farmer.cropTypes.map((c, i) => (
//                     <span key={i} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full font-medium border border-brand-100">{c}</span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </Card>

//         {/* Inventory Summary */}
//         <Card className="p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-slate-900">My Stock</h3>
//             <a href="/dashboard/farmer/inventory" className="text-brand-600 text-xs font-medium hover:text-brand-800 flex items-center gap-1">
//               Manage <ExternalLink className="w-3 h-3" />
//             </a>
//           </div>
//           {!farmer.inventory?.length ? (
//             <Empty title="No stock listed" desc="Add your produce to get started" />
//           ) : (
//             <div className="space-y-2">
//               {farmer.inventory.slice(0, 5).map(inv => (
//                 <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
//                   <div>
//                     <p className="text-sm font-medium text-slate-800">{inv.cropType}</p>
//                     <p className="text-xs text-slate-400">{inv.quantity}kg</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold">{formatNaira(inv.pricePerKg)}/kg</p>
//                     <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(inv.status))}>{inv.status}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Card>
//       </div>


//       {/* AI Advice Panel */}
//       <div className="bg-gradient-to-r from-purple-900 to-indigo-800 rounded-2xl p-5 mb-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-white font-semibold mb-0.5"><StarIcon /> AI Farm Advisor</p>
//             <p className="text-white/60 text-sm">Get personalised tips for your farm based on your data</p>
//           </div>
//           <button onClick={loadAiAdvice}
//             className="bg-white text-purple-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors whitespace-nowrap flex-shrink-0">
//             {showAI ? "Hide" : "Get Advice"}
//           </button>
//         </div>

//         {showAI && (
//           <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/20">
//             {aiLoading ? (
//               <div className="flex items-center gap-2 text-white">
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 <span className="text-sm">AI is analysing your farm data...</span>
//               </div>
//             ) : aiData ? (
//               <div>
//                 <p className="text-white font-semibold mb-2">{aiData.greeting}</p>
//                 {aiData.performance && <p className="text-white/80 text-sm mb-3">{aiData.performance}</p>}
//                 {aiData.topAdvice?.length > 0 && (
//                   <ul className="space-y-1.5 mb-3">
//                     {aiData.topAdvice.map((tip: string, i: number) => (
//                       <li key={i} className="flex items-start gap-2 text-white/90 text-xs">
//                         <span className="text-green-400 flex-shrink-0">✓</span> {tip}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//                 {aiData.pricingTip && (
//                   <p className="text-yellow-300 text-xs italic"><Lightbulb /> {aiData.pricingTip}</p>
//                 )}
//                 <p className="text-white/70 text-xs mt-2">{aiData.encouragement}</p>
//               </div>
//             ) : null}
//           </div>
//         )}
//       </div>

//       <Card>
//         <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
//           <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
//           <a href="/dashboard/farmer/transactions" className="text-brand-600 text-xs font-medium hover:text-brand-800">View all →</a>
//         </div>

//         <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 grid grid-cols-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
//           <span className="col-span-2">Produce / Buyer</span>
//           <span>Buyer Paid</span>
//           <span className="text-right">You Received</span>
//         </div>

//         <div className="divide-y divide-slate-50">
//           {!farmer.recentTransactions?.length ? (
//             <Empty title="No transactions yet" desc="Transactions appear once buyers make payments" />
//           ) : (
//             farmer.recentTransactions.slice(0, 8).map((txn: Transaction) => (
//               <div key={txn.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
//                 <div className="grid grid-cols-4 items-center gap-2">
//                   <div className="col-span-2">
//                     <p className="text-sm font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
//                     <p className="text-xs text-slate-400">
//                       {txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer"} · {formatDate(txn.createdAt)}
//                     </p>
//                     <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold inline-block mt-1", statusColor(txn.status))}>
//                       {txn.status}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">{formatNaira(txn.totalAmount)}</p>
//                     <p className="text-xs text-slate-400">gross</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-bold text-emerald-700">{formatNaira(txn.farmerReceives)}</p>
//                     <p className="text-xs text-slate-400">after fee</p>
//                     {txn.receipt && (
//                       <div className="flex justify-end gap-1 mt-1">
//                         <button onClick={() => printReceipt(txn.receipt!)}
//                           className="w-6 h-6 rounded bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors" title="Download PDF">
//                           <Download className="w-3 h-3" />
//                         </button>
//                         <a href={`https://wa.me/?text=${encodeURIComponent(`RECEIPT: ${txn.cropType} ${txn.quantity}kg = ₦${txn.totalAmount.toLocaleString()} | Ref: ${txn.txnRef}`)}`}
//                           target="_blank" rel="noreferrer"
//                           className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Share WhatsApp">
//                           <Share2 className="w-3 h-3" />
//                         </a>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </Card>
//     </DashboardLayout>
//   );
// }