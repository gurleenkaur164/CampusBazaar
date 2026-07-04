"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const floatingItems = [
  { emoji: "📚", cls: "top-[8%] left-[6%] animate-floatY", delay: "0s" },
  { emoji: "🎧", cls: "top-[14%] right-[8%] animate-floatY", delay: "1.2s" },
  { emoji: "🛹", cls: "top-[55%] left-[4%] animate-floatY", delay: "0.7s" },
  { emoji: "🪴", cls: "bottom-[12%] right-[6%] animate-floatY", delay: "1.8s" },
  { emoji: "💻", cls: "bottom-[20%] left-[10%] animate-floatY", delay: "0.4s" },
  { emoji: "🎒", cls: "top-[38%] right-[3%] animate-floatY", delay: "2.1s" },
];

const features = [
  { icon: "🎓", label: "Campus verified", sub: "University email only" },
  { icon: "💬", label: "Real-time chat", sub: "Talk to sellers instantly" },
  { icon: "🤝", label: "Peer-to-peer", sub: "No middlemen, just students" },
];

export default function GuestHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-14 pb-10 text-center">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-32 rounded-full bg-gradient-to-br from-peri/40 to-transparent blur-3xl" />
        <div className="absolute w-[400px] h-[400px] top-1/3 -right-32 rounded-full bg-gradient-to-br from-mint/30 to-transparent blur-3xl" />
        <div className="absolute w-[300px] h-[300px] bottom-0 left-1/3 rounded-full bg-gradient-to-br from-coral/20 to-transparent blur-3xl" />
      </div>

      {/* Floating emoji items */}
      {floatingItems.map((item) => (
        <span
          key={item.cls}
          className={`absolute text-3xl sm:text-4xl opacity-70 select-none hidden sm:block ${item.cls}`}
          style={{ animationDelay: item.delay }}
          aria-hidden
        >
          {item.emoji}
        </span>
      ))}

      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 bg-peri/20 text-grape text-xs font-semibold px-3 py-1.5 rounded-full border border-peri/40 mb-5">
        <span className="pulse-dot" /> Students only · verified by campus email
      </span>

      {/* Headline */}
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 max-w-3xl mx-auto">
        The campus marketplace{" "}
        <span className="hero-gradient-text">built for students</span>
      </h1>

      <p className="text-grapeLight text-base sm:text-lg font-medium mb-8 max-w-lg mx-auto leading-relaxed">
        Buy textbooks, sell your old laptop, or snag a great deal from someone
        who actually goes to your university.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <Link
          href="/login"
          className="bg-coral text-white border-2 border-ink px-7 py-3.5 rounded-2xl font-semibold text-base shadow-btn btn-press transition-all hover:shadow-glow hover:scale-[1.02]"
        >
          Get started — it&apos;s free ✨
        </Link>
        <a
          href="#listings"
          className="bg-card text-grape border-2 border-ink px-7 py-3.5 rounded-2xl font-semibold text-base shadow-btn btn-press transition-all hover:bg-line/40"
        >
          Browse listings ↓
        </a>
      </div>

      {/* Feature chips */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 bg-card/80 glass border border-line rounded-2xl px-5 py-3 min-w-[180px] text-left animate-fadeUp shadow-chunky"
          >
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p className="font-semibold text-sm text-grape">{f.label}</p>
              <p className="text-[11px] text-grapeLight">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll anchor for "Browse listings" */}
      <div id="listings" className="h-1 mt-10" aria-hidden />
    </section>
  );
}
