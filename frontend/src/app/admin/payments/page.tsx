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

  const pendingPayments = (payments || []).filter((p) => p.status === "pending_verification");
  const processedPayments = (payments || []).filter((p) => p.status !== "pending_verification");

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Collection & Reconciliation</h2>
            <p className="text-base font-semibold text-slate-600 mt-1">
              Verify incoming student UPI transfers and record counter fee receipts.
            </p>
          </div>
          <Button onClick={() => setShowRecordModal(true)} className="gap-2.5 text-base font-bold h-12 px-6 shadow-sm">
            <CreditCard className="h-5 w-5" /> Record New Payment
          </Button>
        </div>

        {/* Pending Verification Section */}
        {pendingPayments.length > 0 && (
          <Card className="border-amber-300 bg-amber-50/30 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-xl text-amber-950 font-black">
                  Pending UPI Payments ({pendingPayments.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-base text-left">
                  <thead className="bg-amber-100/80 text-amber-950 font-black text-sm uppercase tracking-wider border-b border-amber-200">
                    <tr>
                      <th className="py-4 px-5">Student</th>
                      <th className="py-4 px-5">Amount</th>
                      <th className="py-4 px-5">UPI UTR Ref</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5">Student Notes</th>
                      <th className="py-4 px-5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/50">
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-100/40">
                        <td className="py-4 px-5">
                          <p className="font-black text-slate-900 text-base">{p.student_name}</p>
                          <span className="text-sm text-slate-600 font-mono font-bold">{p.student_login_id}</span>
                        </td>
                        <td className="py-4 px-5 font-black text-indigo-700 text-lg">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 text-base">
                          {p.transaction_ref}
                        </td>
                        <td className="py-4 px-5 text-slate-800 font-semibold text-base">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="py-4 px-5 text-slate-600 italic text-base">
                          {p.notes || "—"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedVerifyPayment(p)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-9 px-4 shadow-xs rounded-xl"
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
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-xl font-black text-slate-900">
              Transaction History & Audit Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black text-sm tracking-wider border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Receipt No</th>
                    <th className="py-4 px-5">Student</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Method</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Payment Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-indigo-700 text-base">
                        {p.receipt_number || "—"}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-black text-slate-900 text-lg leading-snug">{p.student_name}</p>
                        <span className="text-sm text-slate-600 font-mono font-bold mt-0.5 block">{p.student_login_id}</span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 text-xl">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-5 uppercase text-slate-900 font-bold text-base">
                        {p.payment_method}
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant={p.status === "verified" ? "success" : "destructive"}
                          className="capitalize text-xs font-black px-3.5 py-1.5 uppercase tracking-wide"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-slate-800 font-semibold text-base">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        {p.receipt_number && (
                          <>
                            <a
                              href={getReceiptPdfUrl(p.receipt_number)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold shadow-xs transition-colors"
                            >
                              <Download className="h-4 w-4" /> PDF
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
                              className="h-9 text-xs font-bold px-3.5 border-emerald-400 text-emerald-800 hover:bg-emerald-50 rounded-xl shadow-xs"
                              title="Send WhatsApp Receipt"
                            >
                              <MessageSquareShare className="h-4 w-4 mr-1" /> WhatsApp
                            </Button>
                          </>
                        )}
                        {p.status === "verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReversePayment(p.id)}
                            className="h-9 text-xs font-bold px-3 text-red-600 hover:bg-red-50 border-red-200 rounded-xl"
                            title="Reverse Payment"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" /> Reversal
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
