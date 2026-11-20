"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatBox } from "@/components/chat/ChatBox";

export default function StaffChatPage() {
  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Support Chat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time chat with Director / Admin and assigned students.
          </p>
        </div>
        <ChatBox />
      </div>
    </DashboardLayout>
  );
}
