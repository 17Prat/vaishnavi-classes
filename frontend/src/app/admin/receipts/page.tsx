"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, getReceiptPdfUrl } from "@/lib/api";
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Fee Receipts</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Download and print authentic institutional PDF receipts with verification QR codes.
          </p>
        </div>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by receipt number (e.g. REC-2026-0001) or student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 text-sm font-medium rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black text-sm tracking-wider border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Receipt Number</th>
                    <th className="py-4 px-5">Student</th>
                    <th className="py-4 px-5">Paid Amount</th>
                    <th className="py-4 px-5">Remaining Balance</th>
                    <th className="py-4 px-5">Method</th>
                    <th className="py-4 px-5">Date Issued</th>
                    <th className="py-4 px-5 text-right">PDF Actions</th>
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
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-indigo-700 text-base">
                          {r.receipt_number}
                        </td>
                        <td className="py-4 px-5">
                          <p className="font-black text-slate-900 text-lg leading-snug">{r.student_name}</p>
                          <span className="text-sm text-slate-600 font-mono font-bold">{r.student_id}</span>
                        </td>
                        <td className="py-4 px-5 font-black text-slate-900 text-xl">
                          {formatCurrency(r.amount_paid)}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-800 text-base">
                          {formatCurrency(r.balance_after)}
                        </td>
                        <td className="py-4 px-5 uppercase text-slate-900 font-bold text-base">
                          {r.payment_method}
                        </td>
                        <td className="py-4 px-5 text-slate-800 font-semibold text-base">
                          {formatDate(r.generated_at)}
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <a
                            href={getReceiptPdfUrl(r.receipt_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                          >
                            <Download className="h-4 w-4" /> Download PDF
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
