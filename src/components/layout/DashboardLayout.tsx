"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf, LayoutDashboard, Package, Users, LogOut,
  Bell, Menu, X, ChevronRight, Wheat, ShoppingBag,
  ClipboardList, UserPlus, BarChart3,
  TrendingUp,
} from "lucide-react";
import { getUser, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navByRole: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  FARMER: [
    { label: "Dashboard",     href: "/dashboard/farmer",              icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "My Inventory",  href: "/dashboard/farmer/inventory",    icon: <Wheat className="w-4 h-4" /> },
    { label: "Transactions",  href: "/dashboard/farmer/transactions", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Withdraw Funds",href: "/dashboard/farmer/withdraw",     icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Notifications", href: "/dashboard/farmer/notifications",icon: <Bell className="w-4 h-4" /> },
  ],
  BUYER: [
    { label: "Dashboard",     href: "/dashboard/buyer",               icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Browse Produce",href: "/browse",                         icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "My Orders",     href: "/dashboard/buyer/orders",        icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "Notifications", href: "/dashboard/buyer/notifications", icon: <Bell className="w-4 h-4" /> },
  ],
  AGGREGATOR: [
    { label: "Overview",      href: "/dashboard/aggregator",          icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Farmers",       href: "/dashboard/aggregator/farmers",  icon: <Users className="w-4 h-4" /> },
    { label: "Inventory",     href: "/dashboard/aggregator/inventory",icon: <Wheat className="w-4 h-4" /> },
    { label: "Transactions",  href: "/dashboard/aggregator/transactions", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Buyers",        href: "/dashboard/aggregator/buyers",   icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "Add Farmer",    href: "/dashboard/aggregator/add-farmer", icon: <UserPlus className="w-4 h-4" /> },
    { label: "Notifications", href: "/dashboard/aggregator/notifications", icon: <Bell className="w-4 h-4" /> },
  ],
};

const roleColor: Record<string, string> = {
  FARMER:     "bg-emerald-100 text-emerald-700",
  BUYER:      "bg-blue-100 text-blue-700",
  AGGREGATOR: "bg-purple-100 text-purple-700",
};

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user     = getUser();
  if (!user) return null;
  const nav = navByRole[user.role] || [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-brand-900">JustAgro</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block", roleColor[user.role])}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children, title }: {
  children: React.ReactNode;
  title?:   string;
}) {
  const router  = useRouter();
  const user    = getUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:flex lg:flex-col z-30">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-900 rounded-lg flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-semibold text-brand-900">JustAgro</span>
        </div>
        <button aria-label="open" onClick={() => setOpen(true)} className="text-slate-600">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
          <button
            aria-label="close menu"

            onClick={() => setOpen(false)}
            className="absolute top-4 left-68 text-white"
            style={{ left: "270px" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main */}
      <main className="lg:ml-60 min-h-screen">
        <div className="p-5 lg:p-8">
          {title && (
            <h1 className="font-display text-2xl font-semibold text-slate-900 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
