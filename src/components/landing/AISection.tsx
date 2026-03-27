"use client";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { Brain, TrendingUp, AlertTriangle, BarChart3, Sparkles } from "lucide-react";

const features = [
  {
    icon:   <AlertTriangle className="w-5 h-5" />,
    title:  "Fraud Detection",
    role:   "Aggregator",
    color:  "bg-red-50 text-red-600 border-red-100",
    badge:  "bg-red-100 text-red-700",
    desc:   "Before releasing any payment, the aggregator can run an AI fraud check on the transaction. The model analyses the farmer's history, deal size relative to average, account age, buyer relationship, and flags anomalies.",
    output: "Returns: Risk score LOW / MEDIUM / HIGH · Specific flags · Recommendation to approve, review, or block",
  },
  {
    icon:   <TrendingUp className="w-5 h-5" />,
    title:  "Market Intelligence",
    role:   "Aggregator",
    color:  "bg-purple-50 text-purple-600 border-purple-100",
    badge:  "bg-purple-100 text-purple-700",
    desc:   "On every aggregator dashboard load, the AI analyses current platform inventory and generates a daily market briefing — which crops are in high demand, price trends to watch, and one actionable business tip.",
    output: "Returns: Daily headline · Top 3 demand crops · Price trend alert · Market sentiment",
  },
  {
    icon:   <BarChart3 className="w-5 h-5" />,
    title:  "Price Intelligence",
    role:   "Farmer / Aggregator",
    color:  "bg-blue-50 text-blue-600 border-blue-100",
    badge:  "bg-blue-100 text-blue-700",
    desc:   "For any item in inventory, the AI compares the listed price against current Nigerian market rates. It tells the farmer whether they are overpriced, underpriced, or fair — and by what percentage.",
    output: "Returns: Estimated market price · Percentage diff · Status FAIR / HIGH / LOW · Pricing advice",
  },
  {
    icon:   <Brain className="w-5 h-5" />,
    title:  "Personalised Farm Advice",
    role:   "Farmer",
    color:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge:  "bg-emerald-100 text-emerald-700",
    desc:   "The AI analyses a farmer's individual data — transaction count, average deal value, crop types, wallet balance, and available stock — and returns personalised business advice written in plain English.",
    output: "Returns: Performance summary · 3 actionable tips · Pricing observation · Motivational note",
  },
];

export default function AISection() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-slate-50" id="ai">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-widest">AI Platform · Powered by Google Gemini 1.5 Flash</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mb-4 leading-tight">
            Intelligence built into every decision
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            JustAgro embeds four distinct AI capabilities using Google Gemini 1.5 Flash.
            Not as a feature — as infrastructure. Each model call is prompted with real
            transaction data and returns structured JSON that drives the UI.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${f.color}`}>
                    {f.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badge}`}>
                    {f.role}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-slate-400 text-xs font-mono leading-relaxed">{f.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-slate-100 rounded-2xl p-6 flex items-start gap-4 shadow-card">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Resilient by design</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every AI endpoint has a hardcoded fallback object. If Gemini is unavailable, returns malformed JSON,
              or exceeds quota, the platform renders a sensible default without breaking. The frontend never
              shows an AI error to the user — it silently falls back to the pre-defined response.
              AI enhances the product; it is never a dependency for core functionality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
