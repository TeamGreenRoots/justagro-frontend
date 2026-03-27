"use client";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Get Started</span>
        <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mt-3 mb-5 leading-tight">
          The infrastructure already exists.
          <span className="text-brand-600"> The data starts with you.</span>
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Register in under two minutes. Start transacting. Every payment you record
          creates a trail of verified agricultural commerce that outlasts the transaction itself.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/register"
            className="inline-flex items-center justify-center gap-2 bg-brand-900 text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-brand-800 transition-all shadow-lg hover:shadow-xl group">
            Create Free Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/browse"
            className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl text-sm font-semibold hover:border-brand-300 hover:text-brand-700 transition-all">
            Browse Produce
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Demo accounts */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-xl mx-auto text-left">
          <p className="text-slate-700 text-sm font-bold mb-3">Demo Accounts</p>
          <div className="space-y-2">
            {[
              { role: "Aggregator",              phone: "08000000001", note: "Full platform access" },
              { role: "Farmer (with history)",   phone: "08000000002", note: "Stock + paid transactions" },
              { role: "Buyer",                   phone: "08000000004", note: "Pending and paid orders" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="text-slate-800 text-xs font-semibold">{a.role}</span>
                  <span className="text-slate-400 text-xs ml-2">· {a.note}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-slate-600">{a.phone}</span>
                  <span className="text-slate-400 text-xs ml-2">/ demo1234</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">
            Test payment link: <span className="font-mono">/pay/AGT_1717200000000_0003</span>
          </p>
        </div>
      </div>
    </section>
  );
}
