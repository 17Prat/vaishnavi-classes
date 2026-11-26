"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  CalendarCheck
} from "lucide-react";
import { DashboardSummary } from "@/types";

interface StatCardsProps {
  summary: DashboardSummary | null;
}

export function StatCards({ summary }: StatCardsProps) {
  if (!summary) return null;

  const totalStudents = summary.total_students ?? 0;
  const totalStaff = summary.total_staff ?? 0;
  const totalFees = summary.total_fees ?? 0;
  const totalCollected = summary.total_collected ?? 0;
  const collectionRate = summary.collection_rate_percentage ?? 0;
  const totalPending = summary.total_pending ?? 0;
  const totalOverdue = summary.total_overdue ?? 0;
  const todayCollected = summary.today_collected ?? 0;
  const monthlyCollected = summary.monthly_collected ?? 0;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      subtext: `${totalStaff} Staff Members`,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      title: "Total Billed Fees",
      value: formatCurrency(totalFees),
      subtext: "All active enrollments",
      icon: CreditCard,
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
    {
      title: "Total Collected",
      value: formatCurrency(totalCollected),
      subtext: `${collectionRate}% Collection Rate`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Pending Balance",
      value: formatCurrency(totalPending),
      subtext: "Unpaid scheduled installments",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      title: "Overdue Amount",
      value: formatCurrency(totalOverdue),
      subtext: "Past due date",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      title: "Today's Collection",
      value: formatCurrency(todayCollected),
      subtext: `Month: ${formatCurrency(monthlyCollected)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className={`border ${item.border} hover:shadow-md transition-shadow`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {item.title}
                </p>
                <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {item.value}
                </h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {item.subtext}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-xs`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
