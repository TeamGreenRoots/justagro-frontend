"use client";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight, InboxIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
}
export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-slate-900 text-sm",
          "placeholder:text-slate-400 bg-white",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint  && <p className="text-slate-400 text-xs mt-1">{hint}</p>}
    </div>
  );
}


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <select
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-slate-900 text-sm bg-white",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "transition-all duration-150 cursor-pointer",
          error ? "border-red-400" : "border-slate-200 hover:border-slate-300",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <textarea
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-slate-900 text-sm bg-white resize-none",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "transition-all duration-150",
          error ? "border-red-400" : "border-slate-200 hover:border-slate-300",
          className
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
  icon?:    React.ReactNode;
}
export function Button({
  variant = "primary", size = "md", loading, icon,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-brand-900 text-white hover:bg-brand-800 shadow-sm hover:shadow-md",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    danger:    "bg-red-500 text-white hover:bg-red-600",
    ghost:     "text-slate-600 hover:bg-slate-100",
    outline:   "border-2 border-slate-200 text-slate-700 hover:border-slate-300 bg-white",
  };
  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-base",
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", className)}>
      {label}
    </span>
  );
}

// CARD 
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Spinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
}

export function Empty({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <InboxIcon className="w-7 h-7 text-slate-400" />
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      {desc && <p className="text-slate-400 text-sm mt-1">{desc}</p>}
    </div>
  );
}

interface PaginationProps {
  page:    number;
  pages:   number;
  total:   number;
  onPage:  (p: number) => void;
}
export function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
      <p className="text-sm text-slate-500">{total} total</p>
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous page"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-medium text-slate-700 px-2">
          {page} / {pages}
        </span>
        <button
          aria-label="Next page"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}


export function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color || "bg-brand-50 text-brand-700")}>
        {icon}
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
      <p className="font-bold text-xl text-slate-900">{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
// seperate this later if it grows too much, but for now it's just some shared UI components like buttons, inputs, cards, etc. that are used across the app.