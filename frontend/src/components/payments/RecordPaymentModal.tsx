"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Student } from "@/types";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  preSelectedStudentId?: string;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  students,
  preSelectedStudentId,
  onSuccess,
}: RecordPaymentModalProps) {
  const [studentId, setStudentId] = useState(preSelectedStudentId || (students[0]?.id || ""));
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState<{ receipt_number: string; pdf_url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/payments/record", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          amount: parseFloat(amount),
          payment_method: method,
          transaction_ref: ref || undefined,
          notes: notes || undefined,
        }),
      });

      setSuccessResult({
        receipt_number: res.receipt_number,
        pdf_url: res.pdf_url,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    setAmount("");
    setRef("");
    setNotes("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>Record Offline / Direct Fee Payment</DialogTitle>
        <DialogDescription>
          Record verified fee collections in Cash, UPI, Bank Transfer, or Cheque.
        </DialogDescription>
      </DialogHeader>

      {successResult ? (
        <div className="py-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Payment Recorded Successfully!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Receipt No: <span className="font-mono font-semibold text-slate-800">{successResult.receipt_number}</span>
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <a
              href={`http://127.0.0.1:8000${successResult.pdf_url}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF Receipt
            </a>
            <Button variant="outline" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.student_id} — {s.full_name} (Balance: ₹{s.remaining_balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Amount (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cash">Cash Counter</option>
                <option value="upi">Direct UPI Transfer</option>
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="cheque">Bank Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Transaction / Reference / Cheque No
            </label>
            <Input
              placeholder="e.g. UPI Ref / Cheque #492810"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notes
            </label>
            <Input
              placeholder="e.g. Handed over at main reception"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record & Issue Receipt"}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
