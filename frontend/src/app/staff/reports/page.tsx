"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Download } from "lucide-react";

export default function StaffReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/reports/collection-summary");
        setData(res);
      } catch {
        // Ignore
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Staff Collection Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review counter collections and payment channel summary.
            </p>
          </div>
          <a
            href={`${API_BASE_URL}/reports/export/csv?report_type=payments`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Download Payments CSV
          </a>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs border-indigo-100 bg-indigo-50/40">
              <CardContent className="p-5">
                <span className="text-xs text-indigo-700 font-bold uppercase">Total Collections</span>
                <h3 className="text-2xl font-bold text-indigo-900 mt-1">{formatCurrency(data.total_collected)}</h3>
                <p className="text-xs text-slate-500 mt-1">{data.total_transactions} verified receipts</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs md:col-span-2">
              <CardContent className="p-5">
                <span className="text-xs text-slate-500 font-bold uppercase block mb-3">Methods Breakdown</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.payment_methods.map((m: any, idx: number) => (
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
      </div>
    </DashboardLayout>
  );
}
