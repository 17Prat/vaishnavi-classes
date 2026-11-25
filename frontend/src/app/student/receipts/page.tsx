"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiFetch, getReceiptPdfUrl } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt } from "@/types";
import { Receipt as ReceiptIcon, Download, QrCode } from "lucide-react";

export default function StudentReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/receipts");
        setReceipts(data);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Verified Fee Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download and print authentic institutional fee receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 text-xs">
              No verified receipts available yet. Once payments are verified, receipts appear here.
            </div>
          ) : (
            receipts.map((r) => (
              <Card key={r.id} className="shadow-xs hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-indigo-700 text-xs block">{r.receipt_number}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(r.generated_at)}</span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <QrCode className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid Amount:</span>
                    <span className="font-bold text-slate-900 text-sm">{formatCurrency(r.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(r.balance_after)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="uppercase text-slate-700">{r.payment_method}</span>
                  </div>

                  <div className="pt-2">
                    <a
                      href={getReceiptPdfUrl(r.receipt_number)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF Receipt
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
