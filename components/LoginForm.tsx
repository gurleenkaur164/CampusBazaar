"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? "university.edu";

export default function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Use your campus email (@${ALLOWED_DOMAIN}) to sign in.`);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Static URL so it always matches Supabase's whitelist; the post-login
        // destination is tracked via cookie, set by the middleware.
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message || "Couldn't send the email. Try again in a moment.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 overflow-hidden">
      {/* Animated backdrop blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-[460px] h-[460px] -top-32 -left-32 rounded-full bg-gradient-to-br from-mint to-transparent opacity-60 blur-3xl animate-floatY" />
        <div className="absolute w-[380px] h-[380px] top-1/3 -right-24 rounded-full bg-gradient-to-br from-coral to-transparent opacity-50 blur-3xl animate-floatY [animation-duration:9s]" />
        <div className="absolute w-[320px] h-[320px] bottom-0 left-1/4 rounded-full bg-gradient-to-br from-peri to-transparent opacity-40 blur-3xl animate-floatY [animation-duration:11s]" />
        <span className="absolute text-5xl top-[12%] left-[16%] opacity-70 animate-floatY select-none" aria-hidden>📚</span>
        <span className="absolute text-4xl top-[70%] left-[12%] opacity-60 animate-floatY [animation-duration:7s] select-none" aria-hidden>🛹</span>
        <span className="absolute text-5xl top-[20%] right-[14%] opacity-70 animate-floatY [animation-duration:8s] select-none" aria-hidden>🎧</span>
        <span className="absolute text-4xl bottom-[16%] right-[20%] opacity-60 animate-floatY [animation-duration:10s] select-none" aria-hidden>🪴</span>
      </div>

      <div
        className="relative bg-card border-[3px] border-ink rounded-chunky p-9 sm:p-12 max-w-md w-full text-center animate-popIn"
        style={{ boxShadow: "12px 16px 0px rgba(46,26,71,0.18), 0 30px 60px -20px rgba(46,26,71,0.35)" }}
      >
        {/* Back to browse link */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-[12px] text-grapeLight hover:text-grape font-medium flex items-center gap-1 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 1L3 6l5 5" />
          </svg>
          Browse
        </Link>

        {/* Brand */}
        <h1 className="font-display text-3xl sm:text-4xl text-grape mb-2">
          Campus
          <span className="bg-coral text-white px-2.5 py-0.5 rounded-xl ml-1.5 -rotate-2 inline-block shadow-pill">
            Bazaar
          </span>{" "}
          🛍️
        </h1>
        <p className="text-grapeLight text-sm mb-8">
          {next === "/post"
            ? "Sign in to list an item for sale 🏷️"
            : next !== "/"
            ? `Sign in to continue → ${next}`
            : "Sign in with your campus email to get started"}
        </p>

        {sent ? (
          /* Success state */
          <div className="animate-popIn">
            <div className="text-6xl mb-4 animate-floatY">📬</div>
            <div className="text-sm bg-mint/40 border-2 border-mintDark rounded-2xl p-5 mb-4">
              <p className="font-semibold text-grape mb-1">Magic link sent!</p>
              Check your inbox — we sent a link to{" "}
              <b className="break-all">{email}</b>. Tap it on this device to finish signing in.
            </div>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-grapeLight hover:text-grape underline transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Floating label input */}
            <div className="floating-label-group">
              <input
                id="email"
                type="email"
                required
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <label htmlFor="email">Campus email · you@{ALLOWED_DOMAIN}</label>
            </div>

            {error && (
              <p className="text-coralDark text-xs font-medium bg-coral/10 border border-coral/30 rounded-xl px-4 py-2 animate-slideRight">
                ⚠️ {error}
              </p>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-coral text-white border-2 border-ink py-3.5 rounded-2xl font-semibold shadow-btn btn-press transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {/* Shimmer on hover */}
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[100%] transition-transform duration-500" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Sending…
                </span>
              ) : (
                "Send magic link ✨"
              )}
            </button>
          </form>
        )}

        <p className="text-[11px] text-grapeLight mt-6">
          🔒 No passwords. We only verify you actually go here.
        </p>
      </div>
    </div>
  );
}
