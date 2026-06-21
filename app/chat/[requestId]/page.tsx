import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
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

  const otherUser =
    request.buyer_id === user.id ? request.listings.profiles : request.buyer;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("request_id", params.requestId)
    .order("created_at", { ascending: true });

  return (
    <>
      <Navbar profile={profile!} />
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
