"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Loader2, X, Copy, CheckCircle, ExternalLink, Download, Share2, Sparkles, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty, Pagination, Button } from "@/components/ui";
import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
import type { Transaction, Farmer, BuyerContact, Inventory } from "@/types";

const fetchTxns = (page: number, status: string) => {
  const q = status !== "ALL" ? `&status=${status}` : "";
  return api.get(`/transactions?page=${page}&limit=10${q}`).then(r => r.data);
};
const fetchFarmers      = () => api.get("/farmers?limit=100").then(r => r.data.data);
const fetchContacts     = () => api.get("/buyer-contacts?limit=100").then(r => r.data.data);
const fetchFarmerInv    = (id: string) => api.get(`/inventory?farmerId=${id}&status=AVAILABLE&limit=100`).then(r => r.data.data);

const TABS = ["ALL","PENDING","PAID","ASSISTED","CANCELLED"];
const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

// Create Transaction Modal 
function CreateTxnModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState<1|2|3|4>(1);
  // Step 1: farmer + inventory
  const [farmerId,    setFarmerId]    = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [cropType,    setCropType]    = useState("");
  const [quantity,    setQuantity]    = useState("");
  const [pricePerKg,  setPricePerKg]  = useState("");
  // Step 2: buyer
  const [buyerMode,   setBuyerMode]   = useState<"existing"|"new">("existing");
  const [contactId,   setContactId]   = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [newName,     setNewName]     = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [newEmail,    setNewEmail]    = useState("");
  const [notes,       setNotes]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  // Step 4: success data
  const [createdTxn,  setCreatedTxn]  = useState<any>(null);
  const [linkCopied,  setLinkCopied]  = useState(false);

  const { data: farmers }  = useQuery({ queryKey: ["all-farmers"],  queryFn: fetchFarmers });
  const { data: contacts } = useQuery({ queryKey: ["all-contacts"], queryFn: fetchContacts });
  const { data: inventory } = useQuery({
    queryKey: ["farmer-inv", farmerId],
    queryFn:  () => fetchFarmerInv(farmerId),
    enabled:  !!farmerId,
  });

  function selectInventory(inv: Inventory) {
    setInventoryId(inv.id);
    setCropType(inv.cropType);
    setQuantity(inv.quantity.toString());
    setPricePerKg(inv.pricePerKg.toString());
  }

  function step1Valid() {
    return farmerId && cropType && parseFloat(quantity) > 0 && parseFloat(pricePerKg) > 0;
  }

  function step2Valid() {
    if (buyerMode === "existing") return !!contactId;
    return !!(newName.trim() && newPhone.trim());
  }

  async function create() {
    setError(""); setLoading(true);
    try {
      let buyerContactId: string | undefined = undefined;
      let buyerId:        string | undefined = undefined;

      if (buyerMode === "new") {
        // Create new contact then use it
        const r   = await api.post("/buyer-contacts", { name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim() || undefined });
        buyerContactId = r.data.data.id;
      } else {
        // Existing selection — check if platform buyer or contact
        if (selectedBuyer?.source === "PLATFORM") {
          buyerId        = selectedBuyer.id;       // platform Buyer record
        } else {
          buyerContactId = contactId;               // BuyerContact record
        }
      }

      const res = await api.post("/transactions", {
        farmerId, inventoryId: inventoryId || undefined,
        cropType, quantity: parseFloat(quantity), pricePerKg: parseFloat(pricePerKg),
        buyerContactId,
        buyerId,
        notes: notes.trim() || undefined,
      });
      setCreatedTxn(res.data.data || res.data);
      onSaved();
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create transaction");
    } finally { setLoading(false); }
  }

  const total = (parseFloat(quantity)||0) * (parseFloat(pricePerKg)||0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-card-lg animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">New Transaction</h3>
            <p className="text-slate-500 text-xs mt-0.5">{step < 4 ? `Step ${step} of 3` : "Done"}</p>
          </div>
          <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        <div className="flex px-6 pt-4 gap-2">
          {[1,2,3,4].map(s => (
            <div key={s} className={cn("flex-1 h-1.5 rounded-full transition-colors", s <= step ? "bg-brand-900" : "bg-slate-200")} />
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>}

          {/* STEP 1 — Farmer + Produce */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Farmer *</label>
                <select aria-label="farmer" value={farmerId} onChange={e => { setFarmerId(e.target.value); setInventoryId(""); }} className={ic}>
                  <option value="">— Choose farmer —</option>
                  {farmers?.map((f: Farmer) => (
                    <option key={f.id} value={f.id}>{f.user.name} — {f.farmName}</option>
                  ))}
                </select>
              </div>

              {/* Available inventory */}
              {farmerId && inventory?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Available Stock (click to select)</p>
                  <div className="space-y-2">
                    {inventory.map((inv: Inventory) => (
                      <button key={inv.id} type="button" onClick={() => selectInventory(inv)}
                        className={cn("w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
                          inventoryId === inv.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                        )}>
                        <span className={`font-semibold text-sm ${inventoryId === inv.id ? "text-brand-700" : "text-slate-800"}`}>
                          {inv.cropType}
                        </span>
                        <span className="text-slate-500 text-sm">{inv.quantity}kg · {formatNaira(inv.pricePerKg)}/kg</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs mt-2">Or enter custom quantity below</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Type *</label>
                <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} placeholder="e.g. Maize" className={ic} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity (kg) *</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="200" min="0" className={ic} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Price/kg (₦) *</label>
                  <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} placeholder="180" min="0" className={ic} />
                </div>
              </div>
              {total > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
                  <p className="text-brand-600 text-xs font-semibold">TRANSACTION TOTAL</p>
                  <p className="font-display text-2xl font-bold text-brand-700 mt-1">{formatNaira(total)}</p>
                  <p className="text-brand-500 text-xs mt-1">Platform fee (1%): {formatNaira(total * 0.01)} · Farmer receives: {formatNaira(total * 0.99)}</p>
                </div>
              )}
              <button onClick={() => step1Valid() ? setStep(2) : setError("Fill all required fields")}
                className="w-full bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm">
                Next: Select Buyer →
              </button>
            </>
          )}

          {/* STEP 2 — Buyer */}
          {step === 2 && (
            <>
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-2">
                {["existing","new"].map(m => (
                  <button key={m} type="button" onClick={() => setBuyerMode(m as any)}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
                      buyerMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    )}>
                    {m === "existing" ? "Saved Contact" : "New Buyer"}
                  </button>
                ))}
              </div>

              {buyerMode === "existing" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Buyer Contact *</label>
                  <select aria-label="buyer" value={contactId} onChange={e => {
                    setContactId(e.target.value);
                    const found = contacts?.find((c: any) => c.id === e.target.value);
                    setSelectedBuyer(found || null);
                  }} className={ic}>
                    <option value="">— Choose buyer —</option>
                    {contacts?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.source === "PLATFORM" ? "✓ " : ""}{c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                  {selectedBuyer?.source === "PLATFORM" && (
                    <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                      ✓ Platform user — has a JustAgro account
                    </p>
                  )}
                  {contacts?.length === 0 && (
                    <p className="text-amber-600 text-xs mt-2">No saved contacts. Switch to "New Buyer" to add one.</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Buyer Name *</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Abubakar Grains Store" className={ic} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                    <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="08012345678" className={ic} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (optional)</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="buyer@email.com" className={ic} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional information..." className={ic} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">
                  ← Back
                </button>
                <button onClick={() => step2Valid() ? setStep(3) : setError("Select or fill buyer details")}
                  className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm">
                  Next: Confirm →
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <>
              <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
                <p className="font-semibold text-slate-900 mb-3">Transaction Summary</p>
                {[
                  ["Farmer",   farmers?.find((f: Farmer) => f.id === farmerId)?.user?.name || "-"],
                  ["Produce",  `${cropType} (${quantity}kg)`],
                  ["Price/kg", formatNaira(parseFloat(pricePerKg))],
                  ["Total",    formatNaira(total)],
                  ["Farmer gets", formatNaira(total * 0.99)],
                  ["Platform fee", formatNaira(total * 0.01)],
                  ["Buyer", buyerMode === "existing"
                    ? selectedBuyer?.name || contacts?.find((c: any) => c.id === contactId)?.name || "-"
                    : newName],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs text-center">
                A payment link will be sent to the buyer via WhatsApp & SMS
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">← Back</button>
                <button onClick={create} disabled={loading}
                  className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create & Notify Buyer ✓"}
                </button>
              </div>
            </>
          )}

          {/* STEP 4 — Success + Payment Link */}
          {step === 4 && createdTxn && (() => {
            const payLink = createdTxn.paymentLink || `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${createdTxn.txnRef}`;
            const buyerName = createdTxn.buyerContact?.name || createdTxn.buyer?.user?.name || "Buyer";
            const buyerPhone = createdTxn.buyerContact?.phone || createdTxn.buyer?.user?.phone || "";
            const waMsg = encodeURIComponent(
              `Hi ${buyerName}, your payment for ${createdTxn.cropType} (${createdTxn.quantity}kg) from JustAgro is ready.\n\nAmount: ₦${Number(createdTxn.totalAmount).toLocaleString()}\n\nPay here: ${payLink}`
            );
            return (
              <>
                {/* Green success header */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-800 text-base">Transaction Created!</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    {buyerName} has been notified via WhatsApp & SMS
                  </p>
                  <div className="mt-3 bg-white rounded-xl border border-emerald-100 p-3">
                    <p className="text-xs text-slate-500 mb-0.5">Amount</p>
                    <p className="font-display font-bold text-xl text-brand-900">{formatNaira(createdTxn.totalAmount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ref: {createdTxn.txnRef}</p>
                  </div>
                </div>

                {/* Payment link */}
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Payment Link</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="flex-1 font-mono text-xs text-slate-600 truncate">{payLink}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(payLink);
                        setLinkCopied(true);
                        toast.success("Link copied!");
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        linkCopied ? "bg-emerald-100 text-emerald-700" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                      }`}
                    >
                      {linkCopied ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* Share via WhatsApp */}
                <a
                  href={`https://wa.me/${buyerPhone.replace(/^0/, "234")}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#1fba59] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share via WhatsApp{buyerName ? ` to ${buyerName}` : ""}
                </a>

                {/* What happens next */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide">What happens next</p>
                  <div className="space-y-1.5">
                    {[
                      "Buyer receives payment link via WhatsApp and SMS",
                      "Buyer pays via Interswitch — card, transfer or USSD",
                      "You are notified when payment is confirmed",
                      "Farmer wallet is credited automatically (99%)",
                    ].map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <p className="text-blue-700 text-xs leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 text-sm transition-colors"
                >
                  Done — Close
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function AggregatorTransactions() {
  const qc = useQueryClient();
  const [page,       setPage]       = useState(1);
  const [status,     setStatus]     = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [assisting,    setAssisting]    = useState<string|null>(null);
  const [copiedLink,   setCopiedLink]   = useState<string|null>(null);
  const [confirmCancel,setConfirmCancel]= useState<string|null>(null);
  const [confirmAssist,setConfirmAssist]= useState<string|null>(null);


  const [aiResults,  setAiResults]  = useState<Record<string, any>>({});
  const [aiLoading,  setAiLoading]  = useState<string | null>(null);

  async function runAiCheck(txnId: string) {
    setAiLoading(txnId);
    try {
      const res = await api.get(`/ai/fraud-check/${txnId}`);
      setAiResults(prev => ({ ...prev, [txnId]: res.data.result }));
      toast.success("AI fraud check complete");
    } catch { toast.error("AI check failed"); }
    finally { setAiLoading(null); }
  }

  const { data, isLoading } = useQuery({
    queryKey: ["agg-transactions", page, status],
    queryFn:  () => fetchTxns(page, status),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["agg-transactions"] });

  async function markAssisted(id: string) {
    setAssisting(id);
    try {
      await api.post(`/transactions/${id}/assist`, { notes: "Confirmed by aggregator" });
      toast.success("Marked as paid — farmer wallet credited");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setAssisting(null); }
  }

  async function cancelTxn(id: string) {
    try {
      await api.post(`/transactions/${id}/cancel`);
      toast.success("Transaction cancelled — inventory released");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setConfirmCancel(null); }
  }

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    toast.success("Payment link copied!");
    setTimeout(() => setCopiedLink(null), 2000);
  }

  return (
    <DashboardLayout title="Transactions">
      {showCreate && (
        <CreateTxnModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { refresh(); qc.invalidateQueries({ queryKey: ["aggregator-dashboard"] }); }}
        />
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => { setStatus(t); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                status === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
              {t}
            </button>
          ))}
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
          New Transaction
        </Button>
      </div>

      {isLoading ? <Spinner text="Loading transactions..." /> : (
        <Card>
          {!data?.data?.length ? (
            <Empty title="No transactions" desc="Create a new transaction to get started" />
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {data.data.map((txn: Transaction) => {
                  const buyerName = txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer";
                  return (
                    <div key={txn.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
                              {txn.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {txn.farmer?.user?.name || "Farmer"} → {buyerName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{txn.txnRef} · {formatDate(txn.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-slate-900">{formatNaira(txn.totalAmount)}</p>
                          <p className="text-xs text-slate-400">Fee: {formatNaira(txn.platformFee)}</p>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {/* Payment link */}
                        {txn.paymentLink && txn.status === "PENDING" && (
                          <button onClick={() => copyLink(txn.paymentLink!, txn.id)}
                            className="flex items-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
                            {copiedLink === txn.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedLink === txn.id ? "Copied!" : "Copy Link"}
                          </button>
                        )}
                        {/* WhatsApp resend */}
                        {txn.paymentLink && txn.status === "PENDING" && (
                          <a href={`https://wa.me/${txn.buyerContact?.phone || ""}?text=${encodeURIComponent(`Hello! Here is your JustAgro payment link:\n${txn.paymentLink}`)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                            <Share2 className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                        {/* Open payment page */}
                        {txn.paymentLink && txn.status === "PENDING" && (
                          <a href={txn.paymentLink} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
                            <ExternalLink className="w-3 h-3" /> Open Link
                          </a>
                        )}
                        {/* Assist (no smartphone) */}
                        {txn.status === "PENDING" && confirmAssist !== txn.id && (
                          <button
                            onClick={() => setConfirmAssist(txn.id)}
                            disabled={assisting === txn.id}
                            className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Paid (Cash)
                          </button>
                        )}
                        {confirmAssist === txn.id && (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                            <p className="text-blue-700 text-xs font-semibold">Confirm cash payment?</p>
                            <button onClick={() => { markAssisted(txn.id); setConfirmAssist(null); }}
                              disabled={assisting === txn.id}
                              className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1">
                              {assisting === txn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Yes, confirm
                            </button>
                            <button onClick={() => setConfirmAssist(null)} className="text-blue-500 text-xs hover:text-blue-700">Cancel</button>
                          </div>
                        )}
                        {/* Cancel */}
                        {txn.status === "PENDING" && confirmCancel !== txn.id && (
                          <button onClick={() => setConfirmCancel(txn.id)}
                            className="flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        )}
                        {confirmCancel === txn.id && (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            <p className="text-red-700 text-xs font-semibold">Cancel transaction?</p>
                            <button onClick={() => cancelTxn(txn.id)}
                              className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-red-700">
                              Yes, cancel
                            </button>
                            <button onClick={() => setConfirmCancel(null)} className="text-red-400 text-xs hover:text-red-600">No</button>
                          </div>
                        )}
                        {/* AI Fraud Check */}
                        {txn.status === "PENDING" && (
                          <button
                            onClick={() => runAiCheck(txn.id)}
                            disabled={aiLoading === txn.id}
                            className="flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-60"
                          >
                            {aiLoading === txn.id
                              ? <><Loader2 className="w-3 h-3 animate-spin" /> Checking...</>
                              : <><Sparkles className="w-3 h-3" /> AI Fraud Check</>}
                          </button>
                        )}
                        {/* AI Result */}
                        {aiResults[txn.id] && (
                          <div className={`w-full mt-2 p-3 rounded-xl text-xs border ${
                            aiResults[txn.id].riskScore === "HIGH"   ? "bg-red-50 border-red-200 text-red-700" :
                            aiResults[txn.id].riskScore === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-700" :
                            "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            <p className="font-bold flex items-center gap-1.5 mb-1">
                              <Shield className="w-3 h-3" />
                              Risk: {aiResults[txn.id].riskScore} · {aiResults[txn.id].recommendation}
                            </p>
                            {aiResults[txn.id].flags?.length > 0 && (
                              <ul>{aiResults[txn.id].flags.map((f: string, i: number) => <li key={i}>• {f}</li>)}</ul>
                            )}
                            {!aiResults[txn.id].flags?.length && <p>{aiResults[txn.id].summary}</p>}
                          </div>
                        )}
                        {/* Receipt */}
                        {txn.receipt && (
                          <button onClick={() => printReceipt(txn.receipt!)}
                            className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                            <Download className="w-3 h-3" /> Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

// "use client";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useState } from "react";
// import { Plus, Search, Loader2, X, Copy, CheckCircle, ExternalLink, Download, Share2, Sparkles, Shield } from "lucide-react";
// import toast from "react-hot-toast";
// import api from "@/lib/api";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { Card, Spinner, Empty, Pagination, Button } from "@/components/ui";
// import { formatNaira, formatDate, statusColor, printReceipt, cn } from "@/lib/utils";
// import type { Transaction, Farmer, BuyerContact, Inventory } from "@/types";

// const fetchTxns = (page: number, status: string) => {
//   const q = status !== "ALL" ? `&status=${status}` : "";
//   return api.get(`/transactions?page=${page}&limit=10${q}`).then(r => r.data);
// };
// const fetchFarmers      = () => api.get("/farmers?limit=100").then(r => r.data.data);
// const fetchContacts     = () => api.get("/buyer-contacts?limit=100").then(r => r.data.data);
// const fetchFarmerInv    = (id: string) => api.get(`/inventory?farmerId=${id}&status=AVAILABLE&limit=100`).then(r => r.data.data);

// const TABS = ["ALL","PENDING","PAID","ASSISTED","CANCELLED"];
// const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

// // Create Transaction Modal
// function CreateTxnModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
//   const [step, setStep] = useState<1|2|3>(1);
//   // Step 1: farmer + inventory
//   const [farmerId,    setFarmerId]    = useState("");
//   const [inventoryId, setInventoryId] = useState("");
//   const [cropType,    setCropType]    = useState("");
//   const [quantity,    setQuantity]    = useState("");
//   const [pricePerKg,  setPricePerKg]  = useState("");
//   // Step 2: buyer
//   const [buyerMode,   setBuyerMode]   = useState<"existing"|"new">("existing");
//   const [contactId,   setContactId]   = useState("");
//   const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
//   const [newName,     setNewName]     = useState("");
//   const [newPhone,    setNewPhone]    = useState("");
//   const [newEmail,    setNewEmail]    = useState("");
//   const [notes,       setNotes]       = useState("");
//   const [loading,     setLoading]     = useState(false);
//   const [error,       setError]       = useState("");

//   const { data: farmers }  = useQuery({ queryKey: ["all-farmers"],  queryFn: fetchFarmers });
//   const { data: contacts } = useQuery({ queryKey: ["all-contacts"], queryFn: fetchContacts });
//   const { data: inventory } = useQuery({
//     queryKey: ["farmer-inv", farmerId],
//     queryFn:  () => fetchFarmerInv(farmerId),
//     enabled:  !!farmerId,
//   });

//   function selectInventory(inv: Inventory) {
//     setInventoryId(inv.id);
//     setCropType(inv.cropType);
//     setQuantity(inv.quantity.toString());
//     setPricePerKg(inv.pricePerKg.toString());
//   }

//   function step1Valid() {
//     return farmerId && cropType && parseFloat(quantity) > 0 && parseFloat(pricePerKg) > 0;
//   }

//   function step2Valid() {
//     if (buyerMode === "existing") return !!contactId;
//     return !!(newName.trim() && newPhone.trim());
//   }

//   async function create() {
//     setError(""); setLoading(true);
//     try {
//       let buyerContactId: string | undefined = undefined;
//       let buyerId:        string | undefined = undefined;

//       if (buyerMode === "new") {
//         // Create new contact then use it
//         const r   = await api.post("/buyer-contacts", { name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim() || undefined });
//         buyerContactId = r.data.data.id;
//       } else {
//         // Existing selection — check if platform buyer or contact
//         if (selectedBuyer?.source === "PLATFORM") {
//           buyerId        = selectedBuyer.id;       // platform Buyer record
//         } else {
//           buyerContactId = contactId;               // BuyerContact record
//         }
//       }

//       const res = await api.post("/transactions", {
//         farmerId, inventoryId: inventoryId || undefined,
//         cropType, quantity: parseFloat(quantity), pricePerKg: parseFloat(pricePerKg),
//         buyerContactId,
//         buyerId,
//         notes: notes.trim() || undefined,
//       });
//       toast.success("Transaction created! Buyer has been notified.");
//       onSaved(); onClose();
//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to create transaction");
//     } finally { setLoading(false); }
//   }

//   const total = (parseFloat(quantity)||0) * (parseFloat(pricePerKg)||0);

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl w-full max-w-lg shadow-card-lg animate-fade-up max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-slate-100">
//           <div>
//             <h3 className="font-semibold text-slate-900">New Transaction</h3>
//             <p className="text-slate-500 text-xs mt-0.5">Step {step} of 3</p>
//           </div>
//           <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
//         </div>

//         {/* Progress */}
//         <div className="flex px-6 pt-4 gap-2">
//           {[1,2,3].map(s => (
//             <div key={s} className={cn("flex-1 h-1.5 rounded-full transition-colors", s <= step ? "bg-brand-900" : "bg-slate-200")} />
//           ))}
//         </div>

//         <div className="p-6 space-y-4">
//           {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>}

//           {/* STEP 1 — Farmer + Produce */}
//           {step === 1 && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Farmer *</label>
//                 <select aria-label="farmer" value={farmerId} onChange={e => { setFarmerId(e.target.value); setInventoryId(""); }} className={ic}>
//                   <option value="">— Choose farmer —</option>
//                   {farmers?.map((f: Farmer) => (
//                     <option key={f.id} value={f.id}>{f.user.name} — {f.farmName}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Available inventory */}
//               {farmerId && inventory?.length > 0 && (
//                 <div>
//                   <p className="text-sm font-medium text-slate-700 mb-2">Available Stock (click to select)</p>
//                   <div className="space-y-2">
//                     {inventory.map((inv: Inventory) => (
//                       <button key={inv.id} type="button" onClick={() => selectInventory(inv)}
//                         className={cn("w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
//                           inventoryId === inv.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"
//                         )}>
//                         <span className={`font-semibold text-sm ${inventoryId === inv.id ? "text-brand-700" : "text-slate-800"}`}>
//                           {inv.cropType}
//                         </span>
//                         <span className="text-slate-500 text-sm">{inv.quantity}kg · {formatNaira(inv.pricePerKg)}/kg</span>
//                       </button>
//                     ))}
//                   </div>
//                   <p className="text-slate-400 text-xs mt-2">Or enter custom quantity below</p>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Type *</label>
//                 <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} placeholder="e.g. Maize" className={ic} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity (kg) *</label>
//                   <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="200" min="0" className={ic} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Price/kg (₦) *</label>
//                   <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} placeholder="180" min="0" className={ic} />
//                 </div>
//               </div>
//               {total > 0 && (
//                 <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
//                   <p className="text-brand-600 text-xs font-semibold">TRANSACTION TOTAL</p>
//                   <p className="font-display text-2xl font-bold text-brand-700 mt-1">{formatNaira(total)}</p>
//                   <p className="text-brand-500 text-xs mt-1">Platform fee (1%): {formatNaira(total * 0.01)} · Farmer receives: {formatNaira(total * 0.99)}</p>
//                 </div>
//               )}
//               <button onClick={() => step1Valid() ? setStep(2) : setError("Fill all required fields")}
//                 className="w-full bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm">
//                 Next: Select Buyer →
//               </button>
//             </>
//           )}

//           {/* STEP 2 — Buyer */}
//           {step === 2 && (
//             <>
//               <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-2">
//                 {["existing","new"].map(m => (
//                   <button key={m} type="button" onClick={() => setBuyerMode(m as any)}
//                     className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
//                       buyerMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
//                     )}>
//                     {m === "existing" ? "Saved Contact" : "New Buyer"}
//                   </button>
//                 ))}
//               </div>

//               {buyerMode === "existing" ? (
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Buyer Contact *</label>
//                   <select aria-label="buyer contact" value={contactId} onChange={e => {
//                     setContactId(e.target.value);
//                     const found = contacts?.find((c: any) => c.id === e.target.value);
//                     setSelectedBuyer(found || null);
//                   }} className={ic}>
//                     <option value="">— Choose buyer —</option>
//                     {contacts?.map((c: any) => (
//                       <option key={c.id} value={c.id}>
//                         {c.source === "PLATFORM" ? "✓ " : ""}{c.name} — {c.phone}
//                       </option>
//                     ))}
//                   </select>
//                   {selectedBuyer?.source === "PLATFORM" && (
//                     <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
//                       ✓ Platform user — has a JustAgro account
//                     </p>
//                   )}
//                   {contacts?.length === 0 && (
//                     <p className="text-amber-600 text-xs mt-2">No saved contacts. Switch to "New Buyer" to add one.</p>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Buyer Name *</label>
//                     <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Abubakar Grains Store" className={ic} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
//                     <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="08012345678" className={ic} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (optional)</label>
//                     <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="buyer@email.com" className={ic} />
//                   </div>
//                 </>
//               )}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
//                 <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional information..." className={ic} />
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">
//                   ← Back
//                 </button>
//                 <button onClick={() => step2Valid() ? setStep(3) : setError("Select or fill buyer details")}
//                   className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm">
//                   Next: Confirm →
//                 </button>
//               </div>
//             </>
//           )}

//           {/* STEP 3 — Confirm */}
//           {step === 3 && (
//             <>
//               <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
//                 <p className="font-semibold text-slate-900 mb-3">Transaction Summary</p>
//                 {[
//                   ["Farmer",   farmers?.find((f: Farmer) => f.id === farmerId)?.user?.name || "-"],
//                   ["Produce",  `${cropType} (${quantity}kg)`],
//                   ["Price/kg", formatNaira(parseFloat(pricePerKg))],
//                   ["Total",    formatNaira(total)],
//                   ["Farmer gets", formatNaira(total * 0.99)],
//                   ["Platform fee", formatNaira(total * 0.01)],
//                   ["Buyer", buyerMode === "existing"
//                     ? selectedBuyer?.name || contacts?.find((c: any) => c.id === contactId)?.name || "-"
//                     : newName],
//                 ].map(([l, v]) => (
//                   <div key={l} className="flex justify-between text-sm">
//                     <span className="text-slate-500">{l}</span>
//                     <span className="font-semibold text-slate-900">{v}</span>
//                   </div>
//                 ))}
//               </div>
//               <p className="text-slate-500 text-xs text-center">
//                 A payment link will be sent to the buyer via WhatsApp & SMS
//               </p>
//               <div className="flex gap-3">
//                 <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">← Back</button>
//                 <button onClick={create} disabled={loading}
//                   className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
//                   {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create & Notify Buyer ✓"}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AggregatorTransactions() {
//   const qc = useQueryClient();
//   const [page,       setPage]       = useState(1);
//   const [status,     setStatus]     = useState("ALL");
//   const [showCreate, setShowCreate] = useState(false);
//   const [assisting,  setAssisting]  = useState<string|null>(null);
//   const [copiedLink, setCopiedLink] = useState<string|null>(null);


//   const [aiResults,  setAiResults]  = useState<Record<string, any>>({});
//   const [aiLoading,  setAiLoading]  = useState<string | null>(null);

//   async function runAiCheck(txnId: string) {
//     setAiLoading(txnId);
//     try {
//       const res = await api.get(`/ai/fraud-check/${txnId}`);
//       setAiResults(prev => ({ ...prev, [txnId]: res.data.result }));
//       toast.success("AI fraud check complete");
//     } catch { toast.error("AI check failed"); }
//     finally { setAiLoading(null); }
//   }

//   const { data, isLoading } = useQuery({
//     queryKey: ["agg-transactions", page, status],
//     queryFn:  () => fetchTxns(page, status),
//   });

//   const refresh = () => qc.invalidateQueries({ queryKey: ["agg-transactions"] });

//   async function markAssisted(id: string) {
//     if (!confirm("Mark this transaction as paid (assisted/cash)?")) return;
//     setAssisting(id);
//     try {
//       await api.post(`/transactions/${id}/assist`, { notes: "Confirmed by aggregator" });
//       toast.success("Marked as paid");
//       refresh();
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed");
//     } finally { setAssisting(null); }
//   }

//   async function cancelTxn(id: string) {
//     if (!confirm("Cancel this transaction? Inventory will be released.")) return;
//     try {
//       await api.post(`/transactions/${id}/cancel`);
//       toast.success("Transaction cancelled");
//       refresh();
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed");
//     }
//   }

//   function copyLink(link: string, id: string) {
//     navigator.clipboard.writeText(link);
//     setCopiedLink(id);
//     toast.success("Payment link copied!");
//     setTimeout(() => setCopiedLink(null), 2000);
//   }

//   return (
//     <DashboardLayout title="Transactions">
//       {showCreate && (
//         <CreateTxnModal
//           onClose={() => setShowCreate(false)}
//           onSaved={() => { refresh(); qc.invalidateQueries({ queryKey: ["aggregator-dashboard"] }); }}
//         />
//       )}

//       {/* Controls */}
//       <div className="flex items-center justify-between mb-5">
//         <div className="flex gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
//           {TABS.map(t => (
//             <button key={t} onClick={() => { setStatus(t); setPage(1); }}
//               className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
//                 status === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
//               {t}
//             </button>
//           ))}
//         </div>
//         <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
//           New Transaction
//         </Button>
//       </div>

//       {isLoading ? <Spinner text="Loading transactions..." /> : (
//         <Card>
//           {!data?.data?.length ? (
//             <Empty title="No transactions" desc="Create a new transaction to get started" />
//           ) : (
//             <>
//               <div className="divide-y divide-slate-50">
//                 {data.data.map((txn: Transaction) => {
//                   const buyerName = txn.buyerContact?.name || txn.buyer?.user?.name || "Buyer";
//                   return (
//                     <div key={txn.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
//                       <div className="flex items-start gap-4">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1 flex-wrap">
//                             <p className="font-semibold text-slate-900">{txn.cropType} — {txn.quantity}kg</p>
//                             <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusColor(txn.status))}>
//                               {txn.status}
//                             </span>
//                           </div>
//                           <p className="text-sm text-slate-500">
//                             {txn.farmer?.user?.name || "Farmer"} → {buyerName}
//                           </p>
//                           <p className="text-xs text-slate-400 mt-0.5">{txn.txnRef} · {formatDate(txn.createdAt)}</p>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className="font-bold text-slate-900">{formatNaira(txn.totalAmount)}</p>
//                           <p className="text-xs text-slate-400">Fee: {formatNaira(txn.platformFee)}</p>
//                         </div>
//                       </div>

//                       {/* Actions row */}
//                       <div className="flex items-center gap-2 mt-3 flex-wrap">
//                         {/* Payment link */}
//                         {txn.paymentLink && txn.status === "PENDING" && (
//                           <button onClick={() => copyLink(txn.paymentLink!, txn.id)}
//                             className="flex items-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
//                             {copiedLink === txn.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
//                             {copiedLink === txn.id ? "Copied!" : "Copy Link"}
//                           </button>
//                         )}
//                         {/* WhatsApp resend */}
//                         {txn.paymentLink && txn.status === "PENDING" && (
//                           <a href={`https://wa.me/${txn.buyerContact?.phone || ""}?text=${encodeURIComponent(`Hello! Here is your JustAgro payment link:\n${txn.paymentLink}`)}`}
//                             target="_blank" rel="noreferrer"
//                             className="flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
//                             <Share2 className="w-3 h-3" /> WhatsApp
//                           </a>
//                         )}
//                         {/* Open payment page */}
//                         {txn.paymentLink && txn.status === "PENDING" && (
//                           <a href={txn.paymentLink} target="_blank" rel="noreferrer"
//                             className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
//                             <ExternalLink className="w-3 h-3" /> Open Link
//                           </a>
//                         )}
//                         {/* Assist (no smartphone) */}
//                         {txn.status === "PENDING" && (
//                           <button
//                             onClick={() => markAssisted(txn.id)}
//                             disabled={assisting === txn.id}
//                             className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-60"
//                           >
//                             {assisting === txn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
//                             Mark Paid (Cash)
//                           </button>
//                         )}
//                         {/* Cancel */}
//                         {txn.status === "PENDING" && (
//                           <button onClick={() => cancelTxn(txn.id)}
//                             className="flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
//                             Cancel
//                           </button>
//                         )}
//                         {/* AI Fraud Check */}
//                         {txn.status === "PENDING" && (
//                           <button
//                             onClick={() => runAiCheck(txn.id)}
//                             disabled={aiLoading === txn.id}
//                             className="flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-60"
//                           >
//                             {aiLoading === txn.id
//                               ? <><Loader2 className="w-3 h-3 animate-spin" /> Checking...</>
//                               : <><Sparkles className="w-3 h-3" /> AI Fraud Check</>}
//                           </button>
//                         )}
//                         {/* AI Result */}
//                         {aiResults[txn.id] && (
//                           <div className={`w-full mt-2 p-3 rounded-xl text-xs border ${
//                             aiResults[txn.id].riskScore === "HIGH"   ? "bg-red-50 border-red-200 text-red-700" :
//                             aiResults[txn.id].riskScore === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-700" :
//                             "bg-emerald-50 border-emerald-200 text-emerald-700"
//                           }`}>
//                             <p className="font-bold flex items-center gap-1.5 mb-1">
//                               <Shield className="w-3 h-3" />
//                               Risk: {aiResults[txn.id].riskScore} · {aiResults[txn.id].recommendation}
//                             </p>
//                             {aiResults[txn.id].flags?.length > 0 && (
//                               <ul>{aiResults[txn.id].flags.map((f: string, i: number) => <li key={i}>• {f}</li>)}</ul>
//                             )}
//                             {!aiResults[txn.id].flags?.length && <p>{aiResults[txn.id].summary}</p>}
//                           </div>
//                         )}
//                         {/* Receipt */}
//                         {txn.receipt && (
//                           <button onClick={() => printReceipt(txn.receipt!)}
//                             className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
//                             <Download className="w-3 h-3" /> Receipt
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="px-6 pb-4">
//                 <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} onPage={setPage} />
//               </div>
//             </>
//           )}
//         </Card>
//       )}
//     </DashboardLayout>
//   );
// }

