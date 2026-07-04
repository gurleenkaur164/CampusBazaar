import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import GuestHero from "@/components/GuestHero";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";
import type { Listing } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const categories = [
  { label: "All", emoji: "" },
  { label: "Books", emoji: "" },
  { label: "Furniture", emoji: "" },
  { label: "Electronics", emoji: "" },
  { label: "Clothing", emoji: "" },
  { label: "Rides", emoji: "" },
  { label: "Tickets", emoji: "" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only fetch profile if user is logged in
  const profile = user ? await getOrCreateProfile(supabase, user.id, user.email) : null;

  let query = supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  const activeCategory = searchParams.category ?? "All";
  if (activeCategory !== "All") query = query.eq("category", activeCategory);
  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);

  const { data: listings } = await query;

  return (
    <>
      <Navbar profile={profile} />

      {/* Hero section — shown to ALL users, extra prominent for guests */}
      {!user ? (
        <GuestHero />
      ) : (
        /* Logged-in compact header */
        <section className="pt-10 pb-5 px-5 text-center">
          <span className="inline-flex items-center gap-1.5 bg-peri/20 text-grape text-xs font-semibold px-3 py-1 rounded-full border border-peri/40 mb-3">
            <span className="pulse-dot" />
            Students only · verified by campus email
          </span>
          <h1 className="font-display text-3xl sm:text-[2.6rem] leading-tight text-grape mb-1.5">
            Find your campus steal right here
          </h1>
          <p className="text-grapeLight font-medium mb-6">Buy &amp; sell with people who actually go here</p>
        </section>
      )}

      {/* Search + Categories */}
      <section className={`px-5 ${!user ? "pt-0 pb-5" : "pb-5"}`}>
        <form action="/" method="get" className="max-w-xl mx-auto">
          {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
          <div className="search-bar flex gap-2.5 border-2 border-ink rounded-2xl bg-white overflow-hidden pr-2 py-2 pl-4">
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search textbooks, fridges, bikes…"
              className="flex-1 outline-none bg-transparent text-sm text-grape placeholder:text-grapeLight"
            />
            <button className="bg-coral text-white border-2 border-ink px-4 py-2 rounded-xl font-semibold text-sm shadow-btn btn-press transition-transform shrink-0">
              Search
            </button>
          </div>
        </form>

        {/* Category pills */}
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {categories.map((c) => {
            const active = activeCategory === c.label;
            const href = c.label === "All" ? "/" : `/?category=${encodeURIComponent(c.label)}`;
            return (
              <a
                key={c.label}
                href={href}
                className={`category-pill px-3.5 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-all duration-200 ${
                  active
                    ? "active"
                    : "bg-white border-line text-grape hover:border-ink hover:shadow-pill"
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label}
              </a>
            );
          })}
        </div>
      </section>

      {/* Listings header */}
      <div className="flex justify-between items-end max-w-6xl mx-auto px-5 sm:px-8 pt-2 pb-3">
        <h2 className="font-display text-xl text-grape">
          {searchParams.q ? `Results for "${searchParams.q}"` : "Fresh on the campus market"}
        </h2>
        <span className="text-[13px] text-grapeLight font-medium">
          {listings?.length ?? 0} items
        </span>
      </div>

      {/* Listings grid */}
      <div className="stagger grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 sm:gap-6 max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        {listings?.map((listing: Listing, i: number) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            index={i}
            isLoggedIn={!!user}
          />
        ))}
        {listings?.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-3 animate-floatY">📭</div>
            <p className="font-display text-lg text-grape mb-1">Nothing here yet</p>
            <p className="text-sm text-grapeLight">
              Be the first to list something — {user ? <><b>tap + Sell</b> up top</> : <>sign in and hit <b>+ Sell</b></>}.
            </p>
          </div>
        )}
      </div>

      {/* FAB — only shown to logged-in users */}
      {user && (
        <Link
          href="/post"
          className="fab bg-coral text-white border-[3px] border-ink w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-fab btn-press transition-all hover:scale-110 hover:shadow-glow"
          title="List something"
          aria-label="List a new item"
        >
          +
        </Link>
      )}
    </>
  );
}
