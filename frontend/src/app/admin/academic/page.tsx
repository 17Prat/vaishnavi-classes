"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { Course, Batch } from "@/types";
import { Plus, GraduationCap, Layers, Calendar } from "lucide-react";

export default function AdminAcademicPage() {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Forms
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  const [batchClassId, setBatchClassId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("60");

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

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/academic/batches", {
        method: "POST",
        body: JSON.stringify({
          class_id: batchClassId,
          name: batchName,
          code: batchCode,
          max_capacity: parseInt(maxCapacity) || 60,
        }),
      });
      setShowBatchModal(false);
      setBatchName("");
      setBatchCode("");
      loadData();
    } catch {
      // Ignore
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Hierarchy & Structure</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Configure Courses, Classes, and Student Batches.
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
                <Button onClick={() => setShowBatchModal(true)} size="sm" className="gap-2 text-sm font-bold h-10 px-4 shadow-sm">
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
                  <CardContent className="p-5 pt-1 text-base text-slate-700 font-medium">
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
                      <span className="text-sm font-bold text-slate-600">Max: {b.max_capacity}</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-900 mt-2">{b.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-1 text-base text-slate-700 font-medium">
                    <p className="text-slate-900 font-bold">{b.class_name || "General"}</p>
                    <p className="text-slate-600 text-sm font-semibold">{b.course_name || ""}</p>
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
          <DialogDescription>Create a curriculum program (e.g. B.Tech Computer Science)</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateCourse} className="space-y-3 my-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Course Name *</label>
            <Input
              placeholder="e.g. Master of Business Administration"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Course Code *</label>
            <Input
              placeholder="e.g. MBA-EXEC"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <Input
              placeholder="Executive weekend MBA program"
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Add Batch Modal */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogHeader>
          <DialogTitle>Add Student Batch</DialogTitle>
          <DialogDescription>Group students into scheduled class sessions</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateBatch} className="space-y-3 my-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Select Class / Standard *</label>
            <select
              value={batchClassId}
              onChange={(e) => setBatchClassId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {classes.map((cl) => (
                <option key={cl.id} value={cl.id}>{cl.name} ({cl.course_name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Name *</label>
            <Input
              placeholder="e.g. Evening Batch Gamma"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Code *</label>
              <Input
                placeholder="e.g. E-GAMMA"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Capacity</label>
              <Input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowBatchModal(false)}>Cancel</Button>
            <Button type="submit">Create Batch</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
