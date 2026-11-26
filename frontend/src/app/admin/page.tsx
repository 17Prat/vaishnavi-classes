"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import { Charts } from "@/components/dashboard/Charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, getReceiptPdfUrl } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardSummary, Payment } from "@/types";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import {
  CreditCard,
  UserPlus,
  Receipt,
  BellRing,
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
  Download
} from "lucide-react";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sum, ch, pays, studs] = await Promise.all([
        apiFetch("/dashboard/summary"),
        apiFetch("/dashboard/charts"),
        apiFetch("/payments?limit=6"),
        apiFetch("/students"),
      ]);
      setSummary(sum);
      setChartsData(ch);
      setRecentPayments(pays.slice(0, 6));
      setStudents(studs);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Financial Overview</h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-1 font-medium">
              Live collection metrics, pending verifications, and institutional fee ledgers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setShowPayModal(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm gap-2 text-sm h-11 px-5"
            >
              <CreditCard className="h-5 w-5" /> Collect Fee
            </Button>
            <Link href="/admin/students">
              <Button
                variant="outline"
                className="bg-indigo-800/40 border-indigo-300/40 text-white hover:bg-indigo-800/70 text-sm font-bold h-11 px-5 gap-2"
              >
                <UserPlus className="h-5 w-5" /> Add Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending UPI Verification Alert Banner */}
        {summary && (summary.pending_verifications_count ?? 0) > 0 && (
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">
                  {summary.pending_verifications_count} UPI Payments Awaiting Verification
                </h4>
                <p className="text-xs text-amber-700">
                  Students have submitted UPI reference receipts that require cashier confirmation.
                </p>
              </div>
            </div>
            <Link href="/admin/payments">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1">
                Review Now <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Stats */}
        <StatCards summary={summary} />

        {/* Charts */}
        <Charts chartsData={chartsData} />

        {/* Recent Transactions Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">
                Recent Fee Payments
              </CardTitle>
              <p className="text-sm text-slate-600 font-semibold mt-0.5">
                Latest transactions recorded across cash, UPI, and bank transfers
              </p>
            </div>
            <Link href="/admin/payments" className="text-sm font-black text-indigo-700 hover:underline">
              View All Payments →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100/90 text-slate-800 uppercase tracking-wider font-black text-sm border-y-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-4">Receipt / ID</th>
                    <th className="py-4 px-4">Student</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Method</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold text-base">
                        No recent transactions found
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-indigo-700 text-base">
                          {p.receipt_number || "REC-2026-0001"}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-black text-slate-900 text-lg leading-snug">{p.student_name || "Student"}</p>
                          <span className="text-sm text-slate-600 font-mono font-bold mt-0.5 block">{p.student_login_id || "STU0001"}</span>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 text-xl">
                          {formatCurrency(p.amount ?? (p as any).amount_paid ?? 0)}
                        </td>
                        <td className="py-4 px-4 uppercase text-slate-900 font-black text-base">
                          {p.payment_method ?? (p as any).payment_mode ?? "UPI"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              p.status === "verified"
                                ? "success"
                                : p.status === "pending_verification"
                                ? "warning"
                                : "destructive"
                            }
                            className="capitalize text-xs font-black px-3.5 py-1.5 uppercase tracking-wide"
                          >
                            {(p.status || "verified").replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-800 font-semibold text-base">
                          {formatDate(p.payment_date || new Date().toISOString())}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {p.receipt_number ? (
                            <a
                              href={getReceiptPdfUrl(p.receipt_number)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black text-xs rounded-xl shadow-xs"
                            >
                              <Download className="h-4 w-4" /> PDF
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-sm font-semibold">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecordPaymentModal
        open={showPayModal}
        onOpenChange={setShowPayModal}
        students={students}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
