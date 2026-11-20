"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WhatsAppModal } from "@/components/reminders/WhatsAppModal";
import { BellRing, Send } from "lucide-react";

export default function StaffRemindersPage() {
  const [dueStudents, setDueStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const loadDue = async () => {
      try {
        const data = await apiFetch("/reminders/due-students");
        setDueStudents(data);
      } catch {
        // Ignore
      }
    };
    loadDue();
  }, []);

  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Fee Reminders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click to open WhatsApp Web or App with pre-filled reminder template.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">
              Students Requiring Fee Follow-Up ({dueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Installment</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Pending Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Send</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueStudents.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{d.student_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{d.phone || "No phone"}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{d.installment_title}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(d.due_date)}</td>
                      <td className="py-3 px-4 font-bold text-indigo-700 text-sm">{formatCurrency(d.pending_amount)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={d.status === "overdue" ? "destructive" : "warning"} className="capitalize text-[10px]">
                          {d.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(d)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1.5 shadow-xs"
                        >
                          <Send className="h-3 w-3" /> WhatsApp
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedStudent && (
        <WhatsAppModal
          open={!!selectedStudent}
          onOpenChange={(op) => !op && setSelectedStudent(null)}
          studentId={selectedStudent.student_id}
          studentName={selectedStudent.student_name}
          phone={selectedStudent.phone}
          initialTemplate={selectedStudent.suggested_template}
          installmentId={selectedStudent.installment_id}
        />
      )}
    </DashboardLayout>
  );
}
