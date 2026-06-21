import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RequestButton from "@/components/RequestButton";
import OwnerRequests from "@/components/OwnerRequests";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user.id, user.email);

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!listing) notFound();

  // check if the current user already has a pending/accepted request on this listing
  const { data: existingRequest } = await supabase
    .from("requests")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("buyer_id", user.id)
    .maybeSingle();

  const isOwner = listing.seller_id === user.id;

  return (
    <>
      <Navbar profile={profile!} />
      <div className="max-w-4xl mx-auto mt-10 px-6">
        <div className="bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover overflow-hidden grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-mint to-[#C9FFEC] flex items-center justify-center text-[100px] border-r-[3px] border-ink md:border-r-[3px] border-b-[3px] md:border-b-0">
            {listing.emoji}
          </div>
          <div className="p-8">
            <h1 className="font-display text-2xl text-grape mb-1.5">{listing.title}</h1>
            <p className="font-display text-2xl text-coralDark mb-3.5">₹{listing.price}</p>
            <p className="text-sm leading-relaxed mb-5">{listing.description}</p>

            <div className="flex items-center gap-2.5 mb-5 bg-white border-2 border-line rounded-2xl px-3.5 py-2.5">
              <div className="w-9 h-9 rounded-full bg-mint border-2 border-ink flex items-center justify-center text-sm">
                {listing.profiles?.avatar_emoji}
              </div>
              <div>
                <p className="font-semibold text-[13px]">{listing.profiles?.name}</p>
                <p className="text-[11px] text-grapeLight">
                  {listing.profiles?.hostel ?? "Campus"} · ⭐ {listing.profiles?.rating ?? "New"}
                </p>
              </div>
            </div>

            {!isOwner && (
              <RequestButton
                listingId={listing.id}
                sellerId={listing.seller_id}
                existingRequest={existingRequest}
              />
            )}
            {isOwner && <OwnerRequests listingId={listing.id} />}
          </div>
        </div>
      </div>
    </>
  );
}