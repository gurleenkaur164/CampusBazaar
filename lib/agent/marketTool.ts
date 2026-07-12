// The agent's real tool: query comparable listings from Supabase and
// summarize the market. Runs server-side with the service role so it can
// see comps across all sellers (read-only aggregation).

import { createClient } from "@supabase/supabase-js";

const CATEGORIES = ["Books", "Furniture", "Electronics", "Clothing", "Rides", "Tickets"];

export type MarketResult = {
  category: string;
  count: number;
  avg: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  samples: { title: string; price: number }[];
  note?: string;
};

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getMarketPrices(args: {
  category: string;
  keywords?: string;
}): Promise<MarketResult> {
  const category = CATEGORIES.find((c) => c.toLowerCase() === (args.category || "").toLowerCase());
  if (!category) {
    return {
      category: args.category,
      count: 0,
      avg: null,
      median: null,
      min: null,
      max: null,
      samples: [],
      note: `Unknown category. Valid: ${CATEGORIES.join(", ")}`,
    };
  }

  let query = admin()
    .from("listings")
    .select("title, price")
    .eq("category", category)
    .limit(50);

  // Loosely bias toward similar items when keywords are provided.
  const kw = (args.keywords || "").trim().split(/\s+/).filter(Boolean).slice(0, 3);
  if (kw.length) {
    query = query.or(kw.map((k) => `title.ilike.%${k}%`).join(","));
  }

  let { data } = await query;

  // If keyword filter was too narrow, fall back to the whole category.
  if (!data || data.length < 3) {
    const fallback = await admin()
      .from("listings")
      .select("title, price")
      .eq("category", category)
      .limit(50);
    data = fallback.data || data || [];
  }

  const prices = (data || [])
    .map((r) => Number(r.price))
    .filter((p) => Number.isFinite(p) && p >= 0)
    .sort((a, b) => a - b);

  if (!prices.length) {
    return {
      category,
      count: 0,
      avg: null,
      median: null,
      min: null,
      max: null,
      samples: [],
      note: "No comparable listings yet — price from typical campus resale value.",
    };
  }

  const sum = prices.reduce((a, b) => a + b, 0);
  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);

  return {
    category,
    count: prices.length,
    avg: Math.round(sum / prices.length),
    median,
    min: prices[0],
    max: prices[prices.length - 1],
    samples: (data || []).slice(0, 5).map((r) => ({ title: r.title, price: Number(r.price) })),
  };
}
