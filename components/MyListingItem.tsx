"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types";

const statusStyle: Record<string, string> = {
  available: "bg-mint text-ink",
  pending: "bg-butter text-ink",
  sold: "bg-ink text-card",
};

export default function MyListingItem({ listing }: { listing: Listing }) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState(listing.status);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function markSold() {
    setBusy(true);
    await supabase.from("listings").update({ status: "sold" }).eq("id", listing.id);
    setStatus("sold");
    setBusy(false);
  }

  async function relist() {
    setBusy(true);
    await supabase.from("listings").update({ status: "available" }).eq("id", listing.id);
    setStatus("available");
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    setBusy(true);
    await supabase.from("listings").delete().eq("id", listing.id);
    setDeleted(true);
    router.refresh();
  }

  if (deleted) return null;

  return (
    <div className="flex items-center gap-3 bg-card border-2 border-ink rounded-2xl shadow-chunky p-3">
      <Link
        href={`/listing/${listing.id}`}
        className="relative w-14 h-14 rounded-xl border-2 border-ink overflow-hidden flex items-center justify-center text-2xl bg-line shrink-0"
      >
        {listing.image_url ? (
          <Image src={listing.image_url} alt={listing.title} fill className="object-cover" sizes="56px" />
        ) : (
          listing.emoji
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">{listing.title}</p>
        <p className="font-data text-coralDark font-bold text-sm">₹{listing.price.toLocaleString("en-IN")}</p>
        <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-ink/20 capitalize ${statusStyle[status]}`}>
          {status}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        {status !== "sold" ? (
          <button
            onClick={markSold}
            disabled={busy}
            className="text-[11px] font-semibold bg-white border-2 border-line px-2.5 py-1 rounded-lg hover:border-ink disabled:opacity-50"
          >
            Mark sold
          </button>
        ) : (
          <button
            onClick={relist}
            disabled={busy}
            className="text-[11px] font-semibold bg-mint border-2 border-ink px-2.5 py-1 rounded-lg disabled:opacity-50"
          >
            Relist
          </button>
        )}
        <button
          onClick={remove}
          disabled={busy}
          className="text-[11px] font-semibold text-coralDark px-2.5 py-1 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
