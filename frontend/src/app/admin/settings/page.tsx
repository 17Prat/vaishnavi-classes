"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Save, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";

export default function AdminSettingsPage() {
  const [name, setName] = useState("Apex Institute of Science & Technology");
  const [code, setCode] = useState("APEX01");
  const [email, setEmail] = useState("contact@apexinstitute.edu");
  const [phone, setPhone] = useState("+91 98234 56789");
  const [address, setAddress] = useState("742 Evergreen Road, Tech Hub Campus, Pune, MH 411001");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [upiId, setUpiId] = useState("apexinstitute@upi");
  const [receiptPrefix, setReceiptPrefix] = useState("REC-2026-");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institute Profile & Receipt Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institute branding, receipt numbering prefixes, and UPI payment credentials.
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Institute settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* General info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> General Institute Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institute Legal Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institution Code</label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Campus Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Payment & Receipts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-purple-600" /> UPI & PDF Receipt Numbering
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institute UPI ID (VPA)</label>
                  <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Currency Symbol</label>
                  <Input value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Receipt Number Prefix</label>
                  <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  Allow students to submit online UPI UTR numbers for cashier review
                </label>
                <label className="flex items-center gap-2 text-slate-700 mt-2">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  Enable Click-to-Chat WhatsApp Reminders with pre-filled templates
                </label>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 p-4">
              <Button type="submit" className="gap-2 text-xs">
                <Save className="h-4 w-4" /> Save Institute Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
