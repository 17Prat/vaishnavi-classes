"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Send, Copy, Check, PhoneCall, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  phone: string;
  initialTemplate?: string;
  installmentId?: string;
}

interface DeliveryResult {
  status: string;
  message_id: string;
  recipient_phone: string;
  recipient_name: string;
  message_text: string;
  delivered_via: string;
  delivered_at: string;
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
  const [recipientPhone, setRecipientPhone] = useState(phone || "");
  const [customAmount, setCustomAmount] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    setRecipientPhone(phone || "");
  }, [phone]);

  useEffect(() => {
    if (open && studentId) {
      setDeliveryResult(null);
      setSendError(null);
      loadPreview(template);
    }
  }, [open, template, studentId, customAmount, customDueDate]);

  const loadPreview = async (tmpl: string) => {
    setLoading(true);
    try {
      const res = await apiFetch("/reminders/generate", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          template_type: tmpl,
          installment_id: installmentId || undefined,
          recipient_phone: recipientPhone || undefined,
          custom_amount: customAmount ? parseFloat(customAmount) : undefined,
          custom_due_date: customDueDate || undefined,
        }),
      });
      setMessageText(res.message_text || "");
    } catch {
      setMessageText(
        `🏛️ *VAISHNAVI CLASSES*\n━━━━━━━━━━━━━━━━━━━━━━\n📢 *FEE NOTICE*\n\nDear Student / Parent of *${studentName}*,\n\nKindly note your fee installment for *Vaishnavi Classes*.\n\nUPI: \`vaishnaviclasses@upi\`\n\nThank you,\n*Vaishnavi Classes*`
      );
    } finally {
      setLoading(false);
    }
  };

  const cleanPhoneNumber = (raw: string) => {
    const digits = (raw || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length === 10) return "91" + digits;
    if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.slice(1);
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
  };

  // Direct send via backend API - NO new browser tab or WhatsApp web opened!
  const handleSendDirect = async () => {
    const clean = cleanPhoneNumber(recipientPhone);
    if (!clean) {
      setSendError("Please enter a valid recipient mobile number");
      return;
    }
    if (!messageText.trim()) {
      setSendError("Message text cannot be empty");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const result = await apiFetch<DeliveryResult>("/reminders/send-direct", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          template_type: template,
          installment_id: installmentId || undefined,
          recipient_phone: recipientPhone || undefined,
          custom_message: messageText || undefined,
          custom_amount: customAmount ? parseFloat(customAmount) : undefined,
          custom_due_date: customDueDate || undefined,
        }),
      });

      setDeliveryResult(result);
    } catch (err: any) {
      setSendError(err.message || "Failed to send WhatsApp message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Send via WhatsApp App / Web (Actual real delivery to recipient's phone)
  const handleOpenWhatsAppAndSend = () => {
    const clean = cleanPhoneNumber(recipientPhone);
    const encoded = encodeURIComponent(messageText);
    const waUrl = clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    // Record in database
    apiFetch("/reminders/generate", {
      method: "POST",
      body: JSON.stringify({
        student_id: studentId,
        template_type: template,
        installment_id: installmentId || undefined,
        recipient_phone: recipientPhone || undefined,
        custom_message: messageText || undefined,
        custom_amount: customAmount ? parseFloat(customAmount) : undefined,
        custom_due_date: customDueDate || undefined,
      }),
    }).catch(() => {});

    // Open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  const handleResetForAnother = () => {
    setDeliveryResult(null);
    setSendError(null);
    loadPreview(template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-10 w-10 rounded-xl object-cover shadow-xs border border-slate-200"
          />
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              Send WhatsApp Message
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Since 1996
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Deliver official Vaishnavi Classes reminders directly to recipient&apos;s phone WhatsApp.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {deliveryResult ? (
        /* Direct Send Success Card */
        <div className="my-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-base font-black text-emerald-900 leading-tight">
                Message Dispatched &amp; Recorded in System!
              </h4>
              <p className="text-sm text-emerald-700 font-semibold mt-0.5">
                Recipient: +{deliveryResult.recipient_phone} ({deliveryResult.recipient_name})
              </p>
            </div>
          </div>

          <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 text-sm space-y-2 font-mono text-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-600">Message ID:</span>
              <span className="font-bold text-slate-900">{deliveryResult.message_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Delivered At:</span>
              <span className="font-bold text-slate-900">{deliveryResult.delivered_at}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gateway:</span>
              <span className="font-black text-emerald-800">{deliveryResult.delivered_via}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Delivery Status:</span>
              <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-black uppercase text-xs">
                {deliveryResult.status}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium bg-emerald-100/70 p-3 rounded-xl border border-emerald-200 space-y-2.5">
            <p>
              💡 <strong>Real WhatsApp Delivery Note:</strong> Agar aapke phone par bina WhatsApp Web open kiye background me message deliver hona chahiye, toh Meta Cloud API ya UltraMsg ka token lagta hai. Agar bina kisi API ke free me abhi phone par message deliver karna hai, toh neeche &quot;Open in WhatsApp to Deliver&quot; dabayein.
            </p>
            <Button
              size="sm"
              onClick={handleOpenWhatsAppAndSend}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black gap-2 h-11"
            >
              <Send className="h-4 w-4" /> 📱 Open in WhatsApp to Deliver Now (+91 {cleanPhoneNumber(recipientPhone).slice(-10)})
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForAnother}
              className="text-xs sm:text-sm font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-100 flex-1 h-10"
            >
              Send Another
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex-1 h-10"
            >
              Done / Close
            </Button>
          </div>
        </div>
      ) : (
        /* Message Composition Form */
        <div className="space-y-3 my-1">
          {sendError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{sendError}</span>
            </div>
          )}

          {/* Template & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Message Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="upcoming_fee">Upcoming Fee Reminder</option>
                <option value="due_today">Due Today (Urgent Notice)</option>
                <option value="overdue_fee">Overdue Fee Notice</option>
                <option value="payment_confirmation">Payment Received Receipt</option>
                <option value="partial_payment">Partial Payment Update</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recipient WhatsApp Mobile *
              </label>
              <div className="relative">
                <PhoneCall className="h-3.5 w-3.5 absolute left-2.5 top-3 text-slate-400" />
                <Input
                  type="text"
                  placeholder="e.g. 9664257346"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="h-9 pl-8 text-xs font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Optional Custom Amount & Date */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Fee Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Due Date / Schedule
              </label>
              <Input
                type="text"
                placeholder="e.g. 25 Nov 2026"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Message Editor / Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Message Preview (Includes Vaishnavi Classes Branding):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
            </div>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={loading || sending}
              placeholder={loading ? "Generating official Vaishnavi Classes message..." : "Type or edit message..."}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Delivery Guide Card */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 leading-snug space-y-1">
            <p className="font-bold text-slate-900">📲 Delivery Options:</p>
            <p>
              • <strong>Send &amp; Deliver to Phone (Green Button)</strong>: Launches WhatsApp with this pre-filled message so it actually arrives on +91 {cleanPhoneNumber(recipientPhone).slice(-10)}&apos;s phone.
            </p>
            <p>
              • <strong>Save in System (Outline Button)</strong>: Logs and records the reminder in Vaishnavi Classes database without opening any external window.
            </p>
          </div>
        </div>
      )}

      {!deliveryResult && (
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendDirect}
            disabled={loading || sending || !messageText.trim()}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
            title="Log in system without opening WhatsApp"
          >
            {sending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Save in System Only
          </Button>
          <Button
            onClick={handleOpenWhatsAppAndSend}
            disabled={loading || sending || !messageText.trim()}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md shadow-emerald-200 text-xs px-5"
          >
            <Send className="h-4 w-4" />
            🚀 Send &amp; Deliver to Phone (+91 {cleanPhoneNumber(recipientPhone).slice(-10) || "Phone"})
          </Button>
        </DialogFooter>
      )}
    </Dialog>
  );
}
