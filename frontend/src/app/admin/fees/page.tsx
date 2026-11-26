"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { FeePlan, Course } from "@/types";
import { Plus, Wallet, Layers } from "lucide-react";

export default function AdminFeesPage() {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [admissionFee, setAdmissionFee] = useState("5000");
  const [tuitionFee, setTuitionFee] = useState("35000");
  const [examFee, setExamFee] = useState("3000");
  const [libraryFee, setLibraryFee] = useState("2000");
  const [transportFee, setTransportFee] = useState("0");
  const [frequency, setFrequency] = useState("quarterly");
  const [numInstallments, setNumInstallments] = useState("4");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [fp, c] = await Promise.all([
        apiFetch("/fees/plans"),
        apiFetch("/academic/courses"),
      ]);
      setFeePlans(fp);
      setCourses(c);
      if (c.length > 0 && !courseId) {
        setCourseId(c[0].id);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/fees/plans", {
        method: "POST",
        body: JSON.stringify({
          name,
          course_id: courseId || undefined,
          admission_fee: parseFloat(admissionFee) || 0,
          tuition_fee: parseFloat(tuitionFee) || 0,
          examination_fee: parseFloat(examFee) || 0,
          library_fee: parseFloat(libraryFee) || 0,
          transport_fee: parseFloat(transportFee) || 0,
          installment_frequency: frequency,
          number_of_installments: parseInt(numInstallments) || 1,
        }),
      });
      setShowModal(false);
      setName("");
      loadData();
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Fee Structures</h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Standardize tuition, admission, examination, and installment frequency plans.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 text-sm font-bold h-11 px-5 shadow-sm">
            <Plus className="h-5 w-5" /> Create Fee Plan
          </Button>
        </div>

        {/* Fee Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feePlans.map((fp) => (
            <Card key={fp.id} className="shadow-xs hover:shadow-md transition-shadow border-slate-200">
              <CardHeader className="p-5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {fp.installment_frequency} ({fp.number_of_installments} Installments)
                  </span>
                  <Badge variant={fp.is_active ? "success" : "secondary"} className="text-xs font-bold px-2 py-0.5">
                    {fp.is_active ? "Active" : "Archived"}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 mt-2">{fp.name}</CardTitle>
                <p className="text-xs text-slate-500 font-medium">{fp.course_name || "All Courses"}</p>
              </CardHeader>

              <CardContent className="p-6 text-base space-y-3">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Admission Fee:</span>
                  <span className="font-black text-slate-900 text-base">{formatCurrency(fp.admission_fee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Tuition Fee:</span>
                  <span className="font-black text-slate-900 text-base">{formatCurrency(fp.tuition_fee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Examination &amp; Library:</span>
                  <span className="font-black text-slate-900 text-base">
                    {formatCurrency((Number(fp.examination_fee) || 0) + (Number(fp.library_fee) || 0))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Transport Fee:</span>
                  <span className="font-black text-slate-900 text-base">{formatCurrency(fp.transport_fee)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-black text-slate-900 text-lg">Total Fee Package:</span>
                  <span className="font-black text-indigo-700 text-xl">{formatCurrency(fp.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Plan Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogHeader>
          <DialogTitle>Create Fee Plan Structure</DialogTitle>
          <DialogDescription>Configure fee heads and installment counts.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePlan} className="space-y-3 my-2 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Plan Name *</label>
            <Input
              placeholder="e.g. Diploma Year 1 Comprehensive Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Applicable Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Applicable to All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Admission Fee (₹)</label>
              <Input
                type="number"
                value={admissionFee}
                onChange={(e) => setAdmissionFee(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tuition Fee (₹)</label>
              <Input
                type="number"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Exam Fee</label>
              <Input
                type="number"
                value={examFee}
                onChange={(e) => setExamFee(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Library Fee</label>
              <Input
                type="number"
                value={libraryFee}
                onChange={(e) => setLibraryFee(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Transport Fee</label>
              <Input
                type="number"
                value={transportFee}
                onChange={(e) => setTransportFee(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="full">Full / One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Number of Installments</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={numInstallments}
                onChange={(e) => setNumInstallments(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Fee Plan"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
