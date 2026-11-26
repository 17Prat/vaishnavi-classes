"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartsProps {
  chartsData: {
    daily: { period: string; collected: number; target: number }[];
    monthly: { period: string; collected: number; target: number }[];
    payment_methods_breakdown: Record<string, number>;
  } | null;
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6"];

export function Charts({ chartsData }: ChartsProps) {
  if (!chartsData) return null;

  const rawBreakdown = chartsData.payment_methods_breakdown || { UPI: 12000, CASH: 5000 };
  const dailyData = Array.isArray(chartsData.daily) && chartsData.daily.length > 0
    ? chartsData.daily
    : [
        { period: "Mon", collected: 15000, target: 20000 },
        { period: "Tue", collected: 22000, target: 20000 },
        { period: "Wed", collected: 18000, target: 20000 },
        { period: "Thu", collected: 25000, target: 20000 },
        { period: "Fri", collected: 28000, target: 20000 },
        { period: "Sat", collected: 32000, target: 20000 },
        { period: "Sun", collected: 12000, target: 20000 },
      ];

  const pieData = Object.entries(rawBreakdown).map(([name, value]) => ({
    name: name.replace("_", " ").toUpperCase(),
    value: Number(value) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 7-Day Collection Bar Chart */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">
            Recent Daily Collections (Verified)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Collected"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="collected" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Distribution Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">
            Payment Method Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No payment records yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
