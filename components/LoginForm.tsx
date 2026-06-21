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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Use your campus email (@${ALLOWED_DOMAIN}) to sign in.`);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // carry "next" through so the callback route knows where to send them back
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      console.error("Supabase signInWithOtp error:", error);
      setError(error.message || "Something went wrong sending the email. Check the console for details.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden bg-bg">
      {/* 3D floating background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-[460px] h-[460px] -top-32 -left-32 rounded-full bg-gradient-to-br from-mint to-transparent opacity-60 blur-3xl animate-[float1_9s_ease-in-out_infinite]" />
        <div className="absolute w-[380px] h-[380px] top-1/3 -right-24 rounded-full bg-gradient-to-br from-coral to-transparent opacity-50 blur-3xl animate-[float2_11s_ease-in-out_infinite]" />
        <div className="absolute w-[320px] h-[320px] bottom-0 left-1/4 rounded-full bg-gradient-to-br from-grapeLight to-transparent opacity-40 blur-3xl animate-[float1_13s_ease-in-out_infinite]" />
        {/* drifting emoji confetti for depth */}
        <span className="absolute text-5xl top-[12%] left-[18%] opacity-70 animate-[float2_8s_ease-in-out_infinite] [transform-style:preserve-3d]">📚</span>
        <span className="absolute text-4xl top-[70%] left-[12%] opacity-60 animate-[float1_10s_ease-in-out_infinite]">🛹</span>
        <span className="absolute text-5xl top-[20%] right-[14%] opacity-70 animate-[float1_12s_ease-in-out_infinite]">🎧</span>
        <span className="absolute text-4xl bottom-[15%] right-[20%] opacity-60 animate-[float2_9s_ease-in-out_infinite]">🪴</span>
      </div>

      {/* Card */}
      <div
        className="relative bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover p-12 max-w-lg w-full text-center"
        style={{
          transform: "perspective(1000px) rotateX(2deg) rotateY(-1deg)",
          boxShadow: "12px 16px 0px rgba(91,42,134,0.18), 0 30px 60px -20px rgba(91,42,134,0.35)",
        }}
      >
        <h1 className="font-display text-4xl text-grape mb-2">
          Campus<span className="bg-coral text-white px-2.5 py-0.5 rounded-xl ml-1.5 -rotate-2 inline-block">Bazaar</span> 🛍️
        </h1>
        <p className="text-grapeLight text-sm mb-9">
          {next === "/post"
            ? "Sign in to list an item for sale 🏷️"
            : "Sign in with your campus email to get started"}
        </p>

        {sent ? (
          <p className="text-sm bg-mint/40 border-2 border-mintDark rounded-xl p-5">
            Check your inbox 📬 — we sent a magic link to <b>{email}</b>
          </p>
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
            <button className="w-full bg-coral text-white border-2 border-ink py-3.5 rounded-2xl font-semibold shadow-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform">
              Send Magic Link ✨
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-22px) translateX(14px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(18px) translateX(-16px) rotate(8deg); }
        }
      `}</style>
    </div>
  );
}