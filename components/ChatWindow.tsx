"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

export default function ChatWindow({
  requestId,
  currentUserId,
  otherUserName,
  otherUserEmoji,
  initialMessages,
  listingTitle,
}: {
  requestId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserEmoji: string;
  initialMessages: Message[];
  listingTitle: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel("messages-" + requestId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const body = text;
    setText("");

    await supabase.from("messages").insert({
      request_id: requestId,
      sender_id: currentUserId,
      body,
    });

    // notify the other participant — handled by a DB trigger in production,
    // shown here client-side for clarity. See supabase/schema.sql for the trigger version.
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-6">
      <div className="bg-card border-[3px] border-ink rounded-chunky shadow-chunkyHover flex flex-col h-[70vh]">
        <div className="px-5 py-4 border-b-2 border-ink bg-mint rounded-t-[18px]">
          <h3 className="font-display text-lg">
            {otherUserEmoji} {otherUserName}
          </h3>
          <p className="text-[11px] text-grapeLight">re: {listingTitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                m.sender_id === currentUserId
                  ? "bg-coral text-white self-end rounded-br-sm"
                  : "bg-white border-2 border-line self-start rounded-bl-sm"
              }`}
            >
              {m.body}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 p-3.5 border-t-2 border-ink">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-ink outline-none text-sm"
          />
          <button className="bg-coral text-white border-2 border-ink rounded-xl w-11">➤</button>
        </form>
      </div>
    </div>
  );
}
