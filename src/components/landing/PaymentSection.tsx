"use client";
import Link from "next/link";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { Shield, CheckCircle, CreditCard, Smartphone, Building, ArrowRight, Lock } from "lucide-react";

const steps = [
  { num: "01", title: "Transaction Created",      desc: "Aggregator logs the delivery — farmer, produce, quantity, and buyer are selected. A unique reference is generated." },
  { num: "02", title: "Buyer Notified Instantly",  desc: "Payment link sent via WhatsApp and SMS through Termii. Buyer receives amount, farmer name, and a direct pay link." },
  { num: "03", title: "Interswitch Checkout",      desc: "Buyer opens the link on any device. No login required. Interswitch popup handles card, bank transfer, and USSD." },
  { num: "04", title: "Server-Side Verification",  desc: "Backend calls Interswitch gettransaction.json independently. Client response alone is never trusted." },
  { num: "05", title: "Wallet Credited + Receipt", desc: "Farmer wallet updated immediately. PDF receipt generated. All parties notified by SMS and WhatsApp." },
];

const methods = [
  { icon: <CreditCard className="w-5 h-5" />,   label: "Debit Card",     sub: "Verve, Visa, Mastercard" },
  { icon: <Building className="w-5 h-5" />,     label: "Bank Transfer",  sub: "All Nigerian banks" },
  { icon: <Smartphone className="w-5 h-5" />,   label: "USSD",           sub: "*737# and others" },
];

export default function PaymentSection() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-brand-900 overflow-hidden" id="payments">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Payment Infrastructure</span>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-white mt-3 mb-5 leading-tight">
              Interswitch-powered. Server-verified. Always trusted.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Every payment on JustAgro is processed through Interswitch and independently
              verified server-side before any wallet is credited. The client callback alone
              is never trusted — preventing fraud at the infrastructure level.
            </p>

            {/* Payment methods */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {methods.map((m, i) => (
                <div key={i} className="bg-white/8 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-emerald-400 flex justify-center mb-2">{m.icon}</div>
                  <p className="text-white text-xs font-semibold">{m.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-xl p-4">
              <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">End-to-end verified</p>
                <p className="text-white/50 text-xs">
                  ResponseCode "00" + amount match required before any transaction is marked PAID
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/browse"
                className="inline-flex items-center gap-2 bg-white text-brand-900 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-gold-50 transition-colors group">
                Browse Available Produce
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right — flow */}
          <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 bg-white/6 border border-white/8 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="flex-shrink-0">
                    <span className="font-display text-white/20 text-2xl font-bold">{step.num}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <p className="text-white text-sm font-semibold">{step.title}</p>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payout note */}
            <div className="mt-5 bg-gold-400/10 border border-gold-400/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Farmer Withdrawal via Interswitch Payouts</p>
                  <p className="text-white/55 text-sm leading-relaxed">
                    Farmers can withdraw their wallet balance to any Nigerian bank account
                    through the Interswitch BANK_TRANSFER Payouts API. Funds arrive within 1–24 hours.
                    1% platform fee retained per transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
