"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface AuthModalProps {
  reason?: string;
  onClose: () => void;
  nextPath?: string;
}

export default function AuthModal({
  reason = "Sign in to continue",
  onClose,
  nextPath = "/",
}: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="modal-backdrop flex items-end sm:items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in required"
    >
      <div
        ref={modalRef}
        className="modal-sheet w-full max-w-sm bg-card border border-line rounded-chunky p-7 text-center relative"
        style={{ boxShadow: "8px 10px 0px rgba(46,26,71,0.18), 0 30px 60px -20px rgba(46,26,71,0.4)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-line flex items-center justify-center text-grape hover:bg-peri/30 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        {/* Brand */}
        <h2 className="font-display text-2xl text-grape mb-1">
          Campus
          <span className="bg-coral text-white px-2 py-0.5 rounded-xl ml-1.5 -rotate-2 inline-block shadow-pill text-xl">
            Bazaar
          </span>
        </h2>

        <p className="text-grapeLight text-sm mb-6 mt-2 leading-relaxed">
          {reason}
        </p>

        {/* Features chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {["Verified students only", "Real-time chat", "Magic link login"].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-peri/15 border border-peri/30 rounded-full text-[12px] font-semibold text-grape"
            >
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="block w-full bg-coral text-white border border-line py-3.5 rounded-2xl font-semibold shadow-btn btn-press transition-transform text-center"
        >
          Sign in with campus email
        </Link>

        <p className="text-[11px] text-grapeLight mt-4">
          No passwords · only verified campus emails
        </p>
      </div>
    </div>
  );
}
