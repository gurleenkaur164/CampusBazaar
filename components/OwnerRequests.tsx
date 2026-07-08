"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BuyRequest } from "@/lib/types";

export default function OwnerRequests({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [requests, setRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("requests")
      .select("*, buyer:profiles!requests_buyer_id_fkey(*)")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRequests((data as any) ?? []);
        setLoading(false);
      });
  }, [listingId, supabase]);

  async function accept(req: BuyRequest) {
    await supabase.from("requests").update({ status: "accepted" }).eq("id", req.id);
    await supabase.from("listings").update({ status: "pending" }).eq("id", listingId);
    await supabase.from("notifications").insert({
      user_id: req.buyer_id,
      type: "request_accepted",
      message: "Your request was accepted! Chat with the seller",
      link: `/chat/${req.id}`,
    });
    router.push(`/chat/${req.id}`);
  }

  async function decline(req: BuyRequest) {
    await supabase.from("requests").update({ status: "declined" }).eq("id", req.id);
    await supabase.from("notifications").insert({
      user_id: req.buyer_id,
      type: "request_declined",
      message: "A seller passed on your request this time.",
      link: `/listing/${listingId}`,
    });
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "declined" } : r)));
  }

  if (loading) {
    return <div className="h-12 rounded-xl skeleton" />;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-line rounded-2xl px-4 py-5 text-center">
        <p className="text-sm text-grapeLight">No buy requests yet — hang tight!</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-grape mb-2">
        Buy requests <span className="text-grapeLight">({requests.length})</span>
      </p>
      <div className="space-y-2">
        {requests.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-2 bg-white border border-line rounded-xl px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span>{r.buyer?.avatar_emoji}</span>
              <span className="font-medium truncate">{r.buyer?.name}</span>
              {r.status !== "pending" && (
                <span className="text-[11px] text-grapeLight capitalize shrink-0">· {r.status}</span>
              )}
            </div>

            {r.status === "pending" && (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => decline(r)}
                  className="bg-white border border-line px-2.5 py-1.5 rounded-lg text-xs font-semibold text-grapeLight hover:border-ink"
                >
                  Pass
                </button>
                <button
                  onClick={() => accept(r)}
                  className="bg-mint border border-line px-3 py-1.5 rounded-lg text-xs font-semibold shadow-pill btn-press"
                >
                  Accept
                </button>
              </div>
            )}
            {r.status === "accepted" && (
              <button
                onClick={() => router.push(`/chat/${r.id}`)}
                className="text-xs font-semibold text-coralDark shrink-0"
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
