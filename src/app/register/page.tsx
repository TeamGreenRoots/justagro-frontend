// change the leaf icons to logos later
"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, ArrowRight, Eye, EyeOff, CheckCircle, Wheat, ShoppingCart, Building2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { registerUser, loginUser, getDashboardPath } from "@/lib/auth";
import type { Role } from "@/types";

import { Suspense } from "react";

const ROLES: { id: Role; icon: LucideIcon; label: string; desc: string }[] = [
  { id: "FARMER",     icon: Wheat,         label: "Farmer",     desc: "I grow and sell produce" },
  { id: "BUYER",      icon: ShoppingCart,  label: "Buyer",      desc: "I purchase from farmers" },
  { id: "AGGREGATOR", icon: Building2,     label: "Aggregator", desc: "I manage the platform" },
];


function RegisterContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const initRole   = (params.get("role")?.toUpperCase() as Role) || "FARMER";

  const [role,    setRole]    = useState<Role>(initRole);
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");

  // All form fields as plain state
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [password,setPassword]= useState("");
  const [farmName,setFarmName]= useState("");
  const [location,setLocation]= useState("");
  const [crops,   setCrops]   = useState("");
  const [company, setCompany] = useState("");
  const [orgName, setOrgName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim())     { setError("Full name is required"); return; }
    if (!phone.trim())    { setError("Phone number is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (role === "FARMER" && !farmName.trim()) { setError("Farm name is required"); return; }
    if (role === "FARMER" && !location.trim()) { setError("Location is required"); return; }
    if (role === "AGGREGATOR" && !orgName.trim()) { setError("Organization name is required"); return; }

    const payload: Record<string, any> = {
      name: name.trim(), phone: phone.trim(), password, role,
    };

    if (role === "FARMER") {
      payload.farmName  = farmName.trim();
      payload.location  = location.trim();
      payload.cropTypes = crops.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (role === "BUYER")      payload.companyName      = company.trim();
    if (role === "AGGREGATOR") payload.organizationName = orgName.trim();

    setLoading(true);
    try {
      await registerUser(payload);
      toast.success("Account created! Signing you in...");
      const user = await loginUser(phone.trim(), password);
      router.push(getDashboardPath(user.role));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all";

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Image */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-brand-900">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=85"
          alt="Farm"
          fill className="object-cover opacity-35"
          priority
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-white text-xl font-semibold">JustAgro</span>
          </div>
          <div>
            <h2 className="font-display text-3xl text-white font-semibold leading-snug mb-8">
              Your financial
              <span className="block text-gold-400 italic">identity starts here.</span>
            </h2>
            <div className="space-y-3">
              {[
                "Receive direct buyer payments",
                "AI-powered credit scoring",
                "Transparent transaction records",
                "WhatsApp & SMS notifications",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span className="text-white/75 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-brand-900 text-xl font-semibold">JustAgro</span>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Create account</h1>
            <p className="text-slate-500 text-sm">Join JustAgro to get started</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 mb-2">I am a...</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    role === r.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="mb-1">
                    <r.icon className={`w-6 h-6 ${role === r.id ? "text-brand-600" : "text-slate-400"}`} />
                  </div>
                  <div className={`font-semibold text-xs ${role === r.id ? "text-brand-700" : "text-slate-800"}`}>
                    {r.label}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5 leading-tight">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Emeka Okafor" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="08012345678" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`${inputClass} pr-11`}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Farmer fields */}
            {role === "FARMER" && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Farm Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Farm Name *</label>
                    <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)}
                      placeholder="Emeka Rice Farm" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="Kano State" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Crop Types</label>
                  <input type="text" value={crops} onChange={e => setCrops(e.target.value)}
                    placeholder="Rice, Maize, Sorghum (comma separated)" className={inputClass} />
                </div>
              </div>
            )}

            {role === "BUYER" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name (optional)</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="AgroMart Nigeria Ltd" className={inputClass} />
              </div>
            )}

            {role === "AGGREGATOR" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization Name *</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="JustAgro HQ" className={inputClass} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-700 font-semibold hover:text-brand-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}