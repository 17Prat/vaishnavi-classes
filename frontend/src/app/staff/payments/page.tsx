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
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.receipt_number || "PENDING"}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.student_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 uppercase text-slate-600">{p.payment_method}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.status === "verified" ? "success" : "warning"} className="capitalize text-[10px]">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(p.payment_date)}</td>
                      <td className="py-3 px-4 text-right">
                        {p.receipt_number && (
                          <a
                            href={getReceiptPdfUrl(p.receipt_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
                          >
                            <Download className="h-3 w-3" /> Download
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
