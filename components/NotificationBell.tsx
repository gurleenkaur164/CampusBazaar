"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

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

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative w-10 h-10 bg-white border-2 border-ink rounded-2xl flex items-center justify-center shadow-btn btn-press transition-transform"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-12 right-0 w-[19rem] bg-card border-2 border-ink rounded-2xl shadow-chunkyHover overflow-hidden z-50 animate-popIn">
            <div className="px-4 py-3 bg-coral text-white font-display font-bold">Notifications</div>
            <div className="max-h-80 overflow-y-auto nice-scroll">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-sm text-grapeLight text-center">
                  Nothing yet-go list something or accept a request!
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 border-b border-line text-sm hover:bg-white/60"
                  >
                    <p className="leading-snug">{n.message}</p>
                    <span className="text-[11px] text-grapeLight">{relativeTime(n.created_at)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
