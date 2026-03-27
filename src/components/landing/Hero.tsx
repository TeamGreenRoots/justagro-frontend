"use client";
import Link from "next/link";
import { ArrowRight, Play, TrendingUp, Shield, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-900">

      {/* Background Image */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath fill-rule='evenodd' d='M11 0l5 20H6l5-20zm42 31a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM0 72h40v4H0v-4zm0-8h31.999v4H0v-4zm20-16h20v4H20v-4zM0 56h40v4H0v-4zm63-25a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM53 41a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-30 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-28-8a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zM56 5a5 5 0 0 0-10 0h10zm10 0a5 5 0 0 1-10 0h10zm-3 46a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'/%3E%3C/g%3E%3C/svg%3E")` }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-32 right-[10%] w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-72 h-72 bg-gold-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-3xl" />

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes slideUpFade {
          0%   { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          0%   { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-8px);  }
        }
        @keyframes floatSide {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50%       { box-shadow: 0 0 20px 6px rgba(139, 92, 246, 0.2); }
        }
        @keyframes pulseGlowGreen {
          0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
          50%       { box-shadow: 0 16px 48px rgba(16, 185, 129, 0.2); }
        }
        .anim-slide-up    { animation: slideUpFade   0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-slide-right { animation: slideInRight  0.8s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-float-ud    { animation: floatUpDown   3.5s ease-in-out infinite; }
        .anim-float-side  { animation: floatSide     4s ease-in-out infinite; }
        .anim-pulse-glow  { animation: pulseGlow     2.5s ease-in-out infinite; }
        .anim-pulse-green { animation: pulseGlowGreen 3s ease-in-out infinite; }
      `}</style>

      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="anim-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              <span className="text-white/70 text-xs font-semibold tracking-wide uppercase flex-shrink-0">
                Powered by
              </span>
              <img
                src="/interswitch-logo.svg"
                alt="Interswitch"
                className="h-6 w-auto"
              />
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                Built for Africa
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Payments that work{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-gold-400 italic">
                for every farmer
              </span>
            </h1>

            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-lg">
              JustAgro is an end-to-end agricultural payment platform that connects farmers,
              aggregators, and buyers through verified Interswitch transactions, real-time
              inventory management, and AI-powered market intelligence.
            </p>

            {/* Proof points */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />,     text: "Server-verified payments" },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "AI fraud detection" },
                { icon: <Zap className="w-3.5 h-3.5" />,        text: "Instant PDF receipts" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                  <div className="text-emerald-400">{p.icon}</div>
                  {p.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 px-7 py-4 rounded-xl text-sm font-bold hover:bg-gold-50 transition-all shadow-xl group">
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-7 py-4 rounded-xl text-sm font-semibold hover:bg-white/8 transition-all">
                <Play className="w-3.5 h-3.5 fill-white" />
                See How It Works
              </a>
            </div>
          </div>

          {/* Right — dashboard preview */}
          <div className="hidden lg:block">
            <div
              className="relative anim-slide-right"
              style={{ animationDelay: "0.35s" }}
            >

              {/* Main dashboard card — slides in, no float after */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Platform Overview</p>
                    <p className="text-white text-lg font-bold mt-0.5">Live Dashboard</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-semibold">Live</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Transactions", value: "1,240", change: "+12%" },
                    { label: "Volume",       value: "₦4.8M", change: "+8%" },
                    { label: "Farmers",      value: "312",   change: "+24%" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/8 rounded-xl p-3">
                      <p className="text-white/50 text-xs mb-1">{s.label}</p>
                      <p className="text-white font-bold text-base">{s.value}</p>
                      <p className="text-emerald-400 text-xs font-semibold">{s.change}</p>
                    </div>
                  ))}
                </div>

                {/* Transactions list */}
                <div className="space-y-2">
                  {[
                    { name: "Emeka Okafor", crop: "Maize · 500kg", amount: "₦90,000", status: "PAID" },
                    { name: "Fatima Bello",  crop: "Rice · 200kg",  amount: "₦56,000", status: "PENDING" },
                    { name: "Chidi Nwosu",   crop: "Yam · 300kg",   amount: "₦45,000", status: "PAID" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{t.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold">{t.name}</p>
                          <p className="text-white/45 text-xs">{t.crop}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-xs font-bold">{t.amount}</p>
                        <span className={`text-xs font-semibold ${
                          t.status === "PAID" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom notification */}
              <div
                className="absolute -bottom-16 -left-10 bg-white rounded-2xl p-4 flex items-center gap-3 w-64"
                style={{ animation: "floatUpDown 3.5s ease-in-out infinite, pulseGlowGreen 3s ease-in-out infinite" }}
              >
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-xs font-bold">Payment Verified</p>
                  <p className="text-slate-400 text-xs">₦90,000 · Interswitch confirmed</p>
                </div>
              </div>

              {/* AI badge*/}
              <div
                className="absolute -top-7 -right-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-3 flex items-center gap-2"
                style={{ animation: "floatSide 4s ease-in-out infinite 0.5s, pulseGlow 2.5s ease-in-out infinite" }}
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">AI Risk Check</p>
                  <p className="text-white/70 text-xs">LOW risk · Approved</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

