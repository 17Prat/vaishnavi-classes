"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { CreditCard, Users, Clock, AlertTriangle, TrendingUp, BellRing, ArrowRight } from "lucide-react";

export default function StaffDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, studs, pays] = await Promise.all([
          apiFetch("/dashboard/summary"),
          apiFetch("/students"),
          apiFetch("/payments?limit=5"),
        ]);
        setSummary(sum);
        setStudents(studs);
        setRecentPayments(pays.slice(0, 5));
      } catch {
        // Ignore
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Staff / Cashier Counter</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Collect fees, generate instant PDF receipts, and dispatch WhatsApp fee reminders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPayModal(true)}
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-xs h-9 gap-1.5 shadow-sm"
            >
              <CreditCard className="h-4 w-4" /> Collect Fee Now
            </Button>
            <Link href="/staff/reminders">
              <Button
                variant="outline"
                className="bg-emerald-800/40 border-emerald-400/40 text-white hover:bg-emerald-800/70 text-xs h-9 gap-1.5"
              >
                <BellRing className="h-4 w-4" /> Send Reminders
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick KPI stats */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-indigo-100 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned Students</span>
                  <h4 className="text-2xl font-bold text-slate-900 mt-0.5">{summary.total_students}</h4>
                  <span className="text-[11px] text-slate-400">Enrolled active</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Today's Collection</span>
                  <h4 className="text-2xl font-bold text-emerald-700 mt-0.5">{formatCurrency(summary.today_collected)}</h4>
                  <span className="text-[11px] text-slate-400">Total received today</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Verification</span>
                  <h4 className="text-2xl font-bold text-amber-700 mt-0.5">{summary.pending_verifications_count}</h4>
                  <span className="text-[11px] text-slate-400">UPI submissions</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Overdue Fees</span>
                  <h4 className="text-2xl font-bold text-red-700 mt-0.5">{formatCurrency(summary.total_overdue)}</h4>
                  <span className="text-[11px] text-slate-400">Immediate action</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent collections */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">
              Recent Counter Collections
            </CardTitle>
            <Link href="/staff/payments" className="text-xs text-indigo-600 font-semibold hover:underline">
              View All Payments →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Receipt</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.receipt_number || "PENDING"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.student_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 uppercase text-slate-600">{p.payment_method}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(p.payment_date)}</td>
                      <td className="py-3 px-4 text-right">
                        {p.receipt_number && (
                          <a
                            href={`http://127.0.0.1:8000/receipts-pdf/${p.receipt_number}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline font-semibold"
                          >
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
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
        onSuccess={() => window.location.reload()}
      />
    </DashboardLayout>
  );
}
