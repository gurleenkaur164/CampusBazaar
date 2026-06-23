"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BuyRequest } from "@/lib/types";

export default function RequestButton({
  listingId,
  sellerId,
  existingRequest,
  soldOrReserved,
}: {
  listingId: string;
  sellerId: string;
  existingRequest: BuyRequest | null | undefined;
  soldOrReserved?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRequest() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    // upsert handles the (listing_id, buyer_id) unique constraint — so a buyer
    // who was previously declined can ask again without a silent failure.
    const { data: request, error } = await supabase
      .from("requests")
      .upsert(
        { listing_id: listingId, buyer_id: user.id, status: "pending" },
        { onConflict: "listing_id,buyer_id" }
      )
      .select()
      .single();

    if (error || !request) {
      setBusy(false);
      return;
    }

    await supabase.from("notifications").insert({
      user_id: sellerId,
      type: "new_request",
      message: "Someone wants to buy your listing !",
      link: `/listing/${listingId}`,
    });

    setBusy(false);
    router.refresh();
  }

  if (existingRequest?.status === "accepted") {
    return (
      <button
        onClick={() => router.push(`/chat/${existingRequest.id}`)}
        className="w-full sm:w-auto bg-mint border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-transform"
      >
        💬 Open chat
      </button>
    );
  }

  if (existingRequest?.status === "pending") {
    return (
      <p className="bg-white border-2 border-line px-5 py-3 rounded-2xl font-semibold text-sm text-grapeLight text-center">
        Request sent — waiting for the seller 
      </p>
    );
  }

  if (soldOrReserved) {
    return (
      <p className="bg-white border-2 border-line px-5 py-3 rounded-2xl font-semibold text-sm text-grapeLight text-center">
        This item is no longer available.
      </p>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={busy}
      className="w-full sm:w-auto bg-coral text-white border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-transform disabled:opacity-60"
    >
      {busy ? "Sending…" : existingRequest?.status === "declined" ? "🙋 Ask again" : "🙋 Request to buy"}
    </button>
  );
}
