"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import {
  Building2,
  Save,
  CheckCircle2,
  QrCode,
  PenTool,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Star,
  FileText,
  ShieldCheck,
  Check
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("institute");
  const [savedMessage, setSavedMessage] = useState("");

  // Institute profile state
  const [name, setName] = useState("Vaishnavi Classes");
  const [code, setCode] = useState("VAISHNAVI01");
  const [email, setEmail] = useState("contact@vaishnaviclasses.com");
  const [phone, setPhone] = useState("+91 96642 57346");
  const [address, setAddress] = useState("Vaishnavi Classes Main Branch Campus");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [receiptPrefix, setReceiptPrefix] = useState("REC-2026-");
  const [savingInstitute, setSavingInstitute] = useState(false);

  // E-Signature state
  const [signatoryName, setSignatoryName] = useState("Director / Authorized Signatory");
  const [signatoryDesignation, setSignatoryDesignation] = useState("Director & Head of Institute");
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [savingSignature, setSavingSignature] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // UPI Accounts state
  const [upiAccounts, setUpiAccounts] = useState<any[]>([]);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState("");
  const [newUpiName, setNewUpiName] = useState("Vaishnavi Classes");
  const [newUpiDisplay, setNewUpiDisplay] = useState("Vaishnavi Classes Official");
  const [newUpiDefault, setNewUpiDefault] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);

  const showNotification = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 4000);
  };

  const loadSettings = async () => {
    try {
      const [inst, upiList] = await Promise.all([
        apiFetch("/settings/institute"),
        apiFetch("/settings/upi-accounts"),
      ]);
      if (inst) {
        setName(inst.name || "Vaishnavi Classes");
        setCode(inst.code || "VAISHNAVI01");
        setEmail(inst.email || "");
        setPhone(inst.phone || "+91 96642 57346");
        setAddress(inst.address || "Vaishnavi Classes Main Campus");
        setCurrencySymbol(inst.currency_symbol || "₹");
        setReceiptPrefix(inst.receipt_prefix || "REC-2026-");
        setSignatoryName(inst.signatory_name || "Director / Authorized Signatory");
        setSignatoryDesignation(inst.signatory_designation || "Director & Head of Institute");
        setSignatureEnabled(inst.signature_enabled !== false);
        if (inst.signature_data_url || inst.signature_image_path) {
          setSignatureDataUrl(inst.signature_data_url || inst.signature_image_path);
        }
      }
      setUpiAccounts(upiList || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e1b4b"; // Dark navy ink
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveDrawnSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    setSavingSignature(true);
    try {
      await apiFetch("/settings/signature", {
        method: "PUT",
        body: JSON.stringify({
          signatory_name: signatoryName,
          signatory_designation: signatoryDesignation,
          signature_enabled: signatureEnabled,
          signature_data_url: dataUrl,
        }),
      });
      showNotification("Digital E-Signature drawn and saved to fee receipts!");
    } catch (err: any) {
      alert("Failed to save signature: " + (err.message || "Unknown error"));
    } finally {
      setSavingSignature(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setSignatureDataUrl(dataUrl);
      try {
        await apiFetch("/settings/signature", {
          method: "PUT",
          body: JSON.stringify({
            signatory_name: signatoryName,
            signatory_designation: signatoryDesignation,
            signature_enabled: signatureEnabled,
            signature_data_url: dataUrl,
          }),
        });
        showNotification("Signature file uploaded and enabled for receipts!");
      } catch (err: any) {
        alert("Failed to upload signature: " + (err.message || "Unknown error"));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSignatureSettings = async () => {
    setSavingSignature(true);
    try {
      await apiFetch("/settings/signature", {
        method: "PUT",
        body: JSON.stringify({
          signatory_name: signatoryName,
          signatory_designation: signatoryDesignation,
          signature_enabled: signatureEnabled,
        }),
      });
      showNotification("Receipt Signatory details updated successfully!");
    } catch (err: any) {
      alert("Failed to update signatory settings: " + (err.message || "Unknown error"));
    } finally {
      setSavingSignature(false);
    }
  };

  const handleSaveInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInstitute(true);
    try {
      await apiFetch("/settings/institute", {
        method: "PUT",
        body: JSON.stringify({
          name,
          code,
          email,
          phone,
          address,
          currency_symbol: currencySymbol,
          receipt_prefix: receiptPrefix,
        }),
      });
      showNotification("Institute settings updated successfully!");
    } catch (err: any) {
      alert("Failed to save settings: " + (err.message || "Unknown error"));
    } finally {
      setSavingInstitute(false);
    }
  };

  const handleAddUpiAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim()) return;
    setSavingUpi(true);
    try {
      await apiFetch("/settings/upi-accounts", {
        method: "POST",
        body: JSON.stringify({
          account_holder_name: newUpiName.trim(),
          upi_id: newUpiId.trim(),
          display_name: newUpiDisplay.trim() || newUpiName.trim(),
          is_default: newUpiDefault,
          is_active: true,
        }),
      });
      setShowAddUpiModal(false);
      setNewUpiId("");
      showNotification("New UPI payment account registered!");
      const updated = await apiFetch("/settings/upi-accounts");
      setUpiAccounts(updated || []);
    } catch (err: any) {
      alert("Failed to add UPI account: " + (err.message || "Unknown error"));
    } finally {
      setSavingUpi(false);
    }
  };

  const handleSetDefaultUpi = async (id: string) => {
    try {
      await apiFetch(`/settings/upi-accounts/${id}/set-default`, { method: "POST" });
      const updated = await apiFetch("/settings/upi-accounts");
      setUpiAccounts(updated || []);
      showNotification("Default UPI account updated!");
    } catch (err: any) {
      alert("Failed to update default UPI: " + err.message);
    }
  };

  const handleDeleteUpi = async (id: string) => {
    if (!confirm("Are you sure you want to delete this UPI account?")) return;
    try {
      await apiFetch(`/settings/upi-accounts/${id}`, { method: "DELETE" });
      const updated = await apiFetch("/settings/upi-accounts");
      setUpiAccounts(updated || []);
      showNotification("UPI account removed.");
    } catch (err: any) {
      alert("Failed to delete UPI account: " + err.message);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System &amp; Financial Settings</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Configure institute details, dynamic UPI accounts, and official E-Signature for fee receipts.
          </p>
        </div>

        {savedMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {savedMessage}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-12 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <TabsTrigger value="institute" className="text-xs sm:text-sm font-bold px-4 py-2 gap-2">
              <Building2 className="h-4 w-4" /> Institute Profile
            </TabsTrigger>
            <TabsTrigger value="upi" className="text-xs sm:text-sm font-bold px-4 py-2 gap-2">
              <QrCode className="h-4 w-4" /> UPI Payment Settings ({upiAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="signature" className="text-xs sm:text-sm font-bold px-4 py-2 gap-2">
              <PenTool className="h-4 w-4" /> Receipt E-Signature
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Institute Profile */}
          <TabsContent value="institute" className="mt-4">
            <form onSubmit={handleSaveInstitute} className="space-y-5">
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <Building2 className="h-5 w-5 text-indigo-600" /> General Institute Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Institute Legal Name *</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-10 text-xs" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Institution Code *</label>
                      <Input value={code} onChange={(e) => setCode(e.target.value)} required className="h-10 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Official Support Email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-xs" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">WhatsApp &amp; Contact Mobile</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Campus Address</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 text-xs" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Currency Symbol</label>
                      <Input value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className="h-10 text-xs" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Receipt Number Prefix</label>
                      <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} className="h-10 text-xs" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-slate-100 p-4">
                  <Button type="submit" disabled={savingInstitute} className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4" /> {savingInstitute ? "Saving..." : "Save Institute Profile"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* TAB 2: UPI Payment Accounts */}
          <TabsContent value="upi" className="mt-4 space-y-4">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-indigo-600" /> Institute UPI Collection Accounts
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure VPA addresses for student fee payments and automated QR code generation.
                  </p>
                </div>
                <Button onClick={() => setShowAddUpiModal(true)} size="sm" className="gap-1.5 text-xs font-bold">
                  <Plus className="h-4 w-4" /> Add UPI Account
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upiAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border transition-all ${
                        acc.is_default
                          ? "bg-indigo-50/50 border-indigo-300 shadow-xs"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{acc.display_name || acc.account_holder_name}</h4>
                            {acc.is_default && (
                              <Badge className="bg-indigo-600 text-[10px] font-bold">PRIMARY / DEFAULT</Badge>
                            )}
                          </div>
                          <p className="text-xs font-mono font-bold text-indigo-700 mt-1">{acc.upi_id}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Holder: {acc.account_holder_name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!acc.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefaultUpi(acc.id)}
                              className="h-8 px-2 text-xs font-semibold text-slate-600"
                              title="Set as Default"
                            >
                              <Star className="h-3.5 w-3.5" /> Make Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUpi(acc.id)}
                            className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Live UPI String Preview */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>URI: <code className="text-slate-700">upi://pay?pa={acc.upi_id}</code></span>
                        <span className="font-semibold text-emerald-700">Active for QR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Receipt & E-Signature Settings */}
          <TabsContent value="signature" className="mt-4 space-y-5">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <PenTool className="h-5 w-5 text-indigo-600" /> Digital E-Signature &amp; Authorized Signatory
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Enable on Receipts</span>
                    <input
                      type="checkbox"
                      checked={signatureEnabled}
                      onChange={(e) => setSignatureEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Draw or upload your digital signature. It will be printed directly above the &ldquo;Authorized Signature&rdquo; line on all official fee receipt PDFs.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-5 text-xs">
                {/* Signatory Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Signatory Full Name</label>
                    <Input
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      placeholder="e.g. Director / Authorized Signatory"
                      className="h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Official Designation</label>
                    <Input
                      value={signatoryDesignation}
                      onChange={(e) => setSignatoryDesignation(e.target.value)}
                      placeholder="e.g. Director & Head of Institute"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                {/* Signature Drawing & Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Drawing Pad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <PenTool className="h-3.5 w-3.5 text-indigo-600" /> Draw Signature Pad (Mouse or Touch)
                      </label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> Clear
                      </button>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 p-1 flex justify-center items-center">
                      <canvas
                        ref={canvasRef}
                        width={380}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-white rounded-lg cursor-crosshair w-full max-w-[380px] h-[120px] touch-none shadow-2xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Sign in the box above cleanly</span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveDrawnSignature}
                        disabled={!hasDrawn || savingSignature}
                        className="h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Use Drawn Signature
                      </Button>
                    </div>
                  </div>

                  {/* Upload Image & Live Preview */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-indigo-600" /> Or Upload Signature Image (PNG / JPG)
                    </label>
                    <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />

                      {/* Live Receipt Footer Preview Box */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Official Receipt Footer Preview
                        </span>
                        <div className="h-14 flex items-center justify-center">
                          {signatureDataUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={signatureDataUrl}
                              alt="Active E-Signature"
                              className="max-h-12 max-w-[160px] object-contain mx-auto"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs italic">No signature uploaded yet</span>
                          )}
                        </div>
                        <div className="border-t border-slate-300 w-36 mx-auto pt-1">
                          <p className="font-extrabold text-slate-900 text-xs">{signatoryName}</p>
                          <p className="text-[10px] text-slate-500">{signatoryDesignation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-slate-100 p-4">
                <Button
                  onClick={handleSaveSignatureSettings}
                  disabled={savingSignature}
                  className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="h-4 w-4" /> {savingSignature ? "Updating..." : "Save Signatory Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add UPI Account Modal */}
      <Dialog open={showAddUpiModal} onOpenChange={setShowAddUpiModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" /> Register New Institute UPI Account
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add a bank VPA for student fees. QR codes will be generated dynamically using standard UPI standards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddUpiAccount} className="space-y-3.5 my-2 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">UPI VPA (e.g. 9664257346@upi or classes@okaxis) *</label>
            <Input
              placeholder="e.g. vaishnaviclasses@okaxis"
              value={newUpiId}
              onChange={(e) => setNewUpiId(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Account Holder / Institute Name *</label>
            <Input
              value={newUpiName}
              onChange={(e) => setNewUpiName(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Display Label</label>
            <Input
              value={newUpiDisplay}
              onChange={(e) => setNewUpiDisplay(e.target.value)}
              placeholder="e.g. Primary Admission Desk QR"
              className="h-10 text-xs"
            />
          </div>
          <div className="pt-1">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newUpiDefault}
                onChange={(e) => setNewUpiDefault(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="font-bold">Set as Default Primary UPI for Student Payments</span>
            </label>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddUpiModal(false)}>Cancel</Button>
            <Button type="submit" disabled={savingUpi} className="bg-indigo-600 hover:bg-indigo-700">
              {savingUpi ? "Saving..." : "Save UPI Account"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
