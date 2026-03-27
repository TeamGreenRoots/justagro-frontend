"use client";
import { useIntersection } from "@/hooks/landing/useIntersection";

const stats = [
  { value: "3",   unit: "Roles",       label: "Farmer · Buyer · Aggregator", sub: "One platform connecting the full chain" },
  { value: "1%",  unit: "Fee",         label: "Per verified transaction",     sub: "Transparent, fixed, no hidden charges" },
  { value: "4",   unit: "AI Features", label: "Fraud · Price · Market · Advice", sub: "Gemini 1.5 Flash embedded in every workflow" },
  { value: "3",   unit: "Channels",    label: "In-app · SMS · WhatsApp",      sub: "Every payment event, every participant notified" },
];

export default function StatsSection() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-20 bg-brand-900">
      <div className="max-w-6xl mx-auto px-6">
        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-center">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="font-display text-5xl font-bold text-white">{s.value}</span>
                  <span className="text-emerald-400 font-semibold text-base mb-2">{s.unit}</span>
                </div>
                <p className="text-white/80 text-sm font-semibold mb-1">{s.label}</p>
                <p className="text-white/40 text-xs">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
