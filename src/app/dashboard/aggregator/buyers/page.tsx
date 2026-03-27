"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Loader2, X, Search, BadgeCheck, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty, Pagination, Button } from "@/components/ui";
import { formatDate, cn } from "@/lib/utils";

const fetchContacts = (page: number, search: string) =>
  api.get(`/buyer-contacts?page=${page}&limit=10${search ? `&search=${search}` : ""}`).then(r => r.data);

const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

function AddBuyerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [email,   setEmail]   = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function save() {
    setError("");
    if (!name.trim())  { setError("Name is required");  return; }
    if (!phone.trim()) { setError("Phone is required"); return; }
    setLoading(true);
    try {
      await api.post("/buyer-contacts", {
        name: name.trim(), phone: phone.trim(),
        email: email.trim() || undefined,
        companyName: company.trim() || undefined,
      });
      toast.success("Buyer contact saved!");
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-card-lg animate-fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Add Buyer Contact</h3>
          <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Abubakar Grains Store" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="buyer@email.com" className={ic} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Company (optional)</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Abubakar & Sons Ltd" className={ic} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">Cancel</button>
            <button onClick={save} disabled={loading}
              className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AggregatorBuyers() {
  const qc = useQueryClient();
  const [page,       setPage]      = useState(1);
  const [search,     setSearch]    = useState("");
  const [searchInput,setInput]     = useState("");
  const [showAdd,    setShowAdd]   = useState(false);
  const [deleting,   setDeleting]  = useState<string|null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-contacts", page, search],
    queryFn:  () => fetchContacts(page, search),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["buyer-contacts"] });

  async function del(id: string) {
    // confirmed via UI
    setDeleting(id);
    try {
      await api.delete(`/buyer-contacts/${id}`);
      toast.success("Removed");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setDeleting(null); }
  }

  return (
    <DashboardLayout title="Buyer Contacts">
      {showAdd && <AddBuyerModal onClose={() => setShowAdd(false)} onSaved={refresh} />}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
        <p className="text-blue-700 text-sm font-semibold mb-0.5">Platform Buyers + Manual Contacts</p>
        <p className="text-blue-600 text-xs">This list shows buyers who registered on JustAgro (marked with ✓) AND contacts you added manually.</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchInput} onChange={e => setInput(e.target.value)}
              placeholder="Search buyers..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
          </div>
          <button type="submit" className="bg-brand-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">Search</button>
        </form>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Buyer</Button>
      </div>

      {isLoading ? <Spinner text="Loading buyers..." /> : (
        <Card>
          {!data?.data?.length ? (
            <Empty title="No buyers yet" desc="Add buyer contacts or buyers will appear when they register" />
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {data.data.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
                      c.source === "PLATFORM" ? "bg-blue-100" : "bg-slate-100")}>
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        {c.source === "PLATFORM" && (
                          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            <BadgeCheck className="w-3 h-3" /> Platform
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm font-mono">{c.phone}</p>
                      {c.companyName && <p className="text-slate-400 text-xs">{c.companyName}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-400 text-xs">{formatDate(c.createdAt)}</p>
                      {c.source === "CONTACT" && (
                        <button onClick={() => del(c.id)} disabled={deleting === c.id}
                          className="mt-1 text-red-400 hover:text-red-600 transition-colors">
                          {deleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
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
