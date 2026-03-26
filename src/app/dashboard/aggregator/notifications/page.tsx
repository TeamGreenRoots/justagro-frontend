"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Spinner, Empty } from "@/components/ui";
import { formatDateTime, cn } from "@/lib/utils";
import type { Notification } from "@/types";

const fetchNotifs = () => api.get("/notifications?limit=50").then(r => r.data);

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [marking, setMarking] = useState(false);
  const [filter,  setFilter]  = useState<"all"|"unread">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn:  fetchNotifs,
    refetchInterval: 10000, // poll every 10 seconds
  });

  const notifications: Notification[] = data?.data      || [];
  const unreadCount                    = data?.unreadCount || 0;

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.isRead)
    : notifications;

  async function markOne(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch { /* silent */ }
  }

  async function markAllRead() {
    setMarking(true);
    try {
      await api.patch("/notifications/read-all");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    } finally { setMarking(false); }
  }

  const channelColor: Record<string, string> = {
    IN_APP:   "bg-blue-100 text-blue-700",
    SMS:      "bg-amber-100 text-amber-700",
    WHATSAPP: "bg-emerald-100 text-emerald-700",
  };

  return (
    <DashboardLayout title="Notifications">
    
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(["all","unread"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize",
                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
              {f === "unread" ? `Unread (${unreadCount})` : "All"}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={marking}
            className="flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors disabled:opacity-60">
            {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner text="Loading notifications..." />
      ) : (
        <Card>
          {filtered.length === 0 ? (
            <Empty
              title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
              desc="You'll see payment alerts, delivery updates, and platform news here"
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((n: Notification) => (
                <div key={n.id}
                  onClick={() => !n.isRead && markOne(n.id)}
                  className={cn(
                    "flex gap-4 px-6 py-4 transition-colors cursor-pointer",
                    n.isRead ? "hover:bg-slate-50" : "bg-brand-50/50 hover:bg-brand-50"
                  )}>
                  {/* Icon */}
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                    n.isRead ? "bg-slate-100" : "bg-brand-100")}>
                    <Bell className={cn("w-4 h-4", n.isRead ? "text-slate-400" : "text-brand-600")} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                        channelColor[n.channel] || "bg-slate-100 text-slate-600")}>
                        {n.channel.replace("_", " ")}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                      <span className="text-slate-400 text-xs ml-auto">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
