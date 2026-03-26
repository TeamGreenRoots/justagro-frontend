"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty, Pagination } from "@/components/ui";
import { formatNaira, statusColor, cn } from "@/lib/utils";
import type { Inventory } from "@/types";

const fetchInv = (page: number, status: string, search: string) => {
  let q = `?page=${page}&limit=15`;
  if (status !== "ALL") q += `&status=${status}`;
  return api.get(`/inventory${q}`).then(r => r.data);
};

const TABS = ["ALL","AVAILABLE","RESERVED","SOLD"];

export default function AggregatorInventory() {
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["agg-inventory", page, status],
    queryFn:  () => fetchInv(page, status, ""),
  });

  return (
    <DashboardLayout title="All Inventory">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => { setStatus(t); setPage(1); }}
            className={cn("px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              status === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner text="Loading inventory..." /> : (
        <Card>
          {!data?.data?.length ? (
            <Empty title="No inventory found" />
          ) : (
            <>
              <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50 rounded-t-2xl text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="col-span-2">Produce / Farmer</span>
                <span>Quantity</span>
                <span>Price/kg</span>
                <span>Total Value</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-50">
                {data.data.map((inv: Inventory) => (
                  <div key={inv.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-2">
                      <p className="font-semibold text-slate-900">{inv.cropType}</p>
                      <p className="text-slate-500 text-xs">{inv.farmer?.user?.name} · {inv.farmer?.location}</p>
                      {inv.notes && <p className="text-slate-400 text-xs truncate">{inv.notes}</p>}
                    </div>
                    <p className="font-medium text-slate-800">{inv.quantity}kg</p>
                    <p className="font-medium text-slate-800">{formatNaira(inv.pricePerKg)}</p>
                    <p className="font-semibold text-slate-900">{formatNaira(inv.totalValue)}</p>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold w-fit", statusColor(inv.status))}>
                      {inv.status}
                    </span>
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
