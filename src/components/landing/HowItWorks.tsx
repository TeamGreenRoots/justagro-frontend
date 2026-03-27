"use client";
import Link from "next/link";
import { useIntersection } from "@/hooks/landing/useIntersection";
import { Building2, Wheat, ShoppingCart, ClipboardList, Send, CreditCard, FileCheck, Banknote, ArrowRight } from "lucide-react";

const roles = [
  {
    id:    "aggregator",
    icon:  <Building2 className="w-6 h-6" />,
    title: "Aggregator",
    sub:   "The operational hub",
    color: "bg-purple-900",
    accent:"bg-purple-50 text-purple-700 border-purple-100",
    steps: [
      { icon: <ClipboardList className="w-4 h-4" />, text: "Register farmers — online or on their behalf if they have no smartphone" },
      { icon: <Wheat className="w-4 h-4" />,         text: "Log farm inventory with crop type, quantity, and price per kg" },
      { icon: <ShoppingCart className="w-4 h-4" />,  text: "Create a transaction by connecting available produce to a buyer" },
      { icon: <Send className="w-4 h-4" />,          text: "Payment link sent automatically to buyer via WhatsApp and SMS" },
      { icon: <FileCheck className="w-4 h-4" />,     text: "Track all payments, run AI fraud checks, view platform analytics" },
    ],
    cta:   { label: "Register as Aggregator", href: "/register?role=AGGREGATOR" },
  },
  {
    id:    "buyer",
    icon:  <ShoppingCart className="w-6 h-6" />,
    title: "Buyer",
    sub:   "Simple and secure",
    color: "bg-blue-900",
    accent:"bg-blue-50 text-blue-700 border-blue-100",
    steps: [
      { icon: <Wheat className="w-4 h-4" />,         text: "Browse available produce from verified farmers across Nigeria" },
      { icon: <Send className="w-4 h-4" />,          text: "Receive a secure payment link on WhatsApp or SMS — no app needed" },
      { icon: <CreditCard className="w-4 h-4" />,    text: "Pay via Interswitch — Card, Bank Transfer, or USSD" },
      { icon: <FileCheck className="w-4 h-4" />,     text: "Download an official PDF receipt instantly on confirmation" },
      { icon: <ClipboardList className="w-4 h-4" />, text: "View full order history on your buyer dashboard" },
    ],
    cta:   { label: "Register as Buyer", href: "/register?role=BUYER" },
  },
  {
    id:    "farmer",
    icon:  <Wheat className="w-6 h-6" />,
    title: "Farmer",
    sub:   "Get paid. Build history.",
    color: "bg-brand-900",
    accent:"bg-emerald-50 text-emerald-700 border-emerald-100",
    steps: [
      { icon: <ClipboardList className="w-4 h-4" />, text: "List your produce — crop type, quantity available, price per kg" },
      { icon: <CreditCard className="w-4 h-4" />,    text: "Buyer pays through Interswitch — funds credited to your wallet" },
      { icon: <Send className="w-4 h-4" />,          text: "Receive instant SMS and WhatsApp payment confirmation" },
      { icon: <FileCheck className="w-4 h-4" />,     text: "Every transaction builds your verifiable financial history" },
      { icon: <Banknote className="w-4 h-4" />,      text: "Withdraw earnings to any Nigerian bank account at any time" },
    ],
    cta:   { label: "Register as Farmer", href: "/register?role=FARMER" },
  },
];

export default function HowItWorks() {
  const { ref, visible } = useIntersection();

  return (
    <section className="py-24 bg-slate-50" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-600 text-xs font-bold uppercase tracking-widest">How It Works</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-slate-900 mt-3 mb-4">
            Three roles. One platform.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Every participant has a purpose. Every interaction is recorded. Every payment is verified.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <div
              key={role.id}
              className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden h-full flex flex-col">
                
                <div className={`${role.color} p-6`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">
                    {role.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-1">{role.title}</h3>
                  <p className="text-white/60 text-sm">{role.sub}</p>
                </div>

                {/* Steps */}
                <div className="p-6 flex-1">
                  <ul className="space-y-4">
                    {role.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${role.accent}`}>
                          {step.icon}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-6 pb-6">
                  <Link href={role.cta.href}
                    className="w-full flex items-center justify-center gap-2 bg-brand-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors group">
                    {role.cta.label}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
