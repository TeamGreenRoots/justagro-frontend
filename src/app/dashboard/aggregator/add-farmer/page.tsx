"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui";

const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all";

export default function AddFarmerPage() {
  const router  = useRouter();
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [farmName,  setFarmName]  = useState("");
  const [location,  setLocation]  = useState("");
  const [crops,     setCrops]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState<{ name: string; phone: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !phone || !farmName || !location) { setError("Name, phone, farm name and location are required"); return; }
    setLoading(true);
    try {
      await api.post("/aggregator/register-farmer", {
        name: name.trim(), phone: phone.trim(),
        farmName: farmName.trim(), location: location.trim(),
        cropTypes: crops.split(",").map(s => s.trim()).filter(Boolean),
      });
      setSuccess({ name: name.trim(), phone: phone.trim() });
      toast.success(`${name} registered successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <DashboardLayout title="Register Farmer">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-2">Farmer Registered!</h2>
            <p className="text-slate-500 mb-6">
              <strong>{success.name}</strong> has been registered successfully.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-700 text-sm font-semibold mb-1">Important — Default Password</p>
              <p className="text-amber-600 text-sm">
                The farmer's default password is their phone number: <span className="font-mono font-bold">{success.phone}</span>
              </p>
              <p className="text-amber-600 text-xs mt-1">They can change it after logging in.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSuccess(null); setName(""); setPhone(""); setFarmName(""); setLocation(""); setCrops(""); }}
                className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 text-sm">
                Register Another
              </button>
              <button onClick={() => router.push("/dashboard/aggregator/farmers")}
                className="flex-1 bg-brand-900 text-white py-3 rounded-xl font-semibold hover:bg-brand-800 text-sm">
                View All Farmers
              </button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Register Farmer">
      <div className="max-w-lg mx-auto">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <p className="text-blue-700 text-sm font-semibold mb-1">📱 For farmers without smartphones</p>
          <p className="text-blue-600 text-sm">You can register farmers on their behalf. Their default login password will be their phone number.</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Farmer's Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Musa Abdullahi" className={ic} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08033221100" className={ic} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Farm Name *</label>
                <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="Musa Tomato Farm" className={ic} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Kaduna State" className={ic} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Types (comma separated)</label>
              <input type="text" value={crops} onChange={e => setCrops(e.target.value)} placeholder="Tomatoes, Pepper, Onions" className={ic} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-800 transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : "Register Farmer"}
            </button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
