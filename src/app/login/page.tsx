"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser, getDashboardPath } from "@/lib/auth";

const DEMO_ACCOUNTS = [
  { role: "Aggregator", sub: "Full platform access", phone: "08000000001", password: "demo1234", color: "bg-purple-50 border-purple-200 text-purple-800" },
  { role: "Farmer", sub: "Has stock + history", phone: "08000000002", password: "demo1234", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { role: "Buyer", sub: "Pending orders", phone: "08000000004", password: "demo1234", color: "bg-blue-50 border-blue-200 text-blue-800" },
  // { role: "Farmer (new)",      sub: "No transactions yet",  phone: "08000000003", password: "demo1234", color: "bg-slate-50 border-slate-200 text-slate-600" },
];

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim()) { setError("Phone number is required"); return; }
    if (!password) { setError("Password is required"); return; }
    setLoading(true);
    try {
      const user = await loginUser(phone.trim(), password);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.push(getDashboardPath(user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid phone or password");
    } finally { setLoading(false); }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setPhone(acc.phone);
    setPassword(acc.password);
    setError("");
    toast.success(`${acc.role} credentials filled`);
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-900">
        <Image src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=85"
          alt="Farmer" fill className="object-cover opacity-40" priority />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="w-9 h-9 rounded-lg flex items-center justify-center  transition-colors">
              <img src="/logos/justagro.jpeg" alt="JustAgro" className="w-full h-full object-contain" />
            </Link>
            <Link href="/" className="font-display text-white text-xl font-semibold">JustAgro</Link>
          </div>
          <div>
            <h2 className="font-display text-4xl text-white font-semibold leading-snug mb-6">
              Connecting farmers<br />
              <span className="text-gold-400 italic">to the market.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Transparent payments and inventory management for Nigerian smallholder farmers.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-brand-900 text-xl font-semibold">JustAgro</span>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-3xl font-semibold text-slate-900 mb-1">Sign in</h1>
            <p className="text-slate-500 text-sm">Enter your credentials below</p>
          </div>

          {/* Demo Accounts — one click fill */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Demo Accounts — Click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button key={i} type="button" onClick={() => fillDemo(acc)}
                  className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${acc.color}`}>
                  <p className="text-xs font-bold">{acc.role}</p>
                  <p className="text-xs opacity-60 mt-0.5">{acc.sub}</p>
                  <p className="text-xs font-mono mt-1 opacity-50">{acc.phone}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="08012345678"
                maxLength={11}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-slate-900 text-sm placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all" />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            No account?{" "}
            <Link href="/register" className="text-brand-700 font-semibold hover:text-brand-600 transition-colors">Register</Link>
            {" · "}
            <Link href="/browse" className="text-brand-700 font-semibold hover:text-brand-600 transition-colors">Browse Produce</Link>
          </p>
        </div>
      </div>
    </div>
  );
}