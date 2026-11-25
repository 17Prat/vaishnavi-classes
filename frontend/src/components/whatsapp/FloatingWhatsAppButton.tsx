"use client";

import React, { useState } from "react";
import { getDirectChatWhatsAppUrl, openWhatsAppChat, BUSINESS_WHATSAPP_NUMBER } from "@/config/whatsapp";
import { MessageCircle, X, Send } from "lucide-react";

export function FloatingWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");

  const handleOpenDirect = () => {
    const url = getDirectChatWhatsAppUrl(
      quickMsg.trim() || "Hello Vaishnavi Classes, I would like to inquire about course admissions and fees."
    );
    openWhatsAppChat(url);
    setIsOpen(false);
    setQuickMsg("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Popup Box */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Vaishnavi Classes"
                className="h-9 w-9 rounded-xl object-cover border border-emerald-200 shadow-xs"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Vaishnavi Classes</h4>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online on WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="my-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 leading-relaxed border border-slate-100">
            👋 Welcome! Have questions about classes, batch timings, or fee structure? Message us directly on WhatsApp!
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleOpenDirect();
              }}
              className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleOpenDirect}
              className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              <Send className="h-3.5 w-3.5" /> Start WhatsApp Chat
            </button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400">
              Direct to Management (+91 {BUSINESS_WHATSAPP_NUMBER.slice(-10)})
            </span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp with Vaishnavi Classes"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
        </span>
        {/* WhatsApp Icon */}
        <svg
          className="h-7 w-7 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 2C6.516 2 2.023 6.492 2.023 12.008c0 1.984.586 3.844 1.602 5.414L2 22l4.742-1.578A9.972 9.972 0 0 0 12.03 22c5.516 0 10.01-4.492 10.01-10.008C22.04 6.492 17.547 2 12.031 2zm0 18.234c-1.688 0-3.281-.469-4.664-1.289l-.336-.203-3.219 1.07.86-3.133-.219-.344a8.168 8.168 0 0 1-1.273-4.328c0-4.523 3.68-8.203 8.203-8.203 4.523 0 8.203 3.68 8.203 8.203 0 4.523-3.68 8.227-8.203 8.227zm4.781-6.148c-.266-.133-1.57-.773-1.812-.86-.242-.086-.422-.133-.594.133-.18.266-.68.86-.836 1.04-.156.172-.312.195-.578.062-.266-.133-1.125-.414-2.14-1.32-.789-.703-1.328-1.57-1.484-1.836-.156-.266-.016-.406.117-.539.125-.117.266-.312.4-.469.133-.156.172-.266.266-.445.086-.18.047-.336-.023-.469-.07-.133-.594-1.43-.812-1.961-.219-.516-.438-.445-.594-.453l-.508-.008c-.18 0-.469.07-.719.336-.25.266-.961.938-.961 2.289s.984 2.656 1.117 2.836c.141.18 1.938 2.961 4.703 4.148.656.281 1.164.445 1.562.57.656.211 1.25.18 1.727.11.531-.078 1.57-.641 1.797-1.266.219-.625.219-1.164.156-1.266-.07-.102-.25-.164-.516-.297z" />
        </svg>
      </button>
    </div>
  );
}
