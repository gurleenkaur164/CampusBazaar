"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BuyRequest } from "@/lib/types";

export default function RequestButton({
  listingId,
  sellerId,
  existingRequest,
}: {
  listingId: string;
  sellerId: string;
  existingRequest: BuyRequest | null | undefined;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleRequest() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: request, error } = await supabase
      .from("requests")
      .insert({ listing_id: listingId, buyer_id: user.id, status: "pending" })
      .select()
      .single();

    if (error || !request) return;

    // notify the seller — this is what makes the bell badge light up instantly
    await supabase.from("notifications").insert({
      user_id: sellerId,
      type: "new_request",
      message: "Someone requested to buy your listing 🙋",
      link: `/listing/${listingId}`,
    });

    router.refresh();
  }

  if (existingRequest?.status === "accepted") {
    return (
      <button
        onClick={() => router.push(`/chat/${existingRequest.id}`)}
        className="bg-mint border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn"
      >
        💬 Open Chat
      </button>
    );
  }

  if (existingRequest?.status === "pending") {
    return (
      <button disabled className="bg-white border-2 border-line px-5 py-3 rounded-2xl font-semibold text-sm text-grapeLight">
        Request sent — waiting for reply ⏳
      </button>
    );
  }

  return (
    <div className="flex gap-2.5">
      <button
        onClick={handleRequest}
        className="bg-coral text-white border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        🙋 Request to Buy
      </button>
    </div>
  );
}
