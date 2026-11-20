"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Send, MessageSquareShare, ExternalLink } from "lucide-react";

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  phone: string;
  initialTemplate?: string;
  installmentId?: string;
}

export function WhatsAppModal({
  open,
  onOpenChange,
  studentId,
  studentName,
  phone,
  initialTemplate = "upcoming_fee",
  installmentId,
}: WhatsAppModalProps) {
  const [template, setTemplate] = useState(initialTemplate);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{ message_text: string; whatsapp_url: string } | null>(null);

  React.useEffect(() => {
    if (open && studentId) {
      loadPreview(template);
    }
  }, [open, template, studentId]);

  const loadPreview = async (tmpl: string) => {
    setLoading(true);
    try {
      const res = await apiFetch("/reminders/generate", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          template_type: tmpl,
          installment_id: installmentId || undefined,
        }),
      });
      setPreviewData(res);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (previewData?.whatsapp_url) {
      window.open(previewData.whatsapp_url, "_blank");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <MessageSquareShare className="h-5 w-5 text-emerald-600" />
          Send WhatsApp Fee Reminder
        </DialogTitle>
        <DialogDescription>
          Pre-fills a personalized message template and opens WhatsApp Click-to-Chat directly.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Select Reminder Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="upcoming_fee">Upcoming Fee (Gentle Reminder)</option>
            <option value="due_today">Due Today (Urgent Action)</option>
            <option value="overdue_fee">Overdue Fee (Immediate Notice)</option>
            <option value="partial_payment">Partial Payment Acknowledgment</option>
            <option value="payment_confirmation">Payment Received Confirmation</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Recipient Contact
          </label>
          <p className="text-xs font-medium text-slate-800 bg-slate-100 px-3 py-2 rounded-lg">
            {studentName} ({phone || "No phone registered"})
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Message Preview (Pre-filled for WhatsApp)
          </label>
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-sans min-h-24">
            {loading ? "Generating customized message..." : (previewData?.message_text || "No preview")}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          onClick={handleOpenWhatsApp}
          disabled={!previewData?.whatsapp_url || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-emerald-200"
        >
          <Send className="h-4 w-4" /> Open WhatsApp Web / App
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
