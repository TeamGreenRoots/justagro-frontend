"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Leaf, Shield, Zap, Users, CheckCircle, ChevronRight } from "lucide-react";
import { getUser, getDashboardPath } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router   = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) { router.replace(getDashboardPath(user.role)); return; }
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-brand-900">JustAgro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-brand-700 transition-colors">Sign in</Link>
            <Link href="/register" className="bg-brand-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-900">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute top-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-gold-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Powered by Interswitch</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight mb-6">
              The Payment Platform for
              <span className="block text-gold-400 italic">Nigerian Farmers</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
              JustAgro connects smallholder farmers, buyers, and aggregators through a transparent payment and inventory system. No middlemen. No cash handling. Real receipts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-xl text-base font-bold hover:bg-gold-400 transition-all shadow-xl group">
                Start Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </div>

          {/* Floating stats */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-64 space-y-4">
              {[
                { label: "Registered Farmers", value: "36M+", sub: "Nigeria" },
                { label: "With Bank Access",   value: "5%",   sub: "Gap to fill" },
                { label: "Platform Fee",        value: "1%",   sub: "Per transaction" },
              ].map((s, i) => (
                <div key={i} className={i > 0 ? "border-t border-white/10 pt-4" : ""}>
                  <p className="text-white/50 text-xs">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-white/40 text-xs">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" fill="white" /></svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-brand-600 text-sm font-semibold tracking-widest uppercase">How It Works</span>
            <h2 className="font-display text-4xl font-semibold text-slate-900 mt-3">Three roles. One platform.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🏢",
                role:  "Aggregator",
                color: "bg-purple-50 border-purple-100",
                steps: [
                  "Register farmers (online or on their behalf)",
                  "Log farm inventory — crop, quantity, price",
                  "Create transaction and assign to buyer",
                  "Send payment link via WhatsApp or SMS",
                  "Track all payments in real time",
                ],
              },
              {
                emoji: "🛒",
                role:  "Buyer",
                color: "bg-blue-50 border-blue-100",
                steps: [
                  "Browse available produce from farmers",
                  "Receive payment link from aggregator",
                  "Pay securely via Interswitch",
                  "Card, Bank Transfer, USSD — all supported",
                  "Download official PDF receipt",
                ],
              },
              {
                emoji: "🌾",
                role:  "Farmer",
                color: "bg-emerald-50 border-emerald-100",
                steps: [
                  "List your produce and set price",
                  "Get paid directly to your account",
                  "Receive SMS/WhatsApp confirmation",
                  "View full transaction history",
                  "Download receipts for records",
                ],
              },
            ].map((r, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${r.color}`}>
                <div className="text-4xl mb-3">{r.emoji}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.steps.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-slate-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-semibold text-slate-900">Built for real Nigeria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: <Zap className="w-5 h-5" />,     title: "Interswitch Payments",       desc: "Real payment integration — Card, Bank Transfer, USSD, Wallet. Verified server-side.", color: "bg-brand-50 text-brand-700" },
              { icon: <Shield className="w-5 h-5" />,   title: "AI Fraud Detection",          desc: "Every transaction is analysed by AI for suspicious patterns before money moves.", color: "bg-purple-50 text-purple-700" },
              { icon: <Users className="w-5 h-5" />,    title: "Offline Farmer Registration", desc: "Aggregator can register farmers who have no smartphone on their behalf.", color: "bg-blue-50 text-blue-700" },
              { icon: <CheckCircle className="w-5 h-5" />, title: "PDF Receipts",             desc: "Every paid transaction generates a downloadable PDF receipt instantly.", color: "bg-emerald-50 text-emerald-700" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-semibold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Register as a Farmer, Buyer, or Aggregator in under 2 minutes.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-900 px-10 py-4 rounded-xl font-bold text-base hover:bg-gold-400 transition-all shadow-xl group">
            Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center"><Leaf className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-display text-white font-semibold">JustAgro</span>
          </div>
          <p className="text-slate-500 text-sm">Built for Interswitch | Enyata Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
}
