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
  FileText
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
  const [discountAmount, setDiscountAmount] = useState("0");
  const [discountReason, setDiscountReason] = useState("");
  const [loading, setLoading] = useState(false);

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
          discount_amount: parseFloat(discountAmount) || 0,
          discount_reason: discountReason || undefined,
        }),
      });
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setGuardianName("");
      setGuardianPhone("");
      loadData();
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const viewLedger = async (studentId: string) => {
    try {
      const ledger = await apiFetch(`/students/${studentId}/ledger`);
      setActiveLedger(ledger);
      setShowLedgerModal(true);
    } catch (e: any) {
      alert("Ledger not initialized for this student");
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
              Manage student admissions, batch enrollments, and ledger balances.
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
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, student ID (e.g. STU0001), or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-64"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-black text-sm border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Student ID</th>
                    <th className="py-4 px-5">Full Name</th>
                    <th className="py-4 px-5">Batch / Course</th>
                    <th className="py-4 px-5">Guardian Contact</th>
                    <th className="py-4 px-5">Total Fee</th>
                    <th className="py-4 px-5">Total Paid</th>
                    <th className="py-4 px-5">Remaining Balance</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No students match your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-indigo-700 text-base">
                          {s.student_id}
                        </td>
                        <td className="py-4 px-5">
                          <p className="font-black text-slate-900 text-lg leading-snug">{s.full_name}</p>
                          <span className="text-sm text-slate-600 font-bold">{s.phone || "No phone"}</span>
                        </td>
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-900 text-base">{s.batch_name || "Unassigned"}</p>
                          <span className="text-sm text-slate-500 font-medium">{s.course_name || ""}</span>
                        </td>
                        <td className="py-4 px-5 text-slate-700">
                          <p className="font-bold text-slate-900 text-base">{s.guardian_name || "—"}</p>
                          <span className="text-sm font-mono font-bold text-slate-600">{s.guardian_phone || ""}</span>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 text-base">
                          {formatCurrency(s.total_fee)}
                        </td>
                        <td className="py-4 px-5 font-black text-emerald-700 text-base">
                          {formatCurrency(s.total_paid)}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`font-black text-base ${s.remaining_balance > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                            {formatCurrency(s.remaining_balance)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewLedger(s.id)}
                            className="h-9 text-xs font-bold px-3.5 rounded-xl shadow-xs"
                            title="View Fee Ledger"
                          >
                            <FileText className="h-4 w-4 mr-1" /> Ledger
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setPayModalStudent(s.id)}
                            className="h-9 text-xs font-bold px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                            title="Collect Fee"
                          >
                            <CreditCard className="h-4 w-4 mr-1" /> Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWaModalStudent(s)}
                            className="h-9 text-xs font-bold px-3 border-emerald-400 text-emerald-800 hover:bg-emerald-50 rounded-xl shadow-xs"
                            title="Send WhatsApp Reminder"
                          >
                            <BellRing className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogHeader>
          <DialogTitle>Add New Student Admission</DialogTitle>
          <DialogDescription>
            Enrolls student with auto-generated ID (e.g. STU0005) and assigns fee plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateStudent} className="space-y-3 my-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <Input
                placeholder="e.g. Devendra Singh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Student Phone</label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Guardian Name</label>
              <Input
                placeholder="e.g. Rajesh Singh"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Guardian Phone *</label>
              <Input
                placeholder="+91 98765 00000"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assign Batch</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Fee Plan</label>
              <select
                value={feePlanId}
                onChange={(e) => setFeePlanId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Fee Plan</option>
                {feePlans.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.name} (₹{fp.total_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Discount Amount (₹)</label>
              <Input
                type="number"
                placeholder="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Discount Reason</label>
              <Input
                placeholder="e.g. Sibling concession"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enrolling..." : "Enroll Student"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Ledger Modal */}
      {activeLedger && (
        <Dialog open={showLedgerModal} onOpenChange={setShowLedgerModal}>
          <DialogHeader>
            <DialogTitle>Fee Ledger — {activeLedger.student_name} ({activeLedger.login_id})</DialogTitle>
            <DialogDescription>Plan: {activeLedger.fee_plan_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Total Payable:</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(activeLedger.net_payable)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">{formatCurrency(activeLedger.total_paid)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Remaining:</span>
                <span className="font-bold text-amber-700 text-sm">{formatCurrency(activeLedger.remaining_balance)}</span>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-slate-800 mb-2">Installment Schedule:</h5>
              <div className="space-y-2">
                {activeLedger.installments.map((inst: any) => (
                  <div key={inst.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-800">{inst.title}</p>
                      <span className="text-[10px] text-slate-500">Due Date: {formatDate(inst.due_date)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(inst.due_amount)}</p>
                      <Badge
                        variant={inst.status === "paid" ? "success" : inst.status === "overdue" ? "destructive" : "warning"}
                        className="text-[9px] uppercase"
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
            <Button onClick={() => setShowLedgerModal(false)}>Close</Button>
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
