import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import type { Listing } from "@/lib/types";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    profile = await getOrCreateProfile(supabase, user.id, user.email);
  }

  let query = supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (searchParams.category && searchParams.category !== "All") {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const { data: listings } = await query;

  const categories = ["All", "Books", "Furniture", "Electronics", "Clothing", "Rides", "Tickets"];

  return (
    <>
      <Navbar profile={profile!} />

      <section className="pt-9 pb-4 px-8 text-center">
        <h1 className="font-display text-4xl text-grape mb-1.5">Find your campus steal 💸</h1>
        <p className="text-grapeLight font-medium mb-5">Buy & sell with people who actually go here</p>

        <form action="/" className="max-w-xl mx-auto flex gap-2.5">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search for textbooks, fridges, bikes..."
            className="flex-1 px-4.5 py-3 rounded-2xl border-2 border-ink outline-none bg-white text-sm"
          />
          <button className="bg-coral text-white border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn">
            Search
          </button>
        </form>

        <div className="flex gap-2.5 justify-center flex-wrap mt-5">
          {categories.map((c) => (
            <a
              key={c}
              href={c === "All" ? "/" : `/?category=${c}`}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold border-2 ${
                (searchParams.category ?? "All") === c
                  ? "bg-mint border-ink"
                  : "bg-white border-line text-grape"
              }`}
            >
              {c}
            </a>
          ))}
        </div>
      </section>

      <div className="flex justify-between items-center max-w-6xl mx-auto px-8 pt-7 pb-2">
        <h2 className="font-display text-xl text-grape">Fresh on campus 🔥</h2>
        <span className="text-[13px] text-grapeLight">{listings?.length ?? 0} items</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-6 max-w-6xl mx-auto px-8 pb-12">
        {listings?.map((listing: Listing, i: number) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
        {listings?.length === 0 && (
          <p className="col-span-full text-center text-grapeLight py-12">
            Nothing here yet. Be the first to list something! ✨
          </p>
        )}
      </div>
    </>
  );
}

