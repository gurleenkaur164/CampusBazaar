import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MyListingItem from "@/components/MyListingItem";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user.id, user.email);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const items = (listings ?? []) as Listing[];

  return (
    <>
      <Navbar profile={profile!} />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl text-grape">My stuff 🏷️</h1>
          <Link
            href="/post"
            className="bg-coral text-white border-2 border-ink px-4 py-2 rounded-2xl font-semibold text-sm shadow-btn btn-press"
          >
            + Sell
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-card border-[3px] border-ink rounded-chunky shadow-chunky p-10 text-center">
            <div className="text-5xl mb-3 animate-floatY">🪄</div>
            <p className="font-display text-lg text-grape mb-1">You haven't listed anything yet</p>
            <p className="text-sm text-grapeLight">Turn that clutter into campus cash — tap + Sell.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((l) => (
              <MyListingItem key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
