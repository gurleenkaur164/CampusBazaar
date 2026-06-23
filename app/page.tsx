import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";
import type { Listing } from "@/lib/types";

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
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user.id, user.email);

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
      <Navbar profile={profile!} />

      <section className="pt-10 pb-5 px-5 text-center">
        <span className="inline-block bg-peri/25 text-grape text-xs font-semibold px-3 py-1 rounded-full border border-peri/40 mb-3">
          🎓 Students only · verified by campus email
        </span>
        <h1 className="font-display text-3xl sm:text-[2.6rem] leading-tight text-grape mb-1.5">
          Find your campus steal 
        </h1>
        <p className="text-grapeLight font-medium mb-6">Buy &amp; sell with people who actually go here</p>

        <form action="/" method="get" className="max-w-xl mx-auto flex gap-2.5">
          {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search textbooks, fridges, bikes…"
            className="flex-1 px-[18px] py-3 rounded-2xl border-2 border-ink outline-none bg-white text-sm focus:shadow-btn transition-shadow"
          />
          <button className="bg-coral text-white border-2 border-ink px-5 py-3 rounded-2xl font-semibold text-sm shadow-btn btn-press transition-transform">
            Search
          </button>
        </form>

        <div className="flex gap-2 justify-center flex-wrap mt-5">
          {categories.map((c) => {
            const active = activeCategory === c.label;
            const href =
              c.label === "All"
                ? "/"
                : `/?category=${encodeURIComponent(c.label)}`;
            return (
              <a
                key={c.label}
                href={href}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border-2 transition-colors ${
                  active ? "bg-mint border-ink shadow-pill" : "bg-white border-line text-grape hover:border-ink"
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label}
              </a>
            );
          })}
        </div>
      </section>

      <div className="flex justify-between items-end max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-3">
        <h2 className="font-display text-xl text-grape">
          {searchParams.q ? `Results for "${searchParams.q}"` : "Fresh on the campus market"}
        </h2>
        <span className="text-[13px] text-grapeLight font-medium">{listings?.length ?? 0} items</span>
      </div>

      <div className="stagger grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 sm:gap-6 max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        {listings?.map((listing: Listing, i: number) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
        {listings?.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-3 animate-floatY"></div>
            <p className="font-display text-lg text-grape mb-1">Nothing here yet</p>
            <p className="text-sm text-grapeLight">
              Be the first to list something — tap <b>+ Sell</b> up top.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
