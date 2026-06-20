"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = ["Books", "Furniture", "Electronics", "Clothing", "Rides", "Tickets"];
const emojiMap: Record<string, string> = {
  Books: "📘",
  Furniture: "🛋️",
  Electronics: "🎧",
  Clothing: "👕",
  Rides: "🚲",
  Tickets: "🎟️",
};

export default function PostListingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title,
        price: Number(price),
        category,
        description,
        emoji: emojiMap[category],
        status: "available",
      })
      .select()
      .single();

    setLoading(false);
    if (!error && data) router.push(`/listing/${data.id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover p-8 max-w-md w-full"
      >
        <h1 className="font-display text-2xl text-grape mb-5">List an item ✨</h1>

        <label className="block text-xs font-semibold text-grape mb-1.5">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Mini Fridge"
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-3.5 outline-none"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Price (₹)</label>
        <input
          required
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="1500"
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-3.5 outline-none"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-3.5 outline-none"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-grape mb-1.5">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, pickup location, etc."
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-5 outline-none"
        />

        <button
          disabled={loading}
          className="w-full bg-coral text-white border-2 border-ink py-3 rounded-xl font-semibold shadow-btn disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post Listing 🚀"}
        </button>
      </form>
    </div>
  );
}
