"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Conversation, ChatMessage } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Check, CheckCheck, User as UserIcon, RefreshCw } from "lucide-react";

export function ChatBox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const convs: Conversation[] = await apiFetch("/chat/conversations");
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      try {
        const msgs: ChatMessage[] = await apiFetch(`/chat/messages/${activeConvId}`);
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      } catch {
        // Ignore
      }
    };
    fetchMessages();
  }, [activeConvId]);

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const wsUrl = `ws://127.0.0.1:8000/api/v1/chat/ws/${user.id}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          const msg = data.message;
          if (msg.conversation_id === activeConvId) {
            setMessages((prev) => [...prev, msg]);
            setTimeout(scrollToBottom, 50);
          }
          fetchConversations();
        }
      } catch {
        // Ignore
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [user, activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "chat_message",
            conversation_id: activeConvId,
            content: textToSend,
          })
        );
      } else {
        // REST fallback
        const newMsg: ChatMessage = await apiFetch("/chat/messages", {
          method: "POST",
          body: JSON.stringify({
            conversation_id: activeConvId,
            content: textToSend,
          }),
        });
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 50);
      }
    } catch {
      // Ignore
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Conversations List (Sidebar) */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Discussions & Channels</h3>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <span className={`h-2 w-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              {wsConnected ? "Connected Live" : "Connecting..."}
            </span>
          </div>
          <button
            onClick={fetchConversations}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations started yet.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                    isSelected ? "bg-indigo-50/80 border-l-4 border-indigo-600" : "hover:bg-slate-100/60"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    {c.participant_names[0]?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {c.title || c.participant_names.join(", ")}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(c.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.last_message || "No messages yet"}
                    </p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {activeConv.participant_names[0]?.charAt(0) || "C"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeConv.title || activeConv.participant_names.join(", ")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {activeConv.is_direct ? "Direct Discussion" : "Institute Channel"}
                  </p>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <MessageSquare className="h-8 w-8 mb-2 stroke-1 text-slate-300" />
                  Say hello! Start the conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      {!isMine && (
                        <div className="flex items-center gap-1.5 mb-1 pl-1">
                          <span className="text-[11px] font-bold text-slate-700">{m.sender_name}</span>
                          <Badge variant="secondary" className="text-[9px] uppercase py-0 px-1.5">
                            {m.sender_role}
                          </Badge>
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMine
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMine ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          <span>{formatTime(m.created_at)}</span>
                          {isMine && (
                            m.is_read ? <CheckCheck className="h-3 w-3 text-indigo-200" /> : <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs"
              />
              <Button type="submit" disabled={!inputText.trim()} size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Select a discussion to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
