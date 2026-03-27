"use client";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { Smartphone, FileText, Bell, UserPlus, Package, BarChart3, ArrowLeftRight, ShieldCheck
} from "lucide-react";

const features = [
  {
    icon:  <ShieldCheck className="w-5 h-5" />,
    title: "Offline Farmer Registration",
    desc:  "Aggregators can register farmers who own no smartphone. The farmer's phone number becomes their password. They receive SMS notifications for every payment without ever opening an app.",
    color: "bg-brand-50 text-brand-700",
  },
  {
    icon:  <Package className="w-5 h-5" />,
    title: "Inventory Lifecycle",
    desc:  "Every item moves through AVAILABLE → RESERVED → SOLD. Stock is reserved the moment a transaction is created and released back if the transaction is cancelled.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon:  <Bell className="w-5 h-5" />,
    title: "Multi-Channel Notifications",
    desc:  "Every payment event triggers three simultaneous notifications: in-app (10 second polling), SMS via Termii, and WhatsApp via Termii. Nothing goes unseen.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon:  <FileText className="w-5 h-5" />,
    title: "PDF Receipts On Demand",
    desc:  "Every confirmed payment generates a printable receipt. The buyer can download it from the payment page. Farmers can download from their transaction history. No third-party PDF library — uses the browser print API.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon:  <UserPlus className="w-5 h-5" />,
    title: "Buyer Contact Management",
    desc:  "Aggregators manage two types of buyers: platform-registered accounts and manually saved contacts. Both appear in the same dropdown. The transaction API handles the distinction automatically.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    icon:  <BarChart3 className="w-5 h-5" />,
    title: "Real-Time Analytics",
    desc:  "The aggregator dashboard shows a 7-day payment volume chart, pending transaction count, platform revenue, and farmer/buyer totals — updated on every page load.",
    color: "bg-slate-100 text-slate-700",
  },
  {
    icon:  <ArrowLeftRight className="w-5 h-5" />,
    title: "Wallet and Withdrawals",
    desc:  "Each farmer has a wallet credited on every confirmed payment (99% of total, 1% platform fee). Farmers withdraw to any Nigerian bank via Interswitch Payouts API with BANK_TRANSFER channel.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon:  <Smartphone className="w-5 h-5" />,
    title: "Public Payment Page",
    desc:  "The /pay/:txnRef route requires no login. Any buyer with the link can pay from any device. Designed for the Nigerian reality where buyers may not own a smartphone but can access a link.",
    color: "bg-teal-50 text-teal-700",
  },
];

export default function FeaturesSection() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">Platform Features</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mt-3 mb-4">
            Built for the Nigerian market. Designed to scale.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Every feature is a direct response to a real operational challenge
            faced by farmers, aggregators, and buyers in Nigeria today.
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full hover:shadow-card transition-shadow hover:-translate-y-0.5 duration-200">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
