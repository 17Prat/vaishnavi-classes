"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatBox } from "@/components/chat/ChatBox";

export default function AdminChatPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Real-Time Chat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant live communication with Staff, Accountants, and Students via WebSockets.
          </p>
        </div>
        <ChatBox />
      </div>
    </DashboardLayout>
  );
}
