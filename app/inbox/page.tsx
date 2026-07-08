import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user.id, user.email);

  
  const { data: rows } = await supabase
    .from("requests")
    .select("*, listings(*, profiles(*)), buyer:profiles!requests_buyer_id_fkey(*)")
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  const conversations = rows ?? [];

  
  const ids = conversations.map((c) => c.id);
  let latestByRequest: Record<string, { body: string; created_at: string }> = {};
  if (ids.length) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("request_id, body, created_at")
      .in("request_id", ids)
      .order("created_at", { ascending: false });
    for (const m of msgs ?? []) {
      if (!latestByRequest[m.request_id]) {
        latestByRequest[m.request_id] = { body: m.body, created_at: m.created_at };
      }
    }
  }

  return (
    <>
      <Navbar profile={profile!} />
      <div className="max-w-2xl mx-auto px-5 sm:px-6 mt-8">
        <h1 className="font-display text-2xl text-grape mb-4">Messages</h1>

        {conversations.length === 0 ? (
          <div className="bg-card border border-line rounded-chunky shadow-chunky p-10 text-center">
            <p className="font-display text-lg text-grape mb-1">No chats yet</p>
            <p className="text-sm text-grapeLight mb-4">
              Request to buy something, or accept a buyer — your conversations land here.
            </p>
            <Link
              href="/"
              className="inline-block bg-coral text-white border border-line px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-btn btn-press"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => {
              const iAmBuyer = c.buyer_id === user.id;
              const other = iAmBuyer ? c.listings?.profiles : c.buyer;
              const preview = latestByRequest[c.id];
              return (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className="flex items-center gap-3 bg-card border border-line rounded-2xl shadow-chunky hover:shadow-chunkyHover transition-shadow p-3.5"
                >
                  <div className="w-12 h-12 rounded-full bg-mint border border-line flex items-center justify-center text-xl shrink-0">
                    {other?.avatar_emoji ?? ""}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{other?.name ?? "Student"}</p>
                      <span className="text-[10px] text-grapeLight shrink-0">
                        {preview ? new Date(preview.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-[12px] text-grapeLight truncate">
                      {preview ? preview.body : `re: ${c.listings?.title}`}
                    </p>
                    <span className="text-[10px] font-semibold text-peri">
                      {iAmBuyer ? "Buying" : "Selling"} · {c.listings?.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
