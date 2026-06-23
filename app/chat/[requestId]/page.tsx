import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ChatWindow from "@/components/ChatWindow";
import { getOrCreateProfile } from "@/lib/getOrCreateProfile";

export default async function ChatPage({ params }: { params: { requestId: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user.id, user.email);

  const { data: request } = await supabase
    .from("requests")
    .select("*, listings(*, profiles(*)), buyer:profiles!requests_buyer_id_fkey(*)")
    .eq("id", params.requestId)
    .single();

  if (!request) notFound();

  // Only the buyer or the listing's seller may open this chat.
  const sellerId = request.listings?.seller_id;
  const isParticipant = user.id === request.buyer_id || user.id === sellerId;
  if (!isParticipant) notFound();

  const otherUser = request.buyer_id === user.id ? request.listings.profiles : request.buyer;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("request_id", params.requestId)
    .order("created_at", { ascending: true });

  return (
    <>
      <Navbar profile={profile!} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
        <Link href="/inbox" className="text-sm text-grapeLight hover:text-grape font-medium">
          ← All messages
        </Link>
      </div>
      <ChatWindow
        requestId={params.requestId}
        currentUserId={user.id}
        otherUserName={otherUser?.name ?? "Student"}
        otherUserEmoji={otherUser?.avatar_emoji ?? "🙂"}
        initialMessages={messages ?? []}
        listingTitle={request.listings.title}
      />
    </>
  );
}
