// Minimal Gemini REST client — no SDK, no cost beyond the free tier.
// Uses the v1beta generateContent endpoint with function-calling support.

// Overridable via env; defaults to the current free-tier flash alias.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

export type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args: Record<string, any> } }
  | { functionResponse: { name: string; response: Record<string, any> } };

export type Content = { role: "user" | "model"; parts: Part[] };

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

type GeminiOpts = {
  systemInstruction?: string;
  tools?: FunctionDeclaration[];
};

/** One round-trip to Gemini. Returns the model's candidate content (parts). */
export async function geminiTurn(contents: Content[], opts: GeminiOpts = {}): Promise<Content> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const body: Record<string, any> = { contents };
  if (opts.systemInstruction) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }
  if (opts.tools?.length) {
    body.tools = [{ functionDeclarations: opts.tools }];
  }

  const res = await fetch(ENDPOINT(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  const candidate = json?.candidates?.[0]?.content;
  if (!candidate) {
    throw new Error("Gemini returned no candidate");
  }
  return candidate as Content;
}

/** Pull the first functionCall part out of a model turn, if any. */
export function extractFunctionCall(content: Content) {
  for (const part of content.parts || []) {
    if ("functionCall" in part) return part.functionCall;
  }
  return null;
}

/** Concatenate all text parts of a model turn. */
export function extractText(content: Content): string {
  return (content.parts || [])
    .map((p) => ("text" in p ? p.text : ""))
    .join("")
    .trim();
}

/** Lenient JSON extraction — handles ```json fences or raw objects. */
export function parseJson<T = any>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(raw.slice(start, end + 1));
}
