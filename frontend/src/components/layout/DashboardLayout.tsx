"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserRole } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user || typeof user !== "object" || Array.isArray(user) || !user.role) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard
        router.push(`/${user.role}`);
      }
    }
  }, [user, isLoading, allowedRoles, router, mounted]);

  // Prevent SSR hydration mismatch by showing consistent server loader until client mounted
  if (!mounted || isLoading || !user || typeof user !== "object" || Array.isArray(user) || !user.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-14 w-14 rounded-2xl shadow-md border border-slate-200"
          />
          <div className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-700">Loading Vaishnavi Classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Sidebar />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
