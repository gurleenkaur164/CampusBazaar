"use client";

import Link from "next/link";
import { useEffect } from "react";

export type Toast = {
  id: string;
  message: string;
  link: string | null;
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  // Auto-dismiss after a few seconds; the timer is per-toast so a fresh one
  // doesn't reset the others.
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 5200);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const body = (
    <div className="flex items-start gap-3 bg-card border border-line rounded-2xl shadow-chunkyHover p-3.5 pr-9 w-[19rem] relative">
      <span className="w-9 h-9 rounded-full bg-mint/15 text-mintDark flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-grape leading-snug">{toast.message}</p>
        {toast.link && <p className="text-[11px] text-grapeLight mt-0.5">Tap to open →</p>}
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 w-6 h-6 rounded-full text-grapeLight hover:bg-line/70 flex items-center justify-center transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="animate-slideRight pointer-events-auto">
      {toast.link ? (
        <Link href={toast.link} onClick={() => onDismiss(toast.id)} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

export default function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-[300] flex flex-col-reverse gap-2.5 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
