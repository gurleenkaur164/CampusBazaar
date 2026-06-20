"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BuyRequest } from "@/lib/types";

export default function OwnerRequests({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [requests, setRequests] = useState<BuyRequest[]>([]);

  useEffect(() => {
    supabase
      .from("requests")
      .select("*, buyer:profiles!requests_buyer_id_fkey(*)")
      .eq("listing_id", listingId)
      .then(({ data }) => setRequests((data as any) ?? []));
  }, [listingId, supabase]);

  async function accept(req: BuyRequest) {
    await supabase.from("requests").update({ status: "accepted" }).eq("id", req.id);
    await supabase.from("listings").update({ status: "pending" }).eq("id", listingId);
    await supabase.from("notifications").insert({
      user_id: req.buyer_id,
      type: "request_accepted",
      message: "Your request was accepted! Chat with the seller now 🎉",
      link: `/chat/${req.id}`,
    });
    router.push(`/chat/${req.id}`);
  }

  if (requests.length === 0) {
    return <p className="text-sm text-grapeLight italic">No requests yet on this listing.</p>;
  }

  return (
    <div>
      <p className="text-xs font-semibold text-grape mb-2">Buy requests</p>
      <div className="space-y-2">
        {requests.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between bg-white border-2 border-line rounded-xl px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm">
              <span>{r.buyer?.avatar_emoji}</span>
              <span className="font-medium">{r.buyer?.name}</span>
              <span className="text-[11px] text-grapeLight capitalize">· {r.status}</span>
            </div>
            {r.status === "pending" && (
              <button
                onClick={() => accept(r)}
                className="bg-mint border-2 border-ink px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Accept
              </button>
            )}
            {r.status === "accepted" && (
              <button
                onClick={() => router.push(`/chat/${r.id}`)}
                className="text-xs font-semibold text-coralDark"
              >
                Open chat →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
