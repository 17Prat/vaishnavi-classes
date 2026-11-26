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
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black text-slate-900">
              Students with Due & Overdue Installments ({dueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black text-sm tracking-wider border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Student</th>
                    <th className="py-4 px-5">Contact Phone</th>
                    <th className="py-4 px-5">Installment</th>
                    <th className="py-4 px-5">Due Date</th>
                    <th className="py-4 px-5">Pending Due</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Send Reminder</th>
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
                        <td className="py-4 px-5">
                          <p className="font-black text-slate-900 text-lg leading-snug">{item.student_name}</p>
                          <span className="text-sm text-slate-600 font-mono font-bold">{item.student_login_id}</span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 text-base">
                          {item.phone || "No phone"}
                        </td>
                        <td className="py-4 px-5 text-slate-900 font-bold text-base">
                          {item.installment_title}
                        </td>
                        <td className="py-4 px-5 text-slate-800 font-semibold text-base">
                          {formatDate(item.due_date)}
                        </td>
                        <td className="py-4 px-5 font-black text-indigo-700 text-xl">
                          {formatCurrency(item.pending_amount)}
                        </td>
                        <td className="py-4 px-5">
                          <Badge
                            variant={item.status === "overdue" ? "destructive" : "warning"}
                            className="capitalize text-xs font-black px-3 py-1.5 uppercase tracking-wide"
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedStudent(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 gap-1.5 shadow-xs rounded-xl"
                          >
                            <Send className="h-4 w-4" /> WhatsApp
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
