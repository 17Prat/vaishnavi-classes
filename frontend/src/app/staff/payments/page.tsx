"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch, getReceiptPdfUrl } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Payment, Student } from "@/types";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { CreditCard, Download } from "lucide-react";

export default function StaffPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const [p, s] = await Promise.all([
        apiFetch("/payments"),
        apiFetch("/students"),
      ]);
      setPayments(p);
      setStudents(s);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fee Collection Counter</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record payments, update student ledgers, and issue official PDF receipts.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-1.5 text-xs h-9">
            <CreditCard className="h-4 w-4" /> Collect Fee Now
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">
              Payment Transaction Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black text-sm tracking-wider border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Receipt</th>
                    <th className="py-4 px-5">Student</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Method</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-indigo-700 text-base">{p.receipt_number || "PENDING"}</td>
                      <td className="py-4 px-5 font-black text-slate-900 text-lg">{p.student_name}</td>
                      <td className="py-4 px-5 font-black text-slate-900 text-xl">{formatCurrency(p.amount)}</td>
                      <td className="py-4 px-5 uppercase text-slate-900 font-bold text-base">{p.payment_method}</td>
                      <td className="py-4 px-5">
                        <Badge variant={p.status === "verified" ? "success" : "warning"} className="capitalize text-xs font-black px-3.5 py-1.5 uppercase tracking-wide">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-slate-800 font-semibold text-base">{formatDate(p.payment_date)}</td>
                      <td className="py-4 px-5 text-right">
                        {p.receipt_number && (
                          <a
                            href={getReceiptPdfUrl(p.receipt_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold shadow-xs transition-colors"
                          >
                            <Download className="h-4 w-4" /> Download
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
        open={showModal}
        onOpenChange={setShowModal}
        students={students}
        onSuccess={load}
      />
    </DashboardLayout>
  );
}
