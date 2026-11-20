"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt } from "@/types";
import { Receipt as ReceiptIcon, Search, Download, Printer, QrCode } from "lucide-react";

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const res = await apiFetch("/receipts");
        setReceipts(res);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadReceipts();
  }, []);

  const filteredReceipts = receipts.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.receipt_number.toLowerCase().includes(q) ||
      (r.student_name && r.student_name.toLowerCase().includes(q)) ||
      (r.student_id && r.student_id.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verified Fee Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download and print authentic institutional PDF receipts with verification QR codes.
          </p>
        </div>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by receipt number (e.g. REC-2026-0001) or student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt Number</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Remaining Balance</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4 text-right">PDF Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No receipts found
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {r.receipt_number}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{r.student_name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{r.student_id}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(r.amount_paid)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {formatCurrency(r.balance_after)}
                        </td>
                        <td className="py-3 px-4 uppercase text-slate-600 font-medium">
                          {r.payment_method}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(r.generated_at)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <a
                            href={`http://127.0.0.1:8000/receipts-pdf/${r.receipt_number}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" /> Download PDF
                          </a>
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
