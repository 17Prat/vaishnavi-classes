"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, X, ShieldAlert } from "lucide-react";

interface VerifyPaymentModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VerifyPaymentModal({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: VerifyPaymentModalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!payment) return null;

  const handleAction = async (action: "verify" | "reject") => {
    setError("");
    setLoading(true);

    try {
      await apiFetch(`/payments/${payment.id}/verify`, {
        method: "POST",
        body: JSON.stringify({ action, notes: notes || undefined }),
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to process verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          Verify Student UPI Submission
        </DialogTitle>
        <DialogDescription>
          Verify bank statement reconciliation before approving this fee payment.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-2">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Student:</span>
            <span className="font-semibold text-slate-800">{payment.student_name} ({payment.student_login_id})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Claimed Amount:</span>
            <span className="font-bold text-indigo-700 text-sm">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">UTR / Reference:</span>
            <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
              {payment.transaction_ref || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Submission Date:</span>
            <span className="text-slate-800">{formatDate(payment.payment_date)}</span>
          </div>
          {payment.notes && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block">Student Note:</span>
              <p className="text-slate-700 italic mt-0.5">{payment.notes}</p>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Reconciliation Note (Optional)
          </label>
          <Input
            placeholder="e.g. Matched with HDFC Bank Statement on 20 Nov"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="destructive"
          onClick={() => handleAction("reject")}
          disabled={loading}
          className="gap-1.5"
        >
          <X className="h-4 w-4" /> Reject Payment
        </Button>
        <Button
          type="button"
          variant="success"
          onClick={() => handleAction("verify")}
          disabled={loading}
          className="gap-1.5"
        >
          <Check className="h-4 w-4" /> Verify & Issue Receipt
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
