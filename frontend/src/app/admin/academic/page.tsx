"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { Course, Batch } from "@/types";
import { Plus, GraduationCap, Layers, Calendar, Clock, Edit2, Trash2 } from "lucide-react";

export default function AdminAcademicPage() {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // Forms
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  const [batchClassId, setBatchClassId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("40");
  const [batchTiming, setBatchTiming] = useState("");
  const [batchDays, setBatchDays] = useState("Mon - Sat");
  const [batchSubject, setBatchSubject] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);

  const loadData = async () => {
    try {
      const [c, cl, b] = await Promise.all([
        apiFetch("/academic/courses"),
        apiFetch("/academic/classes"),
        apiFetch("/academic/batches"),
      ]);
      setCourses(c);
      setClasses(cl);
      setBatches(b);
      if (cl.length > 0 && !batchClassId) {
        setBatchClassId(cl[0].id);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/academic/courses", {
        method: "POST",
        body: JSON.stringify({
          name: courseName,
          code: courseCode,
          description: courseDesc,
        }),
      });
      setShowCourseModal(false);
      setCourseName("");
      setCourseCode("");
      setCourseDesc("");
      loadData();
    } catch {
      // Ignore
    }
  };

  const openCreateBatch = () => {
    setEditingBatchId(null);
    setBatchName("");
    setBatchCode("");
    setMaxCapacity("40");
    setBatchTiming("");
    setBatchDays("Mon - Sat");
    setBatchSubject("");
    setShowBatchModal(true);
  };

  const openEditBatch = (b: Batch) => {
    setEditingBatchId(b.id);
    setBatchClassId(b.class_id || (classes.length > 0 ? classes[0].id : ""));
    setBatchName(b.name);
    setBatchCode(b.code);
    setMaxCapacity(String(b.max_capacity || 40));
    setBatchTiming(b.start_time || "");
    setBatchDays(b.batch_days || "Mon - Sat");
    setBatchSubject(b.subject || "");
    setShowBatchModal(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    setBatchLoading(true);
    try {
      if (editingBatchId) {
        await apiFetch(`/academic/batches/${editingBatchId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: batchName.trim(),
            code: batchCode.trim().toUpperCase(),
            max_capacity: parseInt(maxCapacity) || 40,
            start_time: batchTiming.trim() || undefined,
            batch_days: batchDays.trim() || undefined,
            subject: batchSubject.trim() || undefined,
          }),
        });
      } else {
        await apiFetch("/academic/batches", {
          method: "POST",
          body: JSON.stringify({
            class_id: batchClassId || (classes.length > 0 ? classes[0].id : ""),
            name: batchName.trim(),
            code: batchCode.trim().toUpperCase() || batchName.trim().substring(0, 8).toUpperCase().replace(/\s+/g, "-"),
            max_capacity: parseInt(maxCapacity) || 40,
            start_time: batchTiming.trim() || undefined,
            batch_days: batchDays.trim() || undefined,
            subject: batchSubject.trim() || undefined,
          }),
        });
      }
      setShowBatchModal(false);
      loadData();
    } catch (err: any) {
      alert("Failed to save batch: " + (err.message || "Unknown error"));
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      await apiFetch(`/academic/batches/${id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert("Failed to delete batch: " + err.message);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Hierarchy &amp; Structure</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Configure Courses, Classes, and customizable Student Batches with schedules and capacity.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <TabsList className="h-11 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger value="courses" className="text-sm font-bold px-4 py-2">Courses ({courses.length})</TabsTrigger>
              <TabsTrigger value="batches" className="text-sm font-bold px-4 py-2">Batches ({batches.length})</TabsTrigger>
            </TabsList>
            <div>
              {tab === "courses" ? (
                <Button onClick={() => setShowCourseModal(true)} size="sm" className="gap-2 text-sm font-bold h-10 px-4 shadow-sm">
                  <Plus className="h-4 w-4" /> Add Course
                </Button>
              ) : (
                <Button onClick={openCreateBatch} size="sm" className="gap-2 text-sm font-bold h-10 px-4 shadow-sm bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" /> Add Batch
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Card key={c.id} className="shadow-xs hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                        {c.code}
                      </span>
                      <span className="text-sm font-bold text-slate-600">{c.duration_months} Months</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-900 mt-2">{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-1 text-sm text-slate-700 font-medium">
                    <p className="line-clamp-2">{c.description || "No description provided."}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="batches">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batches.map((b) => (
                <Card key={b.id} className="shadow-xs hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                        {b.code}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Capacity: {b.max_capacity} seats
                      </span>
                    </div>
                    <CardTitle className="text-base font-black text-slate-900 mt-2">{b.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-1 space-y-2 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{b.class_name || "General Standard"} • {b.course_name || "Vaishnavi Classes"}</span>
                    </div>
                    {b.start_time && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-purple-600" />
                        <span>{b.start_time}</span>
                      </div>
                    )}
                    {b.batch_days && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{b.batch_days}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditBatch(b)}
                        className="h-7 px-2.5 text-xs font-bold text-indigo-600 gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBatch(b.id)}
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Course Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogHeader>
          <DialogTitle>Add Academic Course</DialogTitle>
          <DialogDescription>Create a curriculum program (e.g. 10th Board SSC/CBSE)</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateCourse} className="space-y-3 my-2 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Course Name *</label>
            <Input
              placeholder="e.g. 10th Board Exam Coaching (SSC/CBSE)"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Course Code *</label>
            <Input
              placeholder="e.g. 10-BOARD"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              required
              className="h-10 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <Input
              placeholder="Comprehensive board preparation with test series"
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Course</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Add / Edit Batch Modal */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogHeader>
          <DialogTitle>{editingBatchId ? "Edit Student Batch" : "Add Student Batch"}</DialogTitle>
          <DialogDescription>Configure batch timings, days, capacity, and academic subject</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveBatch} className="space-y-3.5 my-2 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Class / Standard *</label>
            <select
              value={batchClassId}
              onChange={(e) => setBatchClassId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              required
            >
              {classes.map((cl) => (
                <option key={cl.id} value={cl.id}>{cl.name} ({cl.course_name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Batch Name *</label>
            <Input
              placeholder="e.g. Morning Batch Alpha"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              required
              className="h-10 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Code *</label>
              <Input
                placeholder="e.g. M-ALPHA"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                required
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Maximum Capacity</label>
              <Input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Schedule / Timing</label>
              <Input
                placeholder="e.g. 08:00 AM - 10:00 AM"
                value={batchTiming}
                onChange={(e) => setBatchTiming(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Days of Week</label>
              <Input
                placeholder="e.g. Mon, Wed, Fri"
                value={batchDays}
                onChange={(e) => setBatchDays(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setShowBatchModal(false)}>Cancel</Button>
            <Button type="submit" disabled={batchLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {batchLoading ? "Saving..." : editingBatchId ? "Update Batch" : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
