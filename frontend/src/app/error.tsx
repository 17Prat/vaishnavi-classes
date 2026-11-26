"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageSquare, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly
    console.error("Vaishnavi Classes client-side error captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-16 w-16 rounded-2xl object-cover shadow-md border-2 border-indigo-100 ring-4 ring-indigo-50"
          />
        </div>

        <div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Vaishnavi Classes Portal
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            Session Refresh Required
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            The page encountered a temporary display issue. Click below to reload cleanly or return to the main portal.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Reload &amp; Try Again
          </button>

          <Link
            href="/"
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>

          <a
            href="https://wa.me/919664257346?text=Hello%20Vaishnavi%20Classes,%20I%20need%20help%20with%20the%20website%20portal."
            target="_blank"
            rel="noreferrer"
            className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp Support (+91 96642 57346)
          </a>
        </div>
      </div>
    </div>
  );
}
