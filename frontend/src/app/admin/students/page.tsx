"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Student, Course, Batch, FeePlan } from "@/types";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { WhatsAppModal } from "@/components/reminders/WhatsAppModal";
import {
  UserPlus,
  Search,
  Download,
  CreditCard,
  BellRing,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Tag,
  Calculator,
  Percent,
  CheckCircle2,
  Clock,
  Layers
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [activeLedger, setActiveLedger] = useState<any>(null);

  const [payModalStudent, setPayModalStudent] = useState<string | null>(null);
  const [waModalStudent, setWaModalStudent] = useState<Student | null>(null);

  // New Student Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [batchId, setBatchId] = useState("");
  const [feePlanId, setFeePlanId] = useState("");
  
  // Real-time Discount Calculator State
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("Early Admission");
  const [customReason, setCustomReason] = useState("");
  const [customOriginalFee, setCustomOriginalFee] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick Create Batch Modal State
  const [showQuickBatchModal, setShowQuickBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchCode, setNewBatchCode] = useState("");
  const [newBatchTiming, setNewBatchTiming] = useState("");
  const [newBatchDays, setNewBatchDays] = useState("Mon - Sat");
  const [newBatchCapacity, setNewBatchCapacity] = useState("40");
  const [newBatchSubject, setNewBatchSubject] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Ledger Discount Edit State
  const [editingLedgerDiscount, setEditingLedgerDiscount] = useState(false);
  const [ledgerDiscType, setLedgerDiscType] = useState<"none" | "percentage" | "fixed">("none");
  const [ledgerDiscVal, setLedgerDiscVal] = useState("");
  const [ledgerDiscReason, setLedgerDiscReason] = useState("Special Discount");
  const [savingLedgerDiscount, setSavingLedgerDiscount] = useState(false);

  const loadData = async () => {
    try {
      const [s, b, c, fp] = await Promise.all([
        apiFetch("/students"),
        apiFetch("/academic/batches"),
        apiFetch("/academic/courses"),
        apiFetch("/fees/plans"),
      ]);
      setStudents(s);
      setBatches(b);
      setCourses(c);
      setFeePlans(fp);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live calculations
  const selectedPlan = feePlans.find((fp) => fp.id === feePlanId);
  const baseOriginalAmount = selectedPlan
    ? selectedPlan.total_amount
    : parseFloat(customOriginalFee) || 0;

  const numDiscountVal = parseFloat(discountValue) || 0;
  let computedDiscountAmount = 0;
  if (discountType === "percentage") {
    computedDiscountAmount = Math.round((baseOriginalAmount * numDiscountVal) / 100);
  } else if (discountType === "fixed") {
    computedDiscountAmount = Math.min(numDiscountVal, baseOriginalAmount);
  }

  const finalPayable = Math.max(baseOriginalAmount - computedDiscountAmount, 0);
  const effectiveDiscountReason = discountReason === "Other" ? (customReason || "Special Concession") : discountReason;

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          batch_id: batchId || undefined,
          fee_plan_id: feePlanId || undefined,
          original_fee_amount: baseOriginalAmount > 0 ? baseOriginalAmount : undefined,
          discount_type: discountType,
          discount_value: numDiscountVal,
          discount_amount: computedDiscountAmount,
          discount_reason: computedDiscountAmount > 0 ? effectiveDiscountReason : undefined,
        }),
      });
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setGuardianName("");
      setGuardianPhone("");
      setBatchId("");
      setFeePlanId("");
      setDiscountType("none");
      setDiscountValue("");
      setDiscountReason("Early Admission");
      setCustomReason("");
      setCustomOriginalFee("");
      loadData();
    } catch (err: any) {
      alert("Failed to enroll student: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    setCreatingBatch(true);
    try {
      const targetClass = courses.length > 0 ? courses[0].id : "";
      const created = await apiFetch("/academic/batches", {
        method: "POST",
        body: JSON.stringify({
          class_id: targetClass,
          name: newBatchName.trim(),
          code: newBatchCode.trim() || newBatchName.trim().substring(0, 8).toUpperCase().replace(/\s+/g, "-"),
          max_capacity: parseInt(newBatchCapacity) || 40,
          start_time: newBatchTiming.trim() || undefined,
          batch_days: newBatchDays.trim() || undefined,
          subject: newBatchSubject.trim() || undefined,
        }),
      });
      const updatedBatches = await apiFetch("/academic/batches");
      setBatches(updatedBatches);
      setBatchId(created.id);
      setShowQuickBatchModal(false);
      setNewBatchName("");
      setNewBatchCode("");
      setNewBatchTiming("");
      setNewBatchSubject("");
    } catch (err: any) {
      alert("Failed to create batch: " + (err.message || "Unknown error"));
    } finally {
      setCreatingBatch(false);
    }
  };

  const viewLedger = async (studentId: string) => {
    try {
      const ledger = await apiFetch(`/students/${studentId}/ledger`);
      setActiveLedger(ledger);
      setShowLedgerModal(true);
      setEditingLedgerDiscount(false);
    } catch {
      alert("Ledger not initialized for this student");
    }
  };

  const handleUpdateLedgerDiscount = async () => {
    if (!activeLedger) return;
    setSavingLedgerDiscount(true);
    try {
      await apiFetch(`/fees/assignments/${activeLedger.assignment_id}/discount`, {
        method: "PUT",
        body: JSON.stringify({
          discount_type: ledgerDiscType,
          discount_value: parseFloat(ledgerDiscVal) || 0,
          discount_reason: ledgerDiscReason,
        }),
      });
      const refreshed = await apiFetch(`/students/${activeLedger.student_id}/ledger`);
      setActiveLedger(refreshed);
      setEditingLedgerDiscount(false);
      loadData();
    } catch (err: any) {
      alert("Failed to update discount: " + (err.message || "Unknown error"));
    } finally {
      setSavingLedgerDiscount(false);
    }
  };

  const filteredStudents = (students || []).filter((s) => {
    const q = (search || "").toLowerCase();
    const matchSearch =
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.student_id || s.login_id || "").toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q));
    const matchBatch = !selectedBatch || s.batch_id === selectedBatch;
    return matchSearch && matchBatch;
  });

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory & Fee Status</h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Manage student admissions, customized batch enrollments, and ledger discounts.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`${API_BASE_URL}/students/export/csv`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </a>
            <Button onClick={() => setShowAddModal(true)} className="gap-2 text-sm font-bold h-11 px-5 shadow-sm">
              <UserPlus className="h-5 w-5" /> Add Student
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by student name, ID (STU0001), or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="">All Batches ({batches.length})</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="shadow-xs border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Batch / Course</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4 text-right">Net Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{s.student_id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.full_name}</div>
                        <div className="text-[11px] text-slate-500">{s.phone || "No phone"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.batch_name || "Unassigned"}</div>
                        <div className="text-[11px] text-slate-500">{s.course_name || "General"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900">{s.guardian_name || "N/A"}</div>
                        <div className="text-[11px] text-slate-500">{s.guardian_phone || "-"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(s.total_fee)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatCurrency(s.total_paid)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-bold ${s.remaining_balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                          {formatCurrency(s.remaining_balance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewLedger(s.id)}
                            className="h-8 px-2.5 text-xs font-semibold gap-1"
                          >
                            <FileText className="h-3.5 w-3.5" /> Ledger
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setPayModalStudent(s.id)}
                            className="h-8 px-2.5 text-xs font-semibold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Collect
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWaModalStudent(s)}
                            className="h-8 px-2.5 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            <BellRing className="h-3.5 w-3.5" /> WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Student Modal with Real-time Discount Calculator & Quick Batch Creator */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" /> New Student Enrollment &amp; Fee Setup
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fill student details, assign batch (or create one), and configure fee plans with live discount calculation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateStudent} className="space-y-4 my-2 text-xs">
          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Student Full Name *</label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Student Mobile Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Guardian / Parent Name</label>
              <Input
                placeholder="e.g. Suresh Sharma"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Guardian Phone (WhatsApp Reminders) *</label>
              <Input
                placeholder="+91 98765 43210"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Batch & Fee Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Assign Student Batch</label>
                <button
                  type="button"
                  onClick={() => setShowQuickBatchModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="h-3 w-3" /> + Create New Batch
                </button>
              </div>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Batch (or click + Create New Batch)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.start_time ? `(${b.start_time})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Fee Plan</label>
              <select
                value={feePlanId}
                onChange={(e) => setFeePlanId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Fee Plan (or enter custom fees below)</option>
                {feePlans.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.name} (₹{fp.total_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Fee Discount Box */}
          <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-slate-50 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-indigo-600" /> Fee Discount &amp; Concession Calculator
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Automatic Real-Time Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {!selectedPlan && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Original Fee Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 15000"
                    value={customOriginalFee}
                    onChange={(e) => setCustomOriginalFee(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Amount Discount (₹)</option>
                </select>
              </div>

              {discountType !== "none" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {discountType === "percentage" ? "Discount Rate (%)" : "Discount Amount (₹)"}
                  </label>
                  <Input
                    type="number"
                    placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 1500"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>
              )}

              {discountType !== "none" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Reason</label>
                  <select
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Early Admission">Early Admission</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Merit Discount">Merit Discount</option>
                    <option value="Sibling Discount">Sibling Discount</option>
                    <option value="Special Discount">Special Discount</option>
                    <option value="Financial Assistance">Financial Assistance</option>
                    <option value="Referral Discount">Referral Discount</option>
                    <option value="Other">Other (Custom Reason)</option>
                  </select>
                </div>
              )}
            </div>

            {discountType !== "none" && discountReason === "Other" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Custom Concession Note</label>
                <Input
                  placeholder="Specify custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="h-9 text-xs bg-white"
                />
              </div>
            )}

            {/* Real-time Calculation Summary Card */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-indigo-100 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Original Fee</span>
                <span className="text-xs font-bold text-slate-800">{formatCurrency(baseOriginalAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-wider">
                  Discount {discountType === "percentage" && numDiscountVal > 0 ? `(${numDiscountVal}%)` : ""}
                </span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {computedDiscountAmount > 0 ? `- ${formatCurrency(computedDiscountAmount)}` : "₹0"}
                </span>
              </div>
              <div className="bg-indigo-50/60 rounded py-0.5">
                <span className="text-[10px] text-indigo-700 block uppercase font-extrabold tracking-wider">Final Payable</span>
                <span className="text-sm font-black text-indigo-900">{formatCurrency(finalPayable)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Enrolling Student..." : "Enroll Student with Fee Plan"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Quick Create Batch Modal */}
      <Dialog open={showQuickBatchModal} onOpenChange={setShowQuickBatchModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" /> Quick Create New Batch
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create an academic batch instantly. It will automatically be selected in your student form without losing any entered data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleQuickCreateBatch} className="space-y-3 my-2 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Batch Name *</label>
            <Input
              placeholder="e.g. 10th Board Morning Alpha"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Batch Code</label>
              <Input
                placeholder="e.g. 10-ALPHA"
                value={newBatchCode}
                onChange={(e) => setNewBatchCode(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Max Capacity (Seats)</label>
              <Input
                type="number"
                placeholder="40"
                value={newBatchCapacity}
                onChange={(e) => setNewBatchCapacity(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Batch Timing / Schedule</label>
              <Input
                placeholder="e.g. 08:00 AM - 10:00 AM"
                value={newBatchTiming}
                onChange={(e) => setNewBatchTiming(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Days of Week</label>
              <Input
                placeholder="e.g. Mon, Wed, Fri"
                value={newBatchDays}
                onChange={(e) => setNewBatchDays(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setShowQuickBatchModal(false)}>Cancel</Button>
            <Button type="submit" disabled={creatingBatch} className="bg-indigo-600 hover:bg-indigo-700">
              {creatingBatch ? "Creating..." : "Save & Assign to Student"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Ledger Modal with Discount Breakdown and Discount Modification */}
      {activeLedger && (
        <Dialog open={showLedgerModal} onOpenChange={setShowLedgerModal}>
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              Fee Ledger — {activeLedger.student_name} ({activeLedger.login_id})
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fee Plan: {activeLedger.fee_plan_name} • Status: <span className="uppercase font-bold text-indigo-700">{activeLedger.status}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Original Fees</span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatCurrency(activeLedger.original_fee_amount || activeLedger.base_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 block uppercase font-bold">Discount Concession</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {activeLedger.discount_amount > 0 ? `- ${formatCurrency(activeLedger.discount_amount)}` : "₹0"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-700 block uppercase font-bold">Net Final Payable</span>
                <span className="font-black text-indigo-900 text-sm">{formatCurrency(activeLedger.net_payable)}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 block uppercase font-bold">Remaining Balance</span>
                <span className="font-black text-amber-700 text-sm">{formatCurrency(activeLedger.remaining_balance)}</span>
              </div>
            </div>

            {/* Discount details & Edit Button */}
            <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <div>
                <span className="font-bold text-slate-800">Applied Concession: </span>
                {activeLedger.discount_amount > 0 ? (
                  <span className="text-emerald-700 font-semibold">
                    {formatCurrency(activeLedger.discount_amount)} ({activeLedger.discount_reason || "Concession"})
                  </span>
                ) : (
                  <span className="text-slate-500">None</span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingLedgerDiscount(!editingLedgerDiscount);
                  setLedgerDiscType((activeLedger.discount_type as any) || "percentage");
                  setLedgerDiscVal(activeLedger.discount_value ? String(activeLedger.discount_value) : "");
                }}
                className="h-7 px-2.5 text-xs font-bold text-indigo-600 border-indigo-200"
              >
                {editingLedgerDiscount ? "Cancel Edit" : "Edit Discount"}
              </Button>
            </div>

            {/* Edit Discount Subform */}
            {editingLedgerDiscount && (
              <div className="p-3 bg-white border border-indigo-200 rounded-lg space-y-2.5">
                <h6 className="font-bold text-slate-800 text-xs">Modify Student Concession / Discount</h6>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Discount Type</label>
                    <select
                      value={ledgerDiscType}
                      onChange={(e) => setLedgerDiscType(e.target.value as any)}
                      className="w-full h-8 text-xs rounded border border-slate-300 px-2"
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Value</label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={ledgerDiscVal}
                      onChange={(e) => setLedgerDiscVal(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Reason</label>
                    <Input
                      placeholder="e.g. Merit discount"
                      value={ledgerDiscReason}
                      onChange={(e) => setLedgerDiscReason(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleUpdateLedgerDiscount}
                    disabled={savingLedgerDiscount}
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                  >
                    {savingLedgerDiscount ? "Saving..." : "Apply & Recalculate Installments"}
                  </Button>
                </div>
              </div>
            )}

            {/* Installments Schedule */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2">Installment Schedule:</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeLedger.installments.map((inst: any) => (
                  <div key={inst.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-800">{inst.title}</p>
                      <span className="text-[11px] text-slate-500">Due: {formatDate(inst.due_date)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(inst.due_amount)}</p>
                      <Badge
                        variant={inst.status === "paid" ? "success" : inst.status === "overdue" ? "destructive" : "warning"}
                        className="text-[9px] uppercase font-bold"
                      >
                        {inst.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLedgerModal(false)}>Close Ledger</Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Record Payment Modal */}
      {payModalStudent && (
        <RecordPaymentModal
          open={!!payModalStudent}
          onOpenChange={(op) => !op && setPayModalStudent(null)}
          students={students}
          preSelectedStudentId={payModalStudent}
          onSuccess={loadData}
        />
      )}

      {/* WhatsApp Modal */}
      {waModalStudent && (
        <WhatsAppModal
          open={!!waModalStudent}
          onOpenChange={(op) => !op && setWaModalStudent(null)}
          studentId={waModalStudent.id}
          studentName={waModalStudent.full_name}
          phone={waModalStudent.guardian_phone || waModalStudent.phone || ""}
        />
      )}
    </DashboardLayout>
  );
}
