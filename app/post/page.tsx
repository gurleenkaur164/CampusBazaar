"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

  // Listing Assistant Agent state
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentTrace, setAgentTrace] = useState<string[]>([]);
  const [agentTags, setAgentTags] = useState<string[]>([]);
  const [agentReason, setAgentReason] = useState("");

  async function runAgent() {
    if (!file && !title.trim()) {
      setError("Add a photo or type a couple of words first, then let AI help.");
      return;
    }
    setError("");
    setAgentLoading(true);
    setAgentTrace([]);
    setAgentTags([]);
    setAgentReason("");
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      if (file) {
        imageBase64 = await fileToBase64(file);
        mimeType = file.type;
      }
      const res = await fetch("/api/listing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, note: title.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "The AI assistant couldn't help right now.");
        return;
      }
      const l = data.listing;
      if (l.title) setTitle(l.title);
      if (typeof l.suggestedPrice === "number") setPrice(String(l.suggestedPrice));
      if (categories.includes(l.category)) setCategory(l.category);
      if (l.description) setDescription(l.description);
      setAgentTrace(data.trace || []);
      setAgentTags(Array.isArray(l.tags) ? l.tags : []);
      setAgentReason(l.priceReasoning || "");
    } catch {
      setError("Couldn't reach the AI assistant. Check your connection and try again.");
    } finally {
      setAgentLoading(false);
    }
  }

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
        className="bg-card border border-line rounded-chunky shadow-chunkyHover p-7 sm:p-8 max-w-md w-full animate-fadeUp"
      >
        <h1 className="font-display text-2xl text-grape mb-1">List an item</h1>
        <p className="text-xs text-grapeLight mb-5">A clear photo and honest price sell fastest.</p>

        {/* Photo */}
        <label className="block text-xs font-semibold text-grape mb-1.5">Photo (optional)</label>
        <label className="relative flex items-center justify-center h-40 mb-4 rounded-2xl border-2 border-dashed border-line bg-white cursor-pointer overflow-hidden hover:border-grapeLight transition-colors">
          {preview ? (
            <Image src={preview} alt="preview" fill className="object-cover" />
          ) : (
            <span className="text-sm text-grapeLight text-center px-4">
              Tap to add a photo
              <br />
              <span className="text-[11px]">No photo? We&apos;ll add a placeholder for you.</span>
            </span>
          )}
          <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
        </label>

        {/* Listing Assistant Agent */}
        <button
          type="button"
          onClick={runAgent}
          disabled={agentLoading}
          className="w-full flex items-center justify-center gap-2 mb-4 bg-mint/15 border border-mint text-mintDark py-2.5 rounded-xl text-sm font-semibold btn-press transition-transform disabled:opacity-60"
        >
          <Sparkles size={16} />
          {agentLoading ? "AI is analyzing…" : "Auto-fill with AI"}
        </button>

        {(agentTrace.length > 0 || agentReason || agentTags.length > 0) && (
          <div className="mb-4 p-3.5 rounded-2xl bg-mint/10 border border-mint/40 animate-fadeUp">
            {agentTrace.length > 0 && (
              <ol className="space-y-1 mb-2">
                {agentTrace.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-mintDark">
                    <span className="opacity-70">{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            )}
            {agentReason && (
              <p className="text-[12px] text-grape mb-2">
                <span className="font-semibold">Price:</span> {agentReason}
              </p>
            )}
            {agentTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {agentTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white border border-line text-[11px] text-grapeLight"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="block text-xs font-semibold text-grape mb-1.5">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Mini fridge — barely used"
          className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm mb-3.5 outline-none focus:shadow-btn transition-shadow"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Price (₹)</label>
        <input
          required
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="1500"
          className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm mb-3.5 outline-none font-data focus:shadow-btn transition-shadow"
        />

        <label className="block text-xs font-semibold text-grape mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                category === c
                  ? "bg-mint/15 border-mint text-mintDark"
                  : "bg-white border-line text-grape hover:border-grapeLight"
              }`}
            >
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
          className="w-full px-3.5 py-2.5 border border-line rounded-xl text-sm mb-4 outline-none resize-none focus:shadow-btn transition-shadow"
        />

        {error && <p className="text-coralDark text-xs font-medium mb-3">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-coral text-white border border-line py-3 rounded-xl font-semibold shadow-btn btn-press transition-transform disabled:opacity-60"
        >
          {loading ? "Posting…" : "Post listing"}
        </button>
      </form>
    </div>
  );
}
