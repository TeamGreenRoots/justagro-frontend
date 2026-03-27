"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Leaf, Loader2, ArrowRight, Eye, EyeOff, CheckCircle,
  Wheat, ShoppingCart, Building2
} from "lucide-react";
import toast from "react-hot-toast";
import { registerUser, loginUser, getDashboardPath } from "@/lib/auth";
import type { Role } from "@/types";

const ROLES: {
  id: Role;
  icon: React.ReactNode;
  label: string;
  tagline: string;
  desc: string;
  perks: string[];
  color: string;
  activeColor: string;
}[] = [
    {
      id: "FARMER",
      icon: <Wheat className="w-6 h-6" />,
      label: "Farmer",
      tagline: "I grow and sell produce",
      desc: "List your crops, receive verified payments directly to your wallet, and build a financial history that works for you.",
      perks: ["Direct buyer payments", "Wallet + withdrawals", "SMS confirmation"],
      color: "border-slate-200 hover:border-brand-300",
      activeColor: "border-brand-600 bg-brand-50",
    },
    {
      id: "BUYER",
      icon: <ShoppingCart className="w-6 h-6" />,
      label: "Buyer",
      tagline: "I purchase farm produce",
      desc: "Browse verified produce, receive secure payment links, and pay via card, transfer or USSD. Download your receipt instantly.",
      perks: ["Browse all produce", "Pay via Interswitch", "PDF receipts"],
      color: "border-slate-200 hover:border-blue-300",
      activeColor: "border-blue-600 bg-blue-50",
    },
    {
      id: "AGGREGATOR",
      icon: <Building2 className="w-6 h-6" />,
      label: "Aggregator",
      tagline: "I manage the supply chain",
      desc: "Register farmers, log inventory, create transactions, send payment links, and track everything in real time with AI.",
      perks: ["Manage farmers & buyers", "AI fraud detection", "Full analytics"],
      color: "border-slate-200 hover:border-purple-300",
      activeColor: "border-purple-600 bg-purple-50",
    },
  ];

function validateNigerianPhone(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (!cleaned) return "Phone number is required";
  if (!/^0[7-9][01]\d{8}$/.test(cleaned)) {
    return "Enter a valid 11-digit Nigerian number (e.g. 08012345678)";
  }
  return null;
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initRole = (params.get("role")?.toUpperCase() as Role) || "FARMER";

  const [role, setRole] = useState<Role>(initRole);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [crops, setCrops] = useState("");
  const [company, setCompany] = useState("");
  const [orgName, setOrgName] = useState("");

  const selected = ROLES.find(r => r.id === role)!;

  function nextStep() {
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required"); return; }
    const phoneErr = validateNigerianPhone(phone.trim());
    if (phoneErr) { setError(phoneErr); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (role === "FARMER" && !farmName.trim()) { setError("Farm name is required"); return; }
    if (role === "FARMER" && !location.trim()) { setError("Location is required"); return; }
    if (role === "AGGREGATOR" && !orgName.trim()) { setError("Organization name is required"); return; }

    const payload: Record<string, any> = { name: name.trim(), phone: phone.trim(), password, role };
    if (role === "FARMER") {
      payload.farmName = farmName.trim();
      payload.location = location.trim();
      payload.cropTypes = crops.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (role === "BUYER") payload.companyName = company.trim();
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
    } finally { setLoading(false); }
  }

  const ic = "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all";

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-brand-900">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=85"
          alt="Farm" fill className="object-cover opacity-30" priority
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="w-9 h-9 rounded-lg flex items-center justify-center  transition-colors">
              <img src="/logos/justagro.jpeg" alt="JustAgro" className="w-full h-full object-contain" />
            </Link>
            <Link href="/" className="font-display text-white text-xl font-semibold">JustAgro</Link>
          </div>
          
          <div>
            <h2 className="font-display text-3xl text-white font-semibold leading-snug mb-3">
              Your financial
              <span className="block text-gold-400 italic">identity starts here.</span>
            </h2>
            <p className="text-white/55 text-sm mb-8 leading-relaxed">
              Every transaction you make on JustAgro is verified by Interswitch
              and creates a permanent financial record — your passport to credit,
              banking, and growth.
            </p>
            <div className="space-y-3">
              {[
                "Receive payments directly from buyers",
                "Build a verifiable transaction history",
                "AI-powered fraud detection on every deal",
                "WhatsApp + SMS alerts for every event",
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

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-brand-900 text-xl font-semibold">JustAgro</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? "text-brand-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-brand-700 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
              Choose role
            </div>
            <div className={`flex-1 h-px ${step >= 2 ? "bg-brand-300" : "bg-slate-200"}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === 2 ? "text-brand-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-brand-700 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
              Your details
            </div>
          </div>

          {/* STEP 1 — Role selection */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Who are you?</h1>
                <p className="text-slate-500 text-sm">Choose the role that describes you best. You can only have one role per account.</p>
              </div>

              <div className="space-y-3 mb-6">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${role === r.id ? r.activeColor : r.color + " bg-white"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${role === r.id ? "bg-white shadow-sm" : "bg-slate-100"
                        }`}>
                        <span className={role === r.id ? "text-brand-700" : "text-slate-500"}>
                          {r.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-bold text-slate-900">{r.label}</p>
                          {role === r.id && (
                            <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mb-2">{r.tagline}</p>
                        <p className="text-slate-600 text-xs leading-relaxed hidden sm:block">{r.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.perks.map((p, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-800 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
              >
                Continue as {selected.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-center text-slate-500 text-sm mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-700 font-semibold hover:text-brand-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2 — Details */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3 transition-colors"
                >
                  ← Change role
                </button>
                {/* Role badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 mb-4 ${selected.activeColor}`}>
                  <span className="text-brand-700">{selected.icon}</span>
                  <span className="font-bold text-slate-900 text-sm">{selected.label}</span>
                  <span className="text-slate-500 text-xs">· {selected.tagline}</span>
                </div>
                <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Create your account</h1>
                <p className="text-slate-500 text-sm">Fill in your details to get started on JustAgro.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm mb-4 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Emeka Okafor" className={ic} autoFocus />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => {
                        // only allow digits, max 11
                        const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                        setPhone(val);
                      }}
                      placeholder="08012345678"
                      maxLength={11}
                      className={ic}
                    />
                    {phone.length > 0 && phone.length < 11 && (
                      <p className="text-xs text-amber-600 mt-1">{11 - phone.length} more digit{11 - phone.length !== 1 ? "s" : ""} needed</p>
                    )}
                    {phone.length === 11 && /^0[7-9][01]\d{8}$/.test(phone) && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        Valid Nigerian number
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters" className={`${ic} pr-11`}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {role === "FARMER" && (
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 space-y-3">
                    <p className="text-xs font-bold text-brand-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5" /> Farm Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Farm Name *</label>
                        <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)}
                          placeholder="Emeka Rice Farm" className={ic} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location *</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                          placeholder="Kano State" className={ic} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Crop Types</label>
                      <input type="text" value={crops} onChange={e => setCrops(e.target.value)}
                        placeholder="Rice, Maize, Sorghum (comma separated)" className={ic} />
                      <p className="text-xs text-slate-400 mt-1">Separate multiple crops with commas</p>
                    </div>
                  </div>
                )}

                {role === "BUYER" && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Buyer Details
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                        placeholder="AgroMart Nigeria Ltd" className={ic} />
                    </div>
                  </div>
                )}

                {role === "AGGREGATOR" && (
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Organization Details
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization Name *</label>
                      <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                        placeholder="AgriHub Nigeria" className={ic} />
                    </div>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}





