"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-16 w-16 rounded-2xl mx-auto shadow-md border border-slate-200"
          />
          <h2 className="text-xl font-bold text-slate-900">Vaishnavi Classes</h2>
          <p className="text-xs text-slate-600">
            A temporary connection issue occurred. Please tap below to reload.
          </p>
          <button
            onClick={() => {
              try {
                if (typeof window !== "undefined") {
                  window.localStorage?.clear();
                  window.sessionStorage?.clear();
                }
              } catch {}
              reset();
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Reload Portal
          </button>
        </div>
      </body>
    </html>
  );
}
