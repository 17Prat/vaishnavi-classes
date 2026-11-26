"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WhatsAppModal } from "@/components/reminders/WhatsAppModal";
import { BellRing, Send, AlertTriangle, Clock } from "lucide-react";

export default function AdminRemindersPage() {
  const [dueStudents, setDueStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDue = async () => {
    try {
      const data = await apiFetch("/reminders/due-students");
      setDueStudents(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDue();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">WhatsApp Fee Reminders Desk</h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Click-to-chat automated reminders: opens WhatsApp directly with pre-composed professional templates.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">
              Students with Due & Overdue Installments ({dueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/90 text-slate-700 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Installment</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Pending Due</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Send Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        All student fees are fully cleared! No pending reminders.
                      </td>
                    </tr>
                  ) : (
                    dueStudents.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-base">{item.student_name}</p>
                          <span className="text-xs text-slate-600 font-mono font-medium">{item.student_login_id}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-sm">
                          {item.phone || "No phone"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-bold text-sm">
                          {item.installment_title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium text-sm">
                          {formatDate(item.due_date)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-indigo-700 text-base">
                          {formatCurrency(item.pending_amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={item.status === "overdue" ? "destructive" : "warning"}
                            className="capitalize text-xs font-bold px-2.5 py-1"
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedStudent(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3.5 gap-1.5 shadow-xs rounded-lg"
                          >
                            <Send className="h-3.5 w-3.5" /> WhatsApp
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
