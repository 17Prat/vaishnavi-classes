"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatBox } from "@/components/chat/ChatBox";

export default function StudentChatPage() {
  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Support & Accounts Chat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect directly with institutional accounts and staff for queries and receipt status.
          </p>
        </div>
        <ChatBox />
      </div>
    </DashboardLayout>
  );
}
