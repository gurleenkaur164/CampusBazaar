"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Notification, Profile } from "@/lib/types";
import NotificationBell from "./NotificationBell";

export default function Navbar({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // initial fetch
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data ?? []));

    // realtime: new notifications land instantly without a refresh
    const channel = supabase
      .channel("notifications-" + profile.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-card border-b-[3px] border-ink sticky top-0 z-50">
      <Link href="/" className="font-display font-extrabold text-2xl text-grape flex items-center gap-2">
        Campus
        <span className="bg-coral text-white px-2.5 py-0.5 rounded-xl -rotate-3 inline-block text-lg">
          Bazaar
        </span>
        🛍️
      </Link>
      <div className="flex items-center gap-4">
        <NotificationBell notifications={notifications} setNotifications={setNotifications} />
        <Link
          href="/post"
          className="bg-coral text-white border-2 border-ink px-4 py-2 rounded-2xl font-semibold text-sm shadow-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          + Sell
        </Link>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-mint border-2 border-ink flex items-center justify-center font-bold text-sm"
          title={profile.name}
        >
          {profile.avatar_emoji}
        </button>
      </div>
    </nav>
  );
}
