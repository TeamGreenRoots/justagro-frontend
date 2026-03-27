"use client";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { XCircle, TrendingDown, AlertTriangle, UserX } from "lucide-react";

const problems = [
  {
    icon: <UserX className="w-5 h-5" />,
    stat: "36M+",
    label: "Smallholder farmers in Nigeria",
    desc: "The backbone of Nigeria's food supply — yet most are financially invisible to banks, lenders, and institutions.",
    color: "bg-red-50 text-red-600 border-red-100",
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    stat: "< 5%",
    label: "Have formal financial access",
    desc: "Without a transaction history, farmers cannot access credit, insurance, or banking products that could grow their business.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: <XCircle className="w-5 h-5" />,
    stat: "0",
    label: "Verifiable payment records",
    desc: "Cash exchanges mean no receipts, no audit trail, and no proof of income — every transaction disappears after it happens.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    stat: "Manual",
    label: "Everything tracked in notebooks",
    desc: "Aggregators manually reconcile transactions in spreadsheets or paper ledgers — creating errors, disputes, and lost revenue.",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

export default function ProblemSection() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-white" id="problem">
      <div className="max-w-6xl mx-auto px-6">
        <div
          ref={ref}
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="max-w-2xl mb-14">
            <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">The Problem</span>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mt-3 mb-4 leading-tight">
              Nigerian agriculture runs on trust and handshakes.
              <span className="text-slate-400"> That needs to change.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Farmers deliver produce, receive cash, and walk away with nothing verifiable.
              No receipt. No record. No financial identity. JustAgro changes this at the point of transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {problems.map((p, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`rounded-2xl border p-5 h-full ${p.color}`}>
                  <div className="mb-4">{p.icon}</div>
                  <p className="font-display text-3xl font-bold mb-1">{p.stat}</p>
                  <p className="font-semibold text-sm mb-2">{p.label}</p>
                  <p className="text-sm leading-relaxed opacity-80">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
