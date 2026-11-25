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
import { VerifyPaymentModal } from "@/components/payments/VerifyPaymentModal";
import { WhatsAppModal } from "@/components/reminders/WhatsAppModal";
import { CreditCard, CheckCircle2, ShieldAlert, Download, RotateCcw, MessageSquareShare } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedVerifyPayment, setSelectedVerifyPayment] = useState<Payment | null>(null);
  const [waPaymentStudent, setWaPaymentStudent] = useState<{ id: string; name: string; phone: string } | null>(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleReversePayment = async (paymentId: string) => {
    const reason = prompt("Enter required audit reason for payment reversal:");
    if (!reason) return;

    try {
      await apiFetch(`/payments/${paymentId}/reverse`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      alert("Payment reversed successfully and student ledger restored.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to reverse payment");
    }
  };

  const pendingPayments = payments.filter((p) => p.status === "pending_verification");
  const processedPayments = payments.filter((p) => p.status !== "pending_verification");

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Payment Collection & Reconciliation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify incoming student UPI transfers and record counter fee receipts.
            </p>
          </div>
          <Button onClick={() => setShowRecordModal(true)} className="gap-1.5 text-xs h-9">
            <CreditCard className="h-4 w-4" /> Record New Payment
          </Button>
        </div>

        {/* Pending Verification Section */}
        {pendingPayments.length > 0 && (
          <Card className="border-amber-300 bg-amber-50/20 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base text-amber-900 font-bold">
                  Pending UPI Payments ({pendingPayments.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-amber-100/50 text-amber-900 font-semibold border-b border-amber-200">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">UPI UTR Ref</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Student Notes</th>
                      <th className="py-2.5 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/50">
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-100/30">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{p.student_name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{p.student_login_id}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700 text-sm">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {p.transaction_ref}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic">
                          {p.notes || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedVerifyPayment(p)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 px-3"
                          >
                            Review & Verify
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processed Payments Ledger */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Transaction History & Audit Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {p.receipt_number || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{p.student_name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{p.student_login_id}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-600 font-medium">
                        {p.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={p.status === "verified" ? "success" : "destructive"}
                          className="capitalize text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {p.receipt_number && (
                          <>
                            <a
                              href={getReceiptPdfUrl(p.receipt_number)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
                            >
                              <Download className="h-3 w-3" /> PDF
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const st = students.find((s) => s.id === p.student_id);
                                setWaPaymentStudent({
                                  id: p.student_id,
                                  name: p.student_name,
                                  phone: st?.guardian_phone || st?.phone || "",
                                });
                              }}
                              className="h-7 text-[11px] px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              title="Send WhatsApp Receipt"
                            >
                              <MessageSquareShare className="h-3 w-3 mr-1" /> WhatsApp
                            </Button>
                          </>
                        )}
                        {p.status === "verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReversePayment(p.id)}
                            className="h-7 text-[10px] text-red-600 hover:bg-red-50 border-red-200"
                            title="Reverse Payment"
                          >
                            <RotateCcw className="h-3 w-3 mr-0.5" /> Reversal
                          </Button>
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
        open={showRecordModal}
        onOpenChange={setShowRecordModal}
        students={students}
        onSuccess={loadData}
      />

      <VerifyPaymentModal
        payment={selectedVerifyPayment}
        open={!!selectedVerifyPayment}
        onOpenChange={(op) => !op && setSelectedVerifyPayment(null)}
        onSuccess={loadData}
      />

      {waPaymentStudent && (
        <WhatsAppModal
          open={!!waPaymentStudent}
          onOpenChange={(op) => !op && setWaPaymentStudent(null)}
          studentId={waPaymentStudent.id}
          studentName={waPaymentStudent.name}
          phone={waPaymentStudent.phone}
          initialTemplate="payment_confirmation"
        />
      )}
    </DashboardLayout>
  );
}
