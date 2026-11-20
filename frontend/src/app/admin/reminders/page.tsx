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
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Fee Reminders Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click-to-chat automated reminders: opens WhatsApp directly with pre-composed professional templates.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800">
              Students with Due & Overdue Installments ({dueStudents.length})
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
                    <th className="py-3 px-4">Pending Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Send Reminder</th>
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
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.student_name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{item.student_login_id}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {item.phone || "No phone"}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {item.installment_title}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(item.due_date)}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700 text-sm">
                          {formatCurrency(item.pending_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={item.status === "overdue" ? "destructive" : "warning"}
                            className="capitalize text-[10px]"
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedStudent(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1.5 shadow-xs"
                          >
                            <Send className="h-3 w-3" /> WhatsApp
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
