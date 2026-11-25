"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Conversation, ChatMessage } from "@/types";
import { formatTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  RefreshCw,
  Plus,
  Users,
  Search,
  UserCheck,
  GraduationCap,
  Shield,
  X
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Contact {
  id: string;
  login_id: string;
  full_name: string;
  role: string;
  phone: string;
}

export function ChatBox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const convs: Conversation[] = await apiFetch("/chat/conversations");
      setConversations(convs || []);
      if (convs && convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      try {
        const msgs: ChatMessage[] = await apiFetch(`/chat/messages/${activeConvId}`);
        setMessages(msgs || []);
        setTimeout(scrollToBottom, 100);
      } catch {
        // Ignore
      }
    };
    fetchMessages();
  }, [activeConvId]);

  // WebSocket connection with dynamic hostname
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const host = window.location.hostname || "127.0.0.1";
    const wsUrl = `ws://${host}:8000/api/v1/chat/ws/${user.id}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
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
    } catch {
      setWsConnected(false);
    }

    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (socketRef.current) {
        socketRef.current.close();
      }
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

  const openNewChat = async () => {
    setShowNewChatModal(true);
    setLoadingContacts(true);
    try {
      const data = await apiFetch<Contact[]>("/chat/contacts");
      setContacts(data || []);
    } catch {
      // Ignore
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleStartChatWithContact = async (contact: Contact) => {
    setShowNewChatModal(false);
    try {
      const newMsg: ChatMessage = await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({
          recipient_user_id: contact.id,
          content: `Hello ${contact.full_name}, starting communication from Vaishnavi Classes chat portal.`,
        }),
      });
      await fetchConversations();
      setActiveConvId(newMsg.conversation_id);
    } catch {
      alert("Failed to start conversation. Please try again.");
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = contactSearch.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.login_id.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

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
              {wsConnected ? "Live Connected" : "Connecting..."}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={openNewChat}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              title="Start New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={fetchConversations}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
              <p>No conversations yet.</p>
              <Button size="sm" onClick={openNewChat} className="text-xs h-7 gap-1">
                <Plus className="h-3 w-3" /> Start First Chat
              </Button>
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
                    {c.participant_names[0]?.charAt(0) || "V"}
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
                  {activeConv.participant_names[0]?.charAt(0) || "V"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeConv.title || activeConv.participant_names.join(", ")}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {activeConv.is_direct ? "Direct Discussion" : "Institute Campus Channel"}
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
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-3">
            <MessageSquare className="h-10 w-10 text-slate-300 stroke-1" />
            <p>Select a discussion or start a new chat with a student or staff.</p>
            <Button size="sm" onClick={openNewChat} className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Start New Chat
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              Start Conversation with Student / Staff
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select any registered student, staff member, or admin to initiate live chat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search by name, ID (STU0001 / STF0001)..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {loadingContacts ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading contacts...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No contacts found</div>
              ) : (
                filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleStartChatWithContact(c)}
                    className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {c.role === "student" ? (
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                        ) : c.role === "staff" ? (
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {c.login_id} • {c.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase capitalize">
                      {c.role}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowNewChatModal(false)} className="text-xs">
              Cancel
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
