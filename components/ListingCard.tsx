"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import AuthModal from "./AuthModal";

const placeholderBgs = [
  "linear-gradient(135deg,#FCE3FF,#F3D6FF)",
  "linear-gradient(135deg,#DBFFF3,#B7F5E4)",
  "linear-gradient(135deg,#FFF1CF,#FFE3A8)",
  "linear-gradient(135deg,#FFE3EC,#FFC9DC)",
  "linear-gradient(135deg,#E6E0FF,#D2C4FF)",
];

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending: { label: "Reserved", cls: "bg-butter text-ink" },
  sold: { label: "Sold", cls: "bg-ink text-card" },
};

interface ListingCardProps {
  listing: Listing;
  index: number;
  isLoggedIn?: boolean;
}

export default function ListingCard({ listing, index, isLoggedIn = false }: ListingCardProps) {
  const badge = statusBadge[listing.status];
  const [hearted, setHearted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  function handleHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    setHearted((h) => !h);
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 350);
  }

  return (
    <>
      <Link
        href={`/listing/${listing.id}`}
        style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
        className="sticker-card relative block bg-card border-[2.5px] border-ink rounded-chunky overflow-hidden shadow-chunky hover:shadow-chunkyHover group"
      >
        <span className="tape" aria-hidden />

        {/* Image / placeholder */}
        <div
          className="relative h-[160px] flex items-center justify-center text-5xl border-b-[2.5px] border-ink overflow-hidden"
          style={listing.image_url ? undefined : { background: placeholderBgs[index % placeholderBgs.length] }}
        >
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              sizes="(max-width:640px) 50vw, 230px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
              {listing.emoji}
            </span>
          )}

          {/* Status badge */}
          {badge && (
            <span
              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 border-ink ${badge.cls}`}
            >
              {badge.label}
            </span>
          )}

          {/* Wishlist / heart button */}
          <button
            onClick={handleHeart}
            aria-label={hearted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 border-2 border-ink flex items-center justify-center heart-btn ${
              hearted ? "hearted" : "text-grapeLight"
            } ${heartAnimating ? "animate-heartPop" : ""} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill={hearted ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Hover quick-view overlay */}
          <div className="absolute inset-0 bg-grape/0 group-hover:bg-grape/10 transition-colors duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span className="text-[11px] font-bold text-white bg-ink/80 px-3 py-1 rounded-full backdrop-blur-sm">
              View details →
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <p className="font-semibold text-[15px] mb-1 line-clamp-1 group-hover:text-grape transition-colors">
            {listing.title}
          </p>
          <p className="font-data text-coralDark font-bold text-lg price-tag">
            ₹{listing.price.toLocaleString("en-IN")}
          </p>
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-[11px] bg-mint border border-ink/20 px-2.5 py-0.5 rounded-lg font-semibold">
              {listing.category}
            </span>
            <span className="text-[11px] text-grapeLight font-medium truncate max-w-[90px]">
              {listing.profiles?.avatar_emoji} {listing.profiles?.name ?? "Student"}
            </span>
          </div>
        </div>
      </Link>

      {showAuth && (
        <AuthModal
          reason="Sign in to save items to your wishlist 💜"
          nextPath="/"
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
