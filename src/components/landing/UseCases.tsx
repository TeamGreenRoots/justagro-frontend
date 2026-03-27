"use client";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { Wheat, Building2, ShoppingCart, Landmark, TrendingUp, Globe } from "lucide-react";

const cases = [
  {
    icon:  <Wheat className="w-5 h-5" />,
    who:   "A rice farmer in Kebbi State",
    story: "Has never had a bank account. An aggregator registers him on JustAgro. His first transaction creates a verifiable payment record. Six months later, that record is his financial identity.",
    color: "border-l-brand-900",
  },
  {
    icon:  <Building2 className="w-5 h-5" />,
    who:   "A Lagos-based food processing company",
    story: "Sources maize from 40 different farmers. Before JustAgro, reconciliation took days. Now every delivery is logged, paid, and receipted in minutes — with an AI fraud check before every release.",
    color: "border-l-purple-600",
  },
  {
    icon:  <ShoppingCart className="w-5 h-5" />,
    who:   "A wholesale buyer in Onitsha market",
    story: "Receives a WhatsApp message with a payment link. Opens it on any phone. Pays via USSD. Downloads the receipt. No app, no account, no friction.",
    color: "border-l-blue-600",
  },
  {
    icon:  <Landmark className="w-5 h-5" />,
    who:   "A microfinance institution",
    story: "Wants to offer credit to smallholder farmers but has no data. JustAgro's transaction history becomes a credit assessment tool — real income, real payment patterns, real identity.",
    color: "border-l-amber-500",
  },
  {
    icon:  <TrendingUp className="w-5 h-5" />,
    who:   "A state ministry of agriculture",
    story: "Needs to track where produce moves, at what price, and whether farmers are being paid fairly. JustAgro's audit trail makes this visible for the first time.",
    color: "border-l-emerald-600",
  },
  {
    icon:  <Globe className="w-5 h-5" />,
    who:   "An impact investor or development bank",
    story: "Wants to deploy capital into Nigerian agriculture but has no reliable data on farm productivity or payment reliability. JustAgro is the data layer that makes this possible.",
    color: "border-l-rose-600",
  },
];

export default function UseCases() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Who Benefits</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mt-3 mb-4">
            Beyond the hackathon. Built for the ecosystem.
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            JustAgro is infrastructure. Every verified transaction builds data that has
            value far beyond the immediate payment — for lenders, institutions,
            governments, and investors who need to see Nigerian agriculture clearly.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cases.map((c, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`bg-white rounded-2xl p-6 border border-slate-100 border-l-4 ${c.color} shadow-card h-full`}>
                <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <p className="font-bold text-slate-900 text-sm mb-2">{c.who}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{c.story}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
