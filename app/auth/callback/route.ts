import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // where the user was originally headed before being bounced to /login
  const cookieStore = cookies();
  const next = cookieStore.get("post_login_redirect")?.value || "/";

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // create a profile row on first login if one doesn't exist yet
    // (also self-healed on every page via lib/getOrCreateProfile.ts as a backup)
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

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.delete("post_login_redirect");
  return response;
}