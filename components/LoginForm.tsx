"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-[460px] h-[460px] -top-32 -left-32 rounded-full bg-gradient-to-br from-mint to-transparent opacity-60 blur-3xl animate-floatY" />
        <div className="absolute w-[380px] h-[380px] top-1/3 -right-24 rounded-full bg-gradient-to-br from-coral to-transparent opacity-50 blur-3xl animate-floatY [animation-duration:9s]" />
        <div className="absolute w-[320px] h-[320px] bottom-0 left-1/4 rounded-full bg-gradient-to-br from-peri to-transparent opacity-40 blur-3xl animate-floatY [animation-duration:11s]" />
        <span className="absolute text-5xl top-[12%] left-[16%] opacity-70 animate-floatY">📚</span>
        <span className="absolute text-4xl top-[70%] left-[12%] opacity-60 animate-floatY [animation-duration:7s]">🛹</span>
        <span className="absolute text-5xl top-[20%] right-[14%] opacity-70 animate-floatY [animation-duration:8s]">🎧</span>
        <span className="absolute text-4xl bottom-[16%] right-[20%] opacity-60 animate-floatY [animation-duration:10s]">🪴</span>
      </div>

      <div
        className="relative bg-card border-[3px] border-ink rounded-chunky p-9 sm:p-12 max-w-md w-full text-center"
        style={{ boxShadow: "12px 16px 0px rgba(46,26,71,0.18), 0 30px 60px -20px rgba(46,26,71,0.35)" }}
      >
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
            : "Sign in with your campus email to get started"}
        </p>

        {sent ? (
          <div className="text-sm bg-mint/40 border-2 border-mintDark rounded-2xl p-5">
            <div className="text-3xl mb-1">📬</div>
            Check your inbox — we sent a magic link to{" "}
            <b className="break-all">{email}</b>. Tap it on this device to finish signing in.
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder={`you@${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-ink outline-none text-sm focus:shadow-btn transition-shadow"
            />
            {error && <p className="text-coralDark text-xs font-medium">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-coral text-white border-2 border-ink py-3.5 rounded-2xl font-semibold shadow-btn btn-press transition-transform disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send magic link ✨"}
            </button>
          </form>
        )}

        <p className="text-[11px] text-grapeLight mt-6">
           No passwords. We only verify you actually go here.
        </p>
      </div>
    </div>
  );
}
