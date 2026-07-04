"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";

interface GuestBuyButtonProps {
  listingId: string;
  listingTitle: string;
}

export default function GuestBuyButton({ listingId, listingTitle }: GuestBuyButtonProps) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button
        id="guest-buy-button"
        onClick={() => setShowAuth(true)}
        className="w-full bg-coral text-white border-2 border-ink py-3.5 rounded-2xl font-semibold shadow-btn btn-press transition-all hover:shadow-glow text-center"
      >
        Sign in to buy this 🛍️
      </button>

      <p className="text-[11px] text-grapeLight mt-3 text-center">
        Sign in with your campus email to request this item
      </p>

      {showAuth && (
        <AuthModal
          reason={`Sign in to buy "${listingTitle}" — it only takes a second! 🏷️`}
          nextPath={`/listing/${listingId}`}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
