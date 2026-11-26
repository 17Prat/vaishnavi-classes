"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, getReceiptPdfUrl } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { FeeLedger, Payment, Receipt } from "@/types";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  ArrowRight
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState<FeeLedger | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.student_profile_id) return;

    const loadData = async () => {
      try {
        const [led, pays, recs] = await Promise.all([
          apiFetch(`/students/${user.student_profile_id}/ledger`),
          apiFetch("/payments"),
          apiFetch("/receipts"),
        ]);
        setLedger(led);
        setPayments(Array.isArray(pays) ? pays.slice(0, 4) : []);
        setReceipts(Array.isArray(recs) ? recs.slice(0, 3) : []);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        {/* Welcome card */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-indigo-100 inline-block mb-2">
              Student ID: {user?.login_id}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.full_name}!</h2>
            <p className="text-xs text-indigo-100 mt-1">
              Track your tuition schedule, verified payments, and downloadable PDF receipts.
            </p>
          </div>
          <div>
            <Link href="/student/payments">
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs h-9 gap-1.5 shadow-sm">
                <CreditCard className="h-4 w-4" /> Submit UPI Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Fee Metric Cards */}
        {ledger && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-indigo-100 shadow-xs">
              <CardContent className="p-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Net Fee</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(ledger.net_payable)}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{ledger.fee_plan_name}</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-xs bg-emerald-50/20">
              <CardContent className="p-5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Amount Paid</span>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(ledger.total_paid)}</h3>
                <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled & Verified
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-xs bg-amber-50/20">
              <CardContent className="p-5">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Remaining Balance</span>
                <h3 className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(ledger.remaining_balance)}</h3>
                <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Scheduled in installments
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Installment Schedule Timeline */}
        {ledger && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">
                  Your Installment Schedule
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown of due dates and verification status
                </p>
              </div>
              <Link href="/student/fees" className="text-xs text-indigo-600 font-semibold hover:underline">
                Detailed Fee Ledger →
              </Link>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(ledger.installments || []).map((inst) => (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-xl border transition-all ${
                      inst.status === "paid"
                        ? "bg-emerald-50/40 border-emerald-200"
                        : inst.status === "overdue"
                        ? "bg-red-50/40 border-red-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{inst.title}</span>
                      <Badge
                        variant={
                          inst.status === "paid"
                            ? "success"
                            : inst.status === "overdue"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {inst.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-semibold text-slate-700">{formatDate(inst.due_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Installment Fee:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(inst.due_amount)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Paid So Far:</span>
                        <span className="font-semibold text-emerald-700">{formatCurrency(inst.paid_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent receipts & UPI status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verified Receipts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Official PDF Receipts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {receipts.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No verified receipts generated yet</p>
                ) : (
                  receipts.map((r) => (
                    <div key={r.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">{r.receipt_number}</span>
                        <span className="text-slate-500 text-[11px]">{formatDate(r.generated_at)} • {formatCurrency(r.amount_paid)}</span>
                      </div>
                      <a
                        href={getReceiptPdfUrl(r.receipt_number)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment submissions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Recent Submissions & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {payments.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No payment history yet</p>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">{formatCurrency(p.amount)}</span>
                        <span className="text-slate-500 text-[11px] font-mono">{p.transaction_ref || p.payment_method} • {formatDate(p.payment_date)}</span>
                      </div>
                      <Badge
                        variant={p.status === "verified" ? "success" : p.status === "pending_verification" ? "warning" : "destructive"}
                        className="capitalize text-[10px]"
                      >
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
