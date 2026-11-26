"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart3, Download, FileSpreadsheet, AlertTriangle } from "lucide-react";

export default function AdminReportsPage() {
  const [collectionData, setCollectionData] = useState<any>(null);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [sum, defs] = await Promise.all([
          apiFetch("/reports/collection-summary"),
          apiFetch("/reports/defaulters"),
        ]);
        setCollectionData(sum);
        setDefaulters(defs);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports & Defaulter Tracking</h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Analyze collections, payment channel distribution, and overdue aging accounts.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`${API_BASE_URL}/reports/export/csv?report_type=payments`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" /> Payments CSV
            </a>
            <a
              href={`${API_BASE_URL}/reports/export/csv?report_type=fee_ledger`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" /> Fee Ledger CSV
            </a>
          </div>
        </div>

        {/* 30-Day Summary Cards */}
        {collectionData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs border-indigo-100 bg-indigo-50/30">
              <CardContent className="p-5">
                <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">
                  30-Day Total Collections
                </span>
                <h3 className="text-2xl font-bold text-indigo-900 mt-1">
                  {formatCurrency(collectionData.total_collected)}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {collectionData.total_transactions} verified transactions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs md:col-span-2">
              <CardContent className="p-5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-3">
                  Channel Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.isArray(collectionData.payment_methods) && collectionData.payment_methods.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">{m.method}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(m.amount)}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{m.transactions} txns</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Defaulter Students Table */}
        <Card className="shadow-sm border-red-200/80">
          <CardHeader className="pb-3 border-b border-red-100 bg-red-50/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg text-red-950 font-bold">
                Fee Defaulters & Overdue Aging List ({defaulters.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-red-100/70 text-red-950 font-bold text-xs uppercase tracking-wider border-b border-red-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Course / Batch</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Overdue Amount</th>
                    <th className="py-3.5 px-4 text-right">Aging Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No overdue students found! All fees up to date.
                      </td>
                    </tr>
                  ) : (
                    defaulters.map((d) => (
                      <tr key={d.student_profile_id} className="hover:bg-red-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-base">{d.student_name}</p>
                          <span className="text-xs text-slate-600 font-mono font-semibold">{d.student_login_id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 text-sm">{d.batch_name || "General"}</p>
                          <span className="text-xs text-slate-500 font-medium">{d.course_name || ""}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-sm">
                          {d.guardian_phone || d.student_phone || "No phone"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium text-sm">
                          {formatDate(d.due_date)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-red-700 text-base">
                          {formatCurrency(d.overdue_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge variant="destructive" className="font-mono text-xs font-bold px-3 py-1">
                            {d.days_overdue} Days Late
                          </Badge>
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
    </DashboardLayout>
  );
}
