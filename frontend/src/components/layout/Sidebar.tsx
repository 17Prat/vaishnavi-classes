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
    <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-30 shadow-sm">
      {/* Brand */}
      <div className="h-22 flex items-center px-5 border-b border-slate-100 gap-3.5 py-4">
        <img
          src="/logo.png"
          alt="Vaishnavi Classes"
          className="h-12 w-12 rounded-xl object-cover shadow-sm border border-slate-200 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="font-black text-lg tracking-tight text-slate-900 block leading-tight truncate">
            Vaishnavi Classes
          </span>
          <span className="text-xs block font-bold text-indigo-700 tracking-wider uppercase mt-1">
            Since 1996 • {role}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
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
                "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-bold transition-all group tracking-wide",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer institute info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
          <div className="truncate">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user.institute_name || "Vaishnavi Classes"}
            </p>
            <p className="text-xs text-slate-600 font-mono font-bold">
              ID: {user.login_id}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
