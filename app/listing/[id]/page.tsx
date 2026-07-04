import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RequestButton from "@/components/RequestButton";
import OwnerRequests from "@/components/OwnerRequests";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";
import GuestBuyButton from "@/components/GuestBuyButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  available: "Available",
  pending: "Reserved",
  sold: "Sold",
};

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile only for logged-in users
  const profile = user ? await getOrCreateProfile(supabase, user.id, user.email) : null;

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!listing) notFound();

  const existingRequest = user
    ? (
        await supabase
          .from("requests")
          .select("*")
          .eq("listing_id", listing.id)
          .eq("buyer_id", user.id)
          .maybeSingle()
      ).data
    : null;

  const isOwner = user ? listing.seller_id === user.id : false;

  return (
    <>
      <Navbar profile={profile} />
      <div className="max-w-4xl mx-auto mt-6 sm:mt-10 px-5 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-grapeLight hover:text-grape mb-3 font-medium transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to browse
        </Link>

        <div className="bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover overflow-hidden grid md:grid-cols-2 animate-fadeUp">
          {/* Image panel */}
          <div className="relative bg-gradient-to-br from-mint to-[#C9FFEC] flex items-center justify-center text-[100px] min-h-[260px] border-b-[3px] md:border-b-0 md:border-r-[3px] border-ink overflow-hidden group">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            ) : (
              <span className="transition-transform duration-300 group-hover:scale-110">{listing.emoji}</span>
            )}
            {listing.status !== "available" && (
              <span className="absolute top-3 left-3 bg-ink text-card px-3 py-1 rounded-full text-xs font-bold border-2 border-card">
                {statusLabel[listing.status]}
              </span>
            )}
          </div>

          {/* Details panel */}
          <div className="p-6 sm:p-8">
            <span className="text-[11px] bg-mint border border-ink/20 px-2.5 py-0.5 rounded-lg font-semibold">
              {listing.category}
            </span>
            <h1 className="font-display text-2xl text-grape mt-2.5 mb-1">{listing.title}</h1>
            <p className="font-data text-3xl text-coralDark font-bold mb-4">
              ₹{listing.price.toLocaleString("en-IN")}
            </p>
            <p className="text-sm leading-relaxed text-grape/90 mb-5 whitespace-pre-line">
              {listing.description || "No description added."}
            </p>

            {/* Seller info */}
            <div className="flex items-center gap-2.5 mb-5 bg-white border-2 border-line rounded-2xl px-3.5 py-2.5">
              <div className="w-9 h-9 rounded-full bg-mint border-2 border-ink flex items-center justify-center text-sm shrink-0">
                {listing.profiles?.avatar_emoji}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[13px] truncate">{listing.profiles?.name}</p>
                <p className="text-[11px] text-grapeLight">
                  {listing.profiles?.hostel ?? "On campus"} · ⭐ {listing.profiles?.rating ?? "New"}
                </p>
              </div>
            </div>

            {/* Buy / owner / guest CTA */}
            {user ? (
              isOwner ? (
                <OwnerRequests listingId={listing.id} />
              ) : (
                <RequestButton
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                  existingRequest={existingRequest}
                  soldOrReserved={listing.status !== "available"}
                />
              )
            ) : (
              /* Guest — show sign-in prompt instead of buy button */
              <GuestBuyButton listingId={listing.id} listingTitle={listing.title} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
