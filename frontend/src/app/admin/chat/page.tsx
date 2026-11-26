"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatBox } from "@/components/chat/ChatBox";

export default function AdminChatPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Real-Time Chat</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Instant live communication with Staff, Accountants, and Students via WebSockets.
          </p>
        </div>
        <ChatBox />
      </div>
    </DashboardLayout>
  );
}
