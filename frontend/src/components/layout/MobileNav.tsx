"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  MessageSquare,
  BarChart3,
  User,
  Settings
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || typeof user !== "object" || Array.isArray(user) || !user.role) return null;

  const role = user.role;

  const adminNav = [
    { label: "Home", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Pay", href: "/admin/payments", icon: CreditCard },
    { label: "Chat", href: "/admin/chat", icon: MessageSquare },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ];

  const staffNav = [
    { label: "Home", href: "/staff", icon: LayoutDashboard },
    { label: "Students", href: "/staff/students", icon: Users },
    { label: "Collect", href: "/staff/payments", icon: CreditCard },
    { label: "Chat", href: "/staff/chat", icon: MessageSquare },
    { label: "Reports", href: "/staff/reports", icon: BarChart3 },
  ];

  const studentNav = [
    { label: "Home", href: "/student", icon: LayoutDashboard },
    { label: "Ledger", href: "/student/fees", icon: CreditCard },
    { label: "Receipts", href: "/student/receipts", icon: Receipt },
    { label: "Chat", href: "/student/chat", icon: MessageSquare },
    { label: "Profile", href: "/student/profile", icon: User },
  ];

  const nav = role === "admin" ? adminNav : role === "staff" ? staffNav : studentNav;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-indigo-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-indigo-600 stroke-[2.5]" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
