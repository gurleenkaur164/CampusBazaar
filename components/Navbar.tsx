"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Notification, Profile } from "@/lib/types";
import NotificationBell from "./NotificationBell";
import AuthModal from "./AuthModal";

export default function Navbar({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; reason: string; next: string }>({
    open: false, reason: "", next: "/"
  });

  // Deepen navbar shadow when user scrolls
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!profile) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data ?? []));

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
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function openAuthModal(reason: string, next: string) {
    setAuthModal({ open: true, reason, next });
  }

  const navLink = (href: string, label: string, requiresAuth = false) => {
    const active = pathname === href;
    if (requiresAuth && !profile) {
      return (
        <button
          key={label}
          onClick={() => openAuthModal(`Sign in to access ${label}`, href)}
          className={`hidden sm:inline-block px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            active ? "bg-ink text-card shadow-pill" : "text-grape hover:bg-line/60"
          }`}
        >
          {label}
        </button>
      );
    }
    return (
      <Link
        key={label}
        href={href}
        className={`hidden sm:inline-block px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          active ? "bg-ink text-card shadow-pill" : "text-grape hover:bg-line/60"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 transition-all duration-300 ${
          scrolled
            ? "glass border-b-[3px] border-ink shadow-glass"
            : "bg-card/85 backdrop-blur-md border-b-[3px] border-ink"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="font-display font-extrabold text-xl sm:text-2xl text-grape flex items-center gap-1.5 shrink-0">
          Campus
          <span className="bg-coral text-white px-2.5 py-0.5 rounded-xl -rotate-3 inline-block text-base sm:text-lg shadow-pill transition-transform hover:rotate-0 hover:scale-105 duration-200">
            Bazaar
          </span>
          <span className="hidden xs:inline">🛍️</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {navLink("/", "Browse")}
          {navLink("/inbox", "Messages", true)}
          {navLink("/my-listings", "My stuff", true)}

          {profile ? (
            <>
              <NotificationBell notifications={notifications} setNotifications={setNotifications} />

              {/* Sell button */}
              <Link
                href="/post"
                className="bg-coral text-white border-2 border-ink px-3 sm:px-4 py-2 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-all hover:shadow-glow"
              >
                + Sell
              </Link>

              {/* Profile menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-10 h-10 rounded-full bg-mint border-2 border-ink flex items-center justify-center text-sm shadow-pill btn-press transition-all hover:scale-105"
                  title={profile.name}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {profile.avatar_emoji}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 glass border-2 border-ink rounded-2xl shadow-chunkyHover overflow-hidden animate-popIn">
                      <div className="px-4 py-3 border-b border-line/60">
                        <p className="font-semibold text-sm truncate">{profile.name}</p>
                        <p className="text-[11px] text-grapeLight">{profile.hostel ?? "On campus"}</p>
                      </div>
                      <Link href="/inbox" className="block sm:hidden px-4 py-2.5 text-sm hover:bg-peri/10 transition-colors">Messages</Link>
                      <Link href="/my-listings" className="block sm:hidden px-4 py-2.5 text-sm hover:bg-peri/10 transition-colors">My stuff</Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-coralDark font-semibold hover:bg-coral/10 transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Guest mode — show Sign In CTA */
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-coral text-white border-2 border-ink px-4 py-2 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-all hover:shadow-glow"
            >
              Sign in ✨
            </Link>
          )}
        </div>
      </nav>

      {/* Auth modal */}
      {authModal.open && (
        <AuthModal
          reason={authModal.reason}
          nextPath={authModal.next}
          onClose={() => setAuthModal((s) => ({ ...s, open: false }))}
        />
      )}
    </>
  );
}
