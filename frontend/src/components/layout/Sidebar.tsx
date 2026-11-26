"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  CreditCard,
  Receipt,
  MessageSquare,
  BarChart3,
  Settings,
  BellRing,
  Wallet,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  MessageCircleQuestion
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Website Enquiries", href: "/admin/enquiries", icon: MessageCircleQuestion },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Staff & Roles", href: "/admin/staff", icon: UserCheck },
    { label: "Academic", href: "/admin/academic", icon: GraduationCap },
    { label: "Fee Plans", href: "/admin/fees", icon: Wallet },
    { label: "Payments & UPI", href: "/admin/payments", icon: CreditCard },
    { label: "PDF Receipts", href: "/admin/receipts", icon: Receipt },
    { label: "WhatsApp Reminders", href: "/admin/reminders", icon: BellRing },
    { label: "Live Chat", href: "/admin/chat", icon: MessageSquare },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const staffNav = [
    { label: "Staff Dashboard", href: "/staff", icon: LayoutDashboard },
    { label: "Students", href: "/staff/students", icon: Users },
    { label: "Collect Payments", href: "/staff/payments", icon: CreditCard },
    { label: "WhatsApp Reminders", href: "/staff/reminders", icon: BellRing },
    { label: "Live Chat", href: "/staff/chat", icon: MessageSquare },
    { label: "Reports", href: "/staff/reports", icon: BarChart3 },
  ];

  const studentNav = [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Fee Ledger", href: "/student/fees", icon: FileSpreadsheet },
    { label: "Pay & UPI Ref", href: "/student/payments", icon: CreditCard },
    { label: "My Receipts", href: "/student/receipts", icon: Receipt },
    { label: "Chat Support", href: "/student/chat", icon: MessageSquare },
    { label: "Profile", href: "/student/profile", icon: Settings },
  ];

  const navItems = role === "admin" ? adminNav : role === "staff" ? staffNav : studentNav;

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-30 shadow-sm">
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 gap-3">
        <img
          src="/logo.png"
          alt="Vaishnavi Classes"
          className="h-10 w-10 rounded-xl object-cover shadow-sm border border-slate-200 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight truncate">
            Vaishnavi Classes
          </span>
          <span className="text-[10px] block font-semibold text-indigo-600 tracking-wider uppercase">
            Since 1996 • {role}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname
            ? pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/staff" &&
                item.href !== "/student" &&
                pathname.startsWith(item.href))
            : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer institute info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {user.institute_name || "Vaishnavi Classes"}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              ID: {user.login_id}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
