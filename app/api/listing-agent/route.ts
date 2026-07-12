// Listing Assistant Agent — a multi-step, tool-using agent.
//
// Loop:
//   1. Vision/text analysis of the item (Gemini multimodal).
//   2. The model DECIDES to call `get_market_prices` (real Supabase query).
//   3. We run the tool, feed comps back, model prices + writes the listing.
//
// Free of cost: Google Gemini free tier + your existing Supabase project.

import { NextRequest, NextResponse } from "next/server";
import {
  geminiTurn,
  extractFunctionCall,
  extractText,
  parseJson,
  type Content,
  type FunctionDeclaration,
} from "@/lib/agent/gemini";
import { getMarketPrices } from "@/lib/agent/marketTool";

export const runtime = "nodejs";
export const maxDuration = 30;

const CATEGORIES = ["Books", "Furniture", "Electronics", "Clothing", "Rides", "Tickets"];

const SYSTEM = `You are the Listing Assistant for CampusBazaar, a student-to-student marketplace (prices in Indian Rupees ₹).
Given a photo and/or a short note, help a student post a great listing.

You MUST work in steps:
1. Identify the item, its likely category (one of: ${CATEGORIES.join(", ")}), and its condition.
2. Before pricing, CALL the get_market_prices tool to see what comparable items sell for on campus. Always call it once.
3. Using those comps, choose a fair suggested price (competitive but not a giveaway), then write the listing.

When you have the market data, reply with ONLY a JSON object (no prose) of exactly this shape:
{
  "title": string,            // catchy, <= 60 chars
  "category": string,         // one of the allowed categories
  "condition": string,        // e.g. "Like new", "Good", "Fair"
  "suggestedPrice": number,   // integer rupees
  "priceReasoning": string,   // 1 sentence citing the comps
  "description": string,      // 2-3 friendly sentences: condition, why selling, pickup
  "tags": string[]            // 3-5 lowercase search tags
}`;

const marketToolDecl: FunctionDeclaration = {
  name: "get_market_prices",
  description:
    "Look up comparable listings already on CampusBazaar to understand fair pricing for an item. Call this once before suggesting a price.",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: CATEGORIES,
        description: "Best-guess category for the item.",
      },
      keywords: {
        type: "string",
        description: "A few words describing the item, e.g. 'mini fridge' or 'organic chemistry textbook'.",
      },
    },
    required: ["category"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, note } = await req.json();

    if (!imageBase64 && !note) {
      return NextResponse.json({ error: "Add a photo or a short note first." }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI is not configured — set GEMINI_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    const trace: string[] = [];
    const userParts: any[] = [];
    if (note) userParts.push({ text: `Seller's note: ${note}` });
    if (imageBase64) {
      userParts.push({
        inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 },
      });
      trace.push("Analyzed the photo");
    } else {
      trace.push("Read the seller's note");
    }

    const contents: Content[] = [{ role: "user", parts: userParts }];

    // Agent loop: allow the model to call tools, then produce the listing.
    let toolCalled = false;
    for (let step = 0; step < 4; step++) {
      const turn = await geminiTurn(contents, {
        systemInstruction: SYSTEM,
        tools: [marketToolDecl],
      });
      contents.push(turn);

      const call = extractFunctionCall(turn);
      if (call && call.name === "get_market_prices") {
        toolCalled = true;
        const result = await getMarketPrices(call.args as any);
        trace.push(
          result.count > 0
            ? `Checked ${result.count} comparable ${result.category} listings (₹${result.min}–₹${result.max}, median ₹${result.median})`
            : `Checked the market — no ${result.category ?? ""} comps yet`
        );
        contents.push({
          role: "user",
          parts: [{ functionResponse: { name: call.name, response: result as any } }],
        });
        continue;
      }

      // No tool call — expect the final JSON listing.
      const text = extractText(turn);
      if (!text) continue;
      const listing = parseJson(text);
      trace.push("Wrote the title, description, price & tags");

      // Guard the category against the allowed set.
      if (!CATEGORIES.includes(listing.category)) {
        listing.category =
          CATEGORIES.find((c) => c.toLowerCase() === String(listing.category).toLowerCase()) ||
          "Electronics";
      }

      return NextResponse.json({ listing, trace, usedMarketTool: toolCalled });
    }

    return NextResponse.json({ error: "The agent couldn't finish — try again." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message?.slice(0, 200) || "Agent failed" },
      { status: 500 }
    );
  }
}
