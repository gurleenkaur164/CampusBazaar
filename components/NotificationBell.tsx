"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

export default function NotificationBell({
  notifications,
  setNotifications,
}: {
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAllRead() {
    setOpen((o) => !o);
    if (unreadCount === 0) return;
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={markAllRead}
        className="relative w-10 h-10 bg-white border-2 border-ink rounded-2xl flex items-center justify-center shadow-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[11px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center border-2 border-card">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-80 bg-card border-2 border-ink rounded-2xl shadow-chunkyHover overflow-hidden z-50">
          <div className="px-4 py-3 bg-coral text-white font-display font-bold">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-6 text-sm text-grapeLight text-center">
                Nothing yet — go list something! ✨
              </div>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "#"}
                className="block px-4 py-3 border-b border-line text-sm hover:bg-white/60"
              >
                <p>{n.message}</p>
                <span className="text-[11px] text-grapeLight">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
