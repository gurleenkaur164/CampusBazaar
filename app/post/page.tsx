"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("That image is over 5 MB — pick a smaller one.");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=/post");
      return;
    }

    let image_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setError("Couldn't upload that photo. Try again.");
        setLoading(false);
        return;
      }
      const { data: pub } = supabase.storage.from("listing-images").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    const { data, error: insErr } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title,
        price: Number(price),
        category,
        description,
        emoji: emojiMap[category],
        image_url,
        status: "available",
      })
      .select()
      .single();

    setLoading(false);
    if (insErr || !data) {
      setError("Couldn't post your listing. Check the fields and try again.");
      return;
    }
    router.push(`/listing/${data.id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover p-7 sm:p-8 max-w-md w-full animate-fadeUp"
      >
        <h1 className="font-display text-2xl text-grape mb-1">List an item ✨</h1>
        <p className="text-xs text-grapeLight mb-5">A clear photo and honest price sell fastest.</p>

        {/* Photo */}
        <label className="block text-xs font-semibold text-grape mb-1.5">Photo (optional)</label>
        <label className="relative flex items-center justify-center h-40 mb-4 rounded-2xl border-2 border-dashed border-ink/40 bg-white cursor-pointer overflow-hidden hover:border-ink transition-colors">
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-cover" />
          ) : (
            <span className="text-sm text-grapeLight text-center px-4">
              📷 Tap to add a photo
              <br />
              <span className="text-[11px]">No photo? We'll use a cute emoji instead.</span>
            </span>
          )}
          <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
        </label>

        <label className="block text-xs font-semibold text-grape mb-1.5">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Mini fridge — barely used"
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-3.5 outline-none focus:shadow-btn transition-shadow"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Price (₹)</label>
        <input
          required
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="1500"
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-3.5 outline-none font-data focus:shadow-btn transition-shadow"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${
                category === c ? "bg-mint border-ink" : "bg-white border-line text-grape hover:border-ink"
              }`}
            >
              <span className="mr-1">{emojiMap[c]}</span>
              {c}
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold text-grape mb-1.5">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, pickup spot, why you're selling…"
          className="w-full px-3.5 py-2.5 border-2 border-ink rounded-xl text-sm mb-4 outline-none resize-none focus:shadow-btn transition-shadow"
        />

        {error && <p className="text-coralDark text-xs font-medium mb-3">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-coral text-white border-2 border-ink py-3 rounded-xl font-semibold shadow-btn btn-press transition-transform disabled:opacity-60"
        >
          {loading ? "Posting…" : "Post listing 🚀"}
        </button>
      </form>
    </div>
  );
}
