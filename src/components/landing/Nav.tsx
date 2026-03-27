"use client";
import Link from "next/link";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useScrolled } from "@/hooks/landing/useScrolled";

export default function Nav() {
  const scrolled = useScrolled(30);
  const [open, setOpen] = useState(false);

  const linkClass = scrolled
    ? "text-slate-900 hover:text-brand-700 font-semibold"
    : "text-white/85 hover:text-white font-medium";

  const signInClass = scrolled
    ? "text-slate-900 hover:text-brand-700 font-bold"
    : "text-white/90 hover:text-white font-semibold";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-white shadow-sm border-b border-slate-100"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center group-hover:bg-brand-800 transition-colors">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className={`font-display text-xl font-bold transition-colors ${
            scrolled ? "text-brand-900" : "text-white"
          }`}>
            JustAgro
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it Works",   href: "#how-it-works" },
            { label: "Features",       href: "#features" },
            { label: "AI Platform",    href: "#ai" },
            { label: "Browse Produce", href: "/browse" },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              className={`text-sm transition-colors ${linkClass}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className={`text-sm transition-colors ${signInClass}`}>
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-brand-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-800 transition-all shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2">
          {open
            ? <X    className={`w-5 h-5 ${scrolled ? "text-slate-900" : "text-white"}`} />
            : <Menu className={`w-5 h-5 ${scrolled ? "text-slate-900" : "text-white"}`} />
          }
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-5 space-y-4 shadow-lg">
          {[
            { label: "How it Works",   href: "#how-it-works" },
            { label: "Features",       href: "#features" },
            { label: "AI Platform",    href: "#ai" },
            { label: "Browse Produce", href: "/browse" },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-slate-900 hover:text-brand-700 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-brand-700 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-brand-900 text-white text-sm font-bold px-5 py-3 rounded-xl text-center hover:bg-brand-800 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}


