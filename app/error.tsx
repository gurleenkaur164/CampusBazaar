"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging; in production this reaches your logs.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="bg-card border border-line rounded-chunky shadow-chunkyHover p-10 max-w-sm w-full">
        <h1 className="font-display text-2xl text-grape mb-1">Something went sideways</h1>
        <p className="text-sm text-grapeLight mb-6">
          That&apos;s on us, not you. Give it another try — it usually sorts itself out.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={reset}
            className="bg-coral text-white px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-transform"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-card text-grape border border-line px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-transform hover:bg-line/40"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
