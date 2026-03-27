"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Wheat, ShoppingCart, MapPin, Package,
  ArrowRight, Leaf, LayoutDashboard, Filter, X,
  Copy, CheckCircle, MessageCircle, Phone, Send
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatNaira } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import type { User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function fetchProduce(cropType: string, page: number) {
  const q = cropType ? `&cropType=${encodeURIComponent(cropType)}` : "";
  return axios.get(`${BASE}/api/v1/inventory/browse?page=${page}&limit=12${q}`).then(r => r.data);
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
        <div className="w-20 h-6 bg-slate-100 rounded-full" />
      </div>
      <div className="w-2/3 h-5 bg-slate-100 rounded mb-2" />
      <div className="w-1/2 h-4 bg-slate-100 rounded mb-4" />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-10 bg-slate-100 rounded-xl" />
    </div>
  );
}

//Request Produce Modal 
function RequestModal({ inv, user, onClose }: { inv: any; user: User | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const produceDetails = [
    `Crop: ${inv.cropType}`,
    `Quantity: ${inv.quantity}kg`,
    `Price: ${formatNaira(inv.pricePerKg)}/kg`,
    `Total: ${formatNaira(inv.totalValue)}`,
    `Farmer: ${inv.farmer?.user?.name || ""}`,
    `Location: ${inv.farmer?.location || ""}`,
    `Ref: ${inv.id}`,
  ].join("\n");

  const waMessage = encodeURIComponent(
    `Hi, I found this produce on JustAgro and I'd like to buy it.\n\n${produceDetails}\n\nPlease create a transaction and send me the payment link. Thank you.`
  );

  function copyDetails() {
    navigator.clipboard.writeText(produceDetails);
    setCopied(true);
    toast.success("Produce details copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-brand-900 px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Request to Buy</p>
            <h3 className="text-white font-bold text-xl">{inv.cropType}</h3>
            <p className="text-white/60 text-sm">{inv.farmer?.user?.name} · {inv.farmer?.location}</p>
          </div>
          <button aria-label="close" onClick={onClose} className="text-white/60 hover:text-white mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Produce summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-slate-400 text-xs mb-1">Quantity</p>
              <p className="font-bold text-slate-800">{inv.quantity}kg</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
              <p className="text-brand-500 text-xs mb-1">Price/kg</p>
              <p className="font-bold text-brand-800">{formatNaira(inv.pricePerKg)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-emerald-600 text-xs mb-1">Total</p>
              <p className="font-bold text-emerald-800">{formatNaira(inv.totalValue)}</p>
            </div>
          </div>

          {/* How to order explanation */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-amber-800 text-xs font-bold uppercase tracking-wide mb-2">How to order</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              To buy this produce, an aggregator needs to create a transaction and send you a
              payment link via WhatsApp or SMS. Share the details below with your aggregator or
              use the WhatsApp button to reach them directly.
            </p>
          </div>

          {/* Copy details */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Produce Reference</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {produceDetails}
            </div>
            <button
              onClick={copyDetails}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2 ${
                copied
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Produce Details</>}
            </button>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#1fba59] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Send Request via WhatsApp
          </a>

          {!user && (
            <div className="text-center pt-1">
              <p className="text-slate-400 text-xs mb-2">Already registered? Sign in to track your orders.</p>
              <div className="flex gap-2 justify-center">
                <Link href="/login" onClick={onClose}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-4 py-2 rounded-lg border border-brand-100 transition-colors">
                  Sign In
                </Link>
                <Link href="/register?role=BUYER" onClick={onClose}
                  className="text-xs font-semibold text-white bg-brand-900 px-4 py-2 rounded-lg hover:bg-brand-800 transition-colors">
                  Register as Buyer
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [cropFilter,   setCropFilter]   = useState("");
  const [page,         setPage]         = useState(1);
  const [user,         setUser]         = useState<User | null>(null);
  const [selectedInv,  setSelectedInv]  = useState<any>(null);

  useEffect(() => { setUser(getUser()); }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["browse-produce", cropFilter, page],
    queryFn:  () => fetchProduce(cropFilter, page),
  });

  const produce   = data?.data      || [];
  const cropTypes = data?.cropTypes || [];
  const total     = data?.pagination?.total || 0;

  function clearFilter() { setCropFilter(""); setPage(1); }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {selectedInv && (
        <RequestModal inv={selectedInv} user={user} onClose={() => setSelectedInv(null)} />
      )}

      {/* Nav */}
      <nav className="bg-[#f8f8f8] border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
        
             <img src="/logos/justagro-logo.png" alt="JustAgro Logo" className=" h-12 object-contain" />
    
            <span className="hidden sm:inline text-slate-300 text-sm ml-1">/</span>
            <span className="hidden sm:inline text-slate-500 text-sm">Browse Produce</span>
          </Link>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors hidden sm:inline">
                  Sign In
                </Link>
                <Link href="/register?role=BUYER"
                  className="bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Register as Buyer
                </Link>
              </>
            ) : (
              <Link
                href={
                  user.role === "BUYER" ? "/dashboard/buyer"
                  : user.role === "FARMER" ? "/dashboard/farmer"
                  : "/dashboard/aggregator"
                }
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors bg-brand-50 px-4 py-2 rounded-xl border border-brand-100"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                My Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Available Produce</h1>
              <p className="text-slate-500 text-sm">
                Fresh stock from verified Nigerian farmers.
                {total > 0 && <span className="font-semibold text-slate-700"> {total} item{total !== 1 ? "s" : ""} available.</span>}
              </p>
            </div>
            {!user && (
              <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-3 flex items-center gap-3 flex-shrink-0">
                <ShoppingCart className="w-4 h-4 text-brand-600" />
                <div>
                  <p className="text-brand-800 text-xs font-bold">Want to buy?</p>
                  <p className="text-brand-600 text-xs">
                    Click any produce to get contact details and request an order.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crop filter pills */}
        {cropTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6 items-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </div>
            <button onClick={clearFilter}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                !cropFilter ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
              }`}>
              All {total > 0 && `(${total})`}
            </button>
            {cropTypes.map((ct: string) => (
              <button key={ct} onClick={() => { setCropFilter(ct); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  cropFilter === ct ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
                }`}>
                {ct}
              </button>
            ))}
            {cropFilter && (
              <button onClick={clearFilter} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors px-2">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 mb-1">Could not load produce</p>
            <p className="text-slate-400 text-sm">Check your connection and refresh the page.</p>
          </div>
        )}

        {/* Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && produce.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 text-center px-6">
            <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
              <Wheat className="w-10 h-10 text-brand-200" />
            </div>
            <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">
              {cropFilter ? `No ${cropFilter} listed right now` : "No produce available yet"}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
              {cropFilter ? "Try a different crop type." : "Farmers are adding stock. Check back soon."}
            </p>
            {cropFilter && (
              <button onClick={clearFilter}
                className="inline-flex items-center gap-2 bg-brand-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
                View All Produce
              </button>
            )}
          </div>
        )}

        {/* Produce grid */}
        {!isLoading && !isError && produce.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produce.map((inv: any) => (
              <div key={inv.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
                onClick={() => setSelectedInv(inv)}
              >
                <div className="p-5 pb-0 flex items-start justify-between">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-100 group-hover:bg-brand-100 transition-colors">
                    <img src="/logos/justagro.jpeg" alt="JustAgro Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    AVAILABLE
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg mb-0.5">{inv.cropType}</h3>
                  <p className="text-slate-600 text-sm font-medium mb-0.5">{inv.farmer?.user?.name}</p>
                  {inv.farmer?.location && (
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <p className="text-slate-400 text-xs">{inv.farmer.location}</p>
                    </div>
                  )}
                  {inv.notes && (
                    <p className="text-slate-400 text-xs italic mb-3 line-clamp-2">"{inv.notes}"</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-slate-400 text-xs mb-0.5">Available</p>
                      <p className="font-bold text-slate-800 text-sm">{inv.quantity}kg</p>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
                      <p className="text-brand-500 text-xs mb-0.5">Price/kg</p>
                      <p className="font-bold text-brand-800 text-sm">{formatNaira(inv.pricePerKg)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-slate-400 text-xs">Total Value</p>
                      <p className="font-bold text-slate-900 text-sm">{formatNaira(inv.totalValue)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-brand-900 text-white px-4 py-2.5 rounded-xl group-hover:bg-brand-800 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Request
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-slate-500 font-medium">Page {page} of {data.pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page >= data.pagination.pages}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
              Next →
            </button>
          </div>
        )}

        <p className="text-center text-slate-400 text-xs mt-10">
          Prices and availability updated in real time · Secured by Interswitch
        </p>
      </div>
    </div>
  );
}




// "use client";
// import { useQuery } from "@tanstack/react-query";
// import { useState, useEffect } from "react";
// import { Leaf, ShoppingCart, ArrowBigRight } from "lucide-react";
// import axios from "axios";
// import Link from "next/link";
// import { formatNaira } from "@/lib/utils";
// import { getUser } from "@/lib/auth";
// import type { User } from "@/types";

// const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// function fetchProduce(cropType: string, page: number) {
//   const q = cropType ? `&cropType=${encodeURIComponent(cropType)}` : "";
//   return axios.get(`${BASE}/api/v1/inventory/browse?page=${page}&limit=12${q}`).then(r => r.data);
// }

// export default function BrowsePage() {
//   const [cropFilter, setCropFilter] = useState("");
//   const [page,       setPage]       = useState(1);
//   const [user,       setUser]       = useState<User | null>(null);

//   useEffect(() => {
//     setUser(getUser());
//   }, []);

//   const { data, isLoading } = useQuery({
//     queryKey: ["browse-produce", cropFilter, page],
//     queryFn:  () => fetchProduce(cropFilter, page),
//   });

//   const produce   = data?.data      || [];
//   const cropTypes = data?.cropTypes || [];

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans">
//       {/* Nav */}
//       <nav className="bg-[#f8f8f8] border-b border-slate-100 px-6 py-4 sticky top-0 z-40">
//         <div className="max-w-5xl mx-auto flex items-center justify-between">
//           <div  className="flex items-center gap-2">
//             {/* <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center"></div> */}
//             <img src="/logos/justagro-logo.png" alt="JustAgro Logo" className=" h-12 object-contain" />
//             {/* <span className="font-display font-semibold text-brand-900">JustAgro</span> */}
//             <span className="hidden sm:inline text-slate-400 text-sm ml-1">/ Browse Produce</span>
//           </div>

//           {!user ? (
//             <div className="flex items-center gap-3">
//               <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">
//                 Sign In
//               </Link>
//               <Link href="/register?role=BUYER"
//                 className="bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
//                 Register as Buyer
//               </Link>
//             </div>
//           ) : (
//             <Link href={user.role === "BUYER" ? "/dashboard/buyer" : user.role === "FARMER" ? "/dashboard/farmer" : "/dashboard/aggregator"}
//               className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors flex items-center gap-1">
//               ← Back to Dashboard
//             </Link>
//           )}
//         </div>
//       </nav>

//       <div className="max-w-5xl mx-auto px-6 py-8">
//         <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Available Produce</h1>
//         <p className="text-slate-500 text-sm mb-6">
//           Fresh produce from verified Nigerian farmers. Contact your aggregator to complete a purchase.
//         </p>

//         {/* Crop type filter */}
//         {cropTypes.length > 0 && (
//           <div className="flex gap-2 flex-wrap mb-6">
//             <button onClick={() => { setCropFilter(""); setPage(1); }}
//               className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
//                 !cropFilter ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
//               }`}>
//               All ({data?.pagination?.total || 0})
//             </button>
//             {cropTypes.map((ct: string) => (
//               <button key={ct} onClick={() => { setCropFilter(ct); setPage(1); }}
//                 className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
//                   cropFilter === ct ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
//                 }`}>
//                 {ct}
//               </button>
//             ))}
//           </div>
//         )}

//         {isLoading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-48" />
//             ))}
//           </div>
//         ) : produce.length === 0 ? (
//           <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
//             <div className="text-5xl mb-4">logo</div>
//             <p className="font-semibold text-slate-700 mb-1">No produce listed yet</p>
//             <p className="text-slate-400 text-sm">Farmers are adding stock. Check back soon!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {produce.map((inv: any) => (
//               <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-lg transition-all p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="w-8 h-8 rounded-xl flex items-center justify-center text-2xl"> <img src="/logos/justagro.jpeg" alt="JustAgro Logo" className="w-full h-full object-contain" /> </div>
//                   <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
//                     AVAILABLE
//                   </span>
//                 </div>
//                 <h3 className="font-bold text-slate-900 text-lg mb-0.5">{inv.cropType}</h3>
//                 <p className="text-slate-500 text-sm mb-0.5">{inv.farmer?.user?.name}</p>
//                 <p className="text-slate-400 text-xs mb-3">{inv.farmer?.location}</p>
//                 {inv.notes && (
//                   <p className="text-slate-400 text-xs italic mb-3 truncate">"{inv.notes}"</p>
//                 )}
//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   <div className="bg-slate-50 rounded-xl p-3 text-center">
//                     <p className="text-slate-400 text-xs mb-0.5">Available</p>
//                     <p className="font-bold text-slate-800">{inv.quantity}kg</p>
//                   </div>
//                   <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
//                     <p className="text-brand-500 text-xs mb-0.5">Price/kg</p>
//                     <p className="font-bold text-brand-800">{formatNaira(inv.pricePerKg)}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between pt-3 border-t border-slate-100">
//                   <div>
//                     <p className="text-slate-400 text-xs">Total Value</p>
//                     <p className="font-bold text-slate-900 text-sm">{formatNaira(inv.totalValue)}</p>
//                   </div>
//                   {user ? (
//                     <Link href={user.role === "BUYER" ? "/dashboard/buyer" : "/dashboard/aggregator/transactions"}
//                       className="flex items-center gap-1.5 text-xs font-bold bg-brand-900 text-white px-3 py-2 rounded-xl hover:bg-brand-800 transition-colors">
//                       <ShoppingCart className="w-3.5 h-3.5" />
//                       {user.role === "BUYER" ? "Order" : "Create Txn"}
//                     </Link>
//                   ) : (
//                     <Link href="/register?role=BUYER"
//                       className="flex items-center gap-1.5 text-xs font-bold bg-brand-900 text-white px-3 py-2 rounded-xl hover:bg-brand-800 transition-colors">
//                       <ShoppingCart className="w-3.5 h-3.5" /> Buy
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

        
//         {data?.pagination?.pages > 1 && (
//           <div className="flex items-center justify-center gap-3 mt-8">
//             <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
//               className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
//               ← Prev
//             </button>
//             <span className="text-sm text-slate-600">{page} / {data.pagination.pages}</span>
//             <button onClick={() => setPage(p => Math.min(data.pagination.pages, p+1))} disabled={page >= data.pagination.pages}
//               className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
//               Next <ArrowBigRight className="w-3.5 h-3.5" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
