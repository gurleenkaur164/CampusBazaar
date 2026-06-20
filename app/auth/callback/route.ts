import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // create a profile row on first login if one doesn't exist yet
    if (data.user) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        const emojis = ["🦊", "🐼", "🐸", "🐙", "🦄", "🐨", "🐯", "🦋"];
        await supabase.from("profiles").insert({
          id: data.user.id,
          name: data.user.email?.split("@")[0] ?? "Student",
          avatar_emoji: emojis[Math.floor(Math.random() * emojis.length)],
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
