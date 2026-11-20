"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Download, ShieldCheck, Building2 } from "lucide-react";

export default function VerifyReceiptPage() {
  const params = useParams();
  const receiptNumber = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!receiptNumber) return;
    const verify = async () => {
      try {
        const res = await apiFetch(`/receipts/verify/${receiptNumber}`);
        setData(res);
      } catch {
        setData({ is_valid: false, message: "Receipt could not be verified" });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [receiptNumber]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Official Receipt Verification</h2>
          <p className="text-xs text-indigo-100 mt-1">Digital Certificate & Ledger Validation</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
            Validating receipt against database ledger...
          </div>
        ) : data?.is_valid ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">VERIFIED AUTHENTIC</h4>
                <p className="text-xs text-emerald-700">
                  This payment was recorded and validated by {data.institute_name}.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Receipt Number</span>
                <span className="font-mono font-bold text-slate-900">{data.receipt_number}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Student Name</span>
                <span className="font-semibold text-slate-800">{data.student_name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Student ID</span>
                <span className="font-mono text-slate-800">{data.student_id}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-indigo-700 text-sm">{formatCurrency(data.amount_paid)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Payment Date</span>
                <span className="text-slate-800">{data.payment_date}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="text-slate-800 uppercase font-medium">{data.payment_method}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-semibold text-slate-800">{formatCurrency(data.balance_after)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Verification Timestamp</span>
                <span className="text-slate-500">{data.verified_at}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`http://127.0.0.1:8000/receipts-pdf/${data.receipt_number}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
              >
                <Download className="h-4 w-4" /> Download Official PDF Receipt
              </a>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Invalid Receipt</h4>
            <p className="text-xs text-slate-500">
              Receipt code <b>{receiptNumber}</b> could not be verified in the institutional database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
