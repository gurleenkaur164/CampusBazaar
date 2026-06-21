import { SupabaseClient } from "@supabase/supabase-js";

const AVATAR_EMOJIS = ["🦊", "🐼", "🐸", "🐙", "🦄", "🐨", "🐯", "🦋"];


export async function getOrCreateProfile(supabase: SupabaseClient, userId: string, email?: string | null) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      name: email?.split("@")[0] ?? "Student",
      avatar_emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
    })
    .select()
    .single();

  return created;
}