"use client";
import Link from "next/link";
import { Leaf } from "lucide-react";

const links = {
  Platform: [
    { label: "Browse Produce",    href: "/browse" },
    { label: "Register",          href: "/register" },
    { label: "Sign In",           href: "/login" },
    { label: "API Documentation", href: "https://justagro-backend.onrender.com/api-docs" },
  ],
  Roles: [
    { label: "For Farmers",      href: "/register?role=FARMER" },
    { label: "For Buyers",       href: "/register?role=BUYER" },
    { label: "For Aggregators",  href: "/register?role=AGGREGATOR" },
  ],
  Built_With: [
    { label: "Interswitch",  href: "https://docs.interswitchgroup.com" },
    { label: "Gemini AI",    href: "https://ai.google.dev" },
    { label: "Termii",       href: "https://developers.termii.com" },
    { label: "Neon Postgres",href: "https://neon.tech" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-white text-xl font-semibold">JustAgro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xs">
              End-to-end agricultural payment and inventory platform. Connecting Nigerian
              farmers, aggregators, and buyers through verified Interswitch transactions.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-xs">Live at justagro.vercel.app</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                {title.replace("_", " ")}
              </h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            Built by TeamGreenRoots · Interswitch | Enyata Hackathon 2026
          </p>
          <p className="text-slate-600 text-xs">©JustAgro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
