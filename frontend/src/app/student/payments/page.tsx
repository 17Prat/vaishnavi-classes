"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Payment } from "@/types";
import { QrCode, Send, CheckCircle2, ShieldAlert } from "lucide-react";

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeUpi, setActiveUpi] = useState<any>({
    upi_id: "vaishnaviclasses@upi",
    account_holder_name: "Vaishnavi Classes",
    display_name: "Vaishnavi Classes Official"
  });
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [payList, upiList] = await Promise.all([
        apiFetch("/payments"),
        apiFetch("/settings/upi-accounts").catch(() => []),
      ]);
      setPayments(payList || []);
      if (upiList && upiList.length > 0) {
        const def = upiList.find((u: any) => u.is_default) || upiList[0];
        setActiveUpi(def);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/payments/submit-upi", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          transaction_ref: ref.trim(),
          notes: notes || undefined,
        }),
      });
      setSuccess(true);
      setAmount("");
      setRef("");
      setNotes("");
      loadData();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit UPI payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fee Payments & UPI Submissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transfer fees to the institute's official UPI ID and submit your 12-digit UTR reference for verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instructions & UPI Details */}
          <Card className="shadow-sm border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-indigo-600" /> Institute Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-indigo-200">
                <span className="text-slate-500 block text-[11px] font-semibold">Official Institute UPI ID (VPA):</span>
                <span className="font-mono font-extrabold text-indigo-700 text-sm select-all block mt-0.5">
                  {activeUpi.upi_id}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Name: {activeUpi.account_holder_name}
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <p className="font-bold text-slate-800">Payment Instructions:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open Google Pay, PhonePe, Paytm, or BHIM UPI app.</li>
                  <li>Transfer installment amount to <b className="text-indigo-900">{activeUpi.upi_id}</b>.</li>
                  <li>Copy the 12-digit UPI Reference Number / UTR.</li>
                  <li>Submit the form with your UTR. Accounts staff will verify and release your official receipt with authorized e-signature.</li>
                </ol>
              </div>

              <div className="pt-1 border-t border-indigo-100 text-[11px] text-slate-500">
                <span>WhatsApp Helpline: <b>+91 96642 57346</b></span>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Submit UPI Reference (UTR) for Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {success && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  UPI Reference submitted successfully! Status is Pending Verification.
                </div>
              )}
              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitUpi} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Amount Transferred (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 13750"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">12-Digit UPI Ref / UTR *</label>
                    <Input
                      placeholder="e.g. 483920194829"
                      value={ref}
                      onChange={(e) => setRef(e.target.value)}
                      required
                      className="font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notes / Remarks (Optional)</label>
                  <Input
                    placeholder="e.g. Paid from father's Google Pay account"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading} className="gap-2 text-xs">
                  <Send className="h-3.5 w-3.5" />
                  {loading ? "Submitting..." : "Submit for Verification"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">
              Your Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Receipt / Ref</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {p.receipt_number || p.transaction_ref || "PENDING"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 uppercase text-slate-600">{p.payment_method}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(p.payment_date)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={p.status === "verified" ? "success" : p.status === "pending_verification" ? "warning" : "destructive"}
                          className="capitalize text-[10px]"
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
