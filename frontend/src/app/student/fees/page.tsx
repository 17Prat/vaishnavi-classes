"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { FeeLedger } from "@/types";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function StudentFeeLedgerPage() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState<FeeLedger | null>(null);

  useEffect(() => {
    if (!user?.student_profile_id) return;
    const load = async () => {
      try {
        const data = await apiFetch(`/students/${user.student_profile_id}/ledger`);
        setLedger(data);
      } catch {
        // Ignore
      }
    };
    load();
  }, [user]);

  if (!ledger) {
    return (
      <DashboardLayout allowedRoles={["student"]}>
        <div className="p-12 text-center text-slate-400 text-sm">Loading fee ledger...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Fee Ledger Statement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of tuition, admission, discounts, scholarships, and installment schedules.
          </p>
        </div>

        {/* Ledger Breakdown Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {ledger.fee_plan_name}
                </CardTitle>
                <p className="text-xs text-slate-500">Student: {ledger.student_name} ({ledger.login_id})</p>
              </div>
              <Badge variant={ledger.status === "paid" ? "success" : "warning"} className="uppercase">
                {ledger.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="space-y-2 pb-3 border-b border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-600">Admission & Registration Fee:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(ledger.admission_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tuition Fee:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(ledger.tuition_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Examination Fee:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(ledger.examination_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Library & Laboratory Fee:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(ledger.library_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transport Fee:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(ledger.transport_fee)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 text-slate-800">
                <span>Base Gross Fee:</span>
                <span>{formatCurrency(ledger.base_amount)}</span>
              </div>
            </div>

            {/* Concessions */}
            {(ledger.discount_amount > 0 || ledger.scholarship_amount > 0) && (
              <div className="space-y-2 pb-3 border-b border-slate-100 bg-emerald-50/40 p-3 rounded-lg">
                <p className="font-bold text-emerald-800">Waivers & Scholarships Applied:</p>
                {ledger.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount / Waiver:</span>
                    <span>- {formatCurrency(ledger.discount_amount)}</span>
                  </div>
                )}
                {ledger.scholarship_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Academic Scholarship:</span>
                    <span>- {formatCurrency(ledger.scholarship_amount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total summaries */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>Net Payable Amount:</span>
                <span className="text-indigo-700">{formatCurrency(ledger.net_payable)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Total Amount Paid:</span>
                <span>{formatCurrency(ledger.total_paid)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-amber-700 pt-1 border-t border-slate-200">
                <span>Remaining Balance Due:</span>
                <span>{formatCurrency(ledger.remaining_balance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installment Details Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-xl font-black text-slate-900">
              Installment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black text-sm tracking-wider border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">#</th>
                    <th className="py-4 px-5">Installment Title</th>
                    <th className="py-4 px-5">Due Date</th>
                    <th className="py-4 px-5">Due Amount</th>
                    <th className="py-4 px-5">Paid Amount</th>
                    <th className="py-4 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledger.installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-black text-slate-800 text-base">{inst.installment_number}</td>
                      <td className="py-4 px-5 font-black text-slate-900 text-lg">{inst.title}</td>
                      <td className="py-4 px-5 text-slate-800 font-semibold text-base">{formatDate(inst.due_date)}</td>
                      <td className="py-4 px-5 font-black text-slate-900 text-xl">{formatCurrency(inst.due_amount)}</td>
                      <td className="py-4 px-5 font-black text-emerald-700 text-xl">{formatCurrency(inst.paid_amount)}</td>
                      <td className="py-4 px-5 text-right">
                        <Badge
                          variant={inst.status === "paid" ? "success" : inst.status === "overdue" ? "destructive" : "warning"}
                          className="capitalize text-xs font-black px-3.5 py-1.5 uppercase tracking-wide"
                        >
                          {inst.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
