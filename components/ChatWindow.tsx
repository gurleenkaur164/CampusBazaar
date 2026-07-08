"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  const [sending, setSending] = useState(false);
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
          const incoming = payload.new as Message;
          // Guard against duplicates: our own optimistic insert already added it.
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
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
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setText("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ request_id: requestId, sender_id: currentUserId, body })
      .select()
      .single();

    if (error || !data) {
      setText(body); // restore so the user doesn't lose their message
    } else {
      // Optimistically show it; realtime echo is de-duped by id above.
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    }
    setSending(false);
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6">
      <div className="bg-card border border-line rounded-chunky shadow-chunkyHover flex flex-col h-[72vh]">
        <div className="px-5 py-3.5 border-b border-line bg-mint rounded-t-[19px] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card border border-line flex items-center justify-center text-lg shrink-0">
            {otherUserEmoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-tight truncate">{otherUserName}</h3>
            <p className="text-[11px] text-grape/70 truncate">re: {listingTitle}</p>
          </div>
        </div>

        <div className="flex-1 nice-scroll overflow-y-auto p-4 sm:p-5 flex flex-col gap-1.5">
          {messages.length === 0 && (
            <div className="m-auto text-center text-grapeLight text-sm">
              Say hi and sort out the details!
            </div>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-snug animate-popIn ${
                    mine
                      ? "bg-coral text-white rounded-br-md"
                      : "bg-white border border-line rounded-bl-md"
                  }`}
                >
                  {m.body}
                </div>
                <span className="text-[10px] text-grapeLight mt-0.5 px-1">{timeOf(m.created_at)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-line">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-line outline-none text-sm focus:shadow-btn transition-shadow"
          />
          <button
            disabled={sending || !text.trim()}
            className="bg-coral text-white rounded-xl w-12 flex items-center justify-center shadow-btn btn-press transition-transform disabled:opacity-50"
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
