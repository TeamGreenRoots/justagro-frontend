"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Leaf, ShoppingCart, ArrowBigRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import type { User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function fetchProduce(cropType: string, page: number) {
  const q = cropType ? `&cropType=${encodeURIComponent(cropType)}` : "";
  return axios.get(`${BASE}/api/v1/inventory/browse?page=${page}&limit=12${q}`).then(r => r.data);
}

export default function BrowsePage() {
  const [cropFilter, setCropFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [user,       setUser]       = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["browse-produce", cropFilter, page],
    queryFn:  () => fetchProduce(cropFilter, page),
  });

  const produce   = data?.data      || [];
  const cropTypes = data?.cropTypes || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Nav */}
      <nav className="bg-[#f8f8f8] border-b border-slate-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div  className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center"></div> */}
            <img src="/logos/justagro-logo.png" alt="JustAgro Logo" className=" h-12 object-contain" />
            {/* <span className="font-display font-semibold text-brand-900">JustAgro</span> */}
            <span className="hidden sm:inline text-slate-400 text-sm ml-1">/ Browse Produce</span>
          </div>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">
                Sign In
              </Link>
              <Link href="/register?role=BUYER"
                className="bg-brand-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
                Register as Buyer
              </Link>
            </div>
          ) : (
            <Link href={user.role === "BUYER" ? "/dashboard/buyer" : user.role === "FARMER" ? "/dashboard/farmer" : "/dashboard/aggregator"}
              className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors flex items-center gap-1">
              ← Back to Dashboard
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Available Produce</h1>
        <p className="text-slate-500 text-sm mb-6">
          Fresh produce from verified Nigerian farmers. Contact your aggregator to complete a purchase.
        </p>

        {/* Crop type filter */}
        {cropTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button onClick={() => { setCropFilter(""); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                !cropFilter ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
              }`}>
              All ({data?.pagination?.total || 0})
            </button>
            {cropTypes.map((ct: string) => (
              <button key={ct} onClick={() => { setCropFilter(ct); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  cropFilter === ct ? "bg-brand-900 text-white border-brand-900" : "bg-white border-slate-200 text-slate-600 hover:border-brand-300"
                }`}>
                {ct}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : produce.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
            <div className="text-5xl mb-4">logo</div>
            <p className="font-semibold text-slate-700 mb-1">No produce listed yet</p>
            <p className="text-slate-400 text-sm">Farmers are adding stock. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produce.map((inv: any) => (
              <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-lg transition-all p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-2xl"> <img src="/logos/justagro.jpeg" alt="JustAgro Logo" className="w-full h-full object-contain" /> </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    AVAILABLE
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-0.5">{inv.cropType}</h3>
                <p className="text-slate-500 text-sm mb-0.5">{inv.farmer?.user?.name}</p>
                <p className="text-slate-400 text-xs mb-3">{inv.farmer?.location}</p>
                {inv.notes && (
                  <p className="text-slate-400 text-xs italic mb-3 truncate">"{inv.notes}"</p>
                )}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs mb-0.5">Available</p>
                    <p className="font-bold text-slate-800">{inv.quantity}kg</p>
                  </div>
                  <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
                    <p className="text-brand-500 text-xs mb-0.5">Price/kg</p>
                    <p className="font-bold text-brand-800">{formatNaira(inv.pricePerKg)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs">Total Value</p>
                    <p className="font-bold text-slate-900 text-sm">{formatNaira(inv.totalValue)}</p>
                  </div>
                  {user ? (
                    <Link href={user.role === "BUYER" ? "/dashboard/buyer" : "/dashboard/aggregator/transactions"}
                      className="flex items-center gap-1.5 text-xs font-bold bg-brand-900 text-white px-3 py-2 rounded-xl hover:bg-brand-800 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {user.role === "BUYER" ? "Order" : "Create Txn"}
                    </Link>
                  ) : (
                    <Link href="/register?role=BUYER"
                      className="flex items-center gap-1.5 text-xs font-bold bg-brand-900 text-white px-3 py-2 rounded-xl hover:bg-brand-800 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" /> Buy
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        
        {data?.pagination?.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-slate-600">{page} / {data.pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pagination.pages, p+1))} disabled={page >= data.pagination.pages}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors">
              Next <ArrowBigRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
