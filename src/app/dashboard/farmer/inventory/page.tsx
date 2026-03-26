"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty, Pagination, Button } from "@/components/ui";
import { formatNaira, formatDate, statusColor, cn } from "@/lib/utils";
import type { Inventory } from "@/types";

function fetchInventory(page: number) {
  return api.get(`/inventory?page=${page}&limit=10`).then(r => r.data);
}

interface ModalProps {
  item?:    Inventory;
  onClose:  () => void;
  onSaved:  () => void;
}

function InventoryModal({ item, onClose, onSaved }: ModalProps) {
  const [cropType,   setCropType]   = useState(item?.cropType   || "");
  const [quantity,   setQuantity]   = useState(item?.quantity?.toString()   || "");
  const [pricePerKg, setPricePerKg] = useState(item?.pricePerKg?.toString() || "");
  const [notes,      setNotes]      = useState(item?.notes      || "");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const isEdit = !!item;

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

  async function save() {
    setError("");
    if (!cropType.trim())  { setError("Crop type is required");  return; }
    if (!quantity)          { setError("Quantity is required");    return; }
    if (!pricePerKg)        { setError("Price/kg is required");    return; }
    if (parseFloat(quantity) <= 0)   { setError("Quantity must be > 0");  return; }
    if (parseFloat(pricePerKg) <= 0) { setError("Price must be > 0");     return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/inventory/${item.id}`, {
          cropType: cropType.trim(), quantity: parseFloat(quantity),
          pricePerKg: parseFloat(pricePerKg), notes: notes.trim() || null,
        });
        toast.success("Stock updated");
      } else {
        await api.post("/inventory", {
          cropType: cropType.trim(), quantity: parseFloat(quantity),
          pricePerKg: parseFloat(pricePerKg), notes: notes.trim() || null,
        });
        toast.success("Stock added!");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-card-lg animate-fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{isEdit ? "Edit Stock" : "Add Stock"}</h3>
          <button aria-label="close" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Type *</label>
            <input type="text" value={cropType} onChange={e => setCropType(e.target.value)}
              placeholder="e.g. Maize, Rice, Tomatoes" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity (kg) *</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="500" min="0" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per kg (₦) *</label>
              <input type="number" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)}
                placeholder="180" min="0" step="0.01" className={inputClass} />
            </div>
          </div>

          {/* Total preview */}
          {quantity && pricePerKg && parseFloat(quantity) > 0 && parseFloat(pricePerKg) > 0 && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <p className="text-brand-600 text-xs font-semibold">TOTAL VALUE</p>
              <p className="font-display text-2xl font-bold text-brand-700 mt-1">
                {formatNaira(parseFloat(quantity) * parseFloat(pricePerKg))}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Grade A, freshly harvested..." className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (isEdit ? "Update" : "Add Stock")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarmerInventory() {
  const qc = useQueryClient();
  const [page,      setPage]      = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState<Inventory | undefined>();
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-inventory", page],
    queryFn:  () => fetchInventory(page),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["farmer-inventory"] });

  async function deleteItem(id: string) {
    if (!confirm("Delete this stock item?")) return;
    setDeleting(id);
    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Deleted");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cannot delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <DashboardLayout title="My Inventory">
      {(showModal || editItem) && (
        <InventoryModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(undefined); }}
          onSaved={refresh}
        />
      )}

      
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">Manage your available produce</p>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          Add Stock
        </Button>
      </div>

      {isLoading ? (
        <Spinner text="Loading inventory..." />
      ) : (
        <Card>
          {!data?.data?.length ? (
            <Empty
              title="No stock listed"
              desc="Click 'Add Stock' to list your first produce"
            />
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50 rounded-t-2xl text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="col-span-2">Produce</span>
                <span>Quantity</span>
                <span>Price/kg</span>
                <span>Total Value</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-slate-50">
                {data.data.map((inv: Inventory) => (
                  <div key={inv.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 min-w-0">
                      <p className="font-semibold text-slate-900">{inv.cropType}</p>
                      {inv.notes && <p className="text-xs text-slate-400 truncate mt-0.5">{inv.notes}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(inv.createdAt)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{inv.quantity}kg</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{formatNaira(inv.pricePerKg)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{formatNaira(inv.totalValue)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", statusColor(inv.status))}>
                        {inv.status}
                      </span>
                      {inv.status === "AVAILABLE" && (
                        <div className="flex gap-1">
                          <button
                            aria-label="Edit stock"
                            onClick={() => setEditItem(inv)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(inv.id)}
                            disabled={deleting === inv.id}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40"
                          >
                            {deleting === inv.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-4">
                <Pagination
                  page={data.pagination.page}
                  pages={data.pagination.pages}
                  total={data.pagination.total}
                  onPage={setPage}
                />
              </div>
            </>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
