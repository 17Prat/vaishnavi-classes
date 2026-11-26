"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Student } from "@/types";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { WhatsAppModal } from "@/components/reminders/WhatsAppModal";
import { Search, CreditCard, BellRing, FileText } from "lucide-react";

export default function StaffStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [payModalStudent, setPayModalStudent] = useState<string | null>(null);
  const [waModalStudent, setWaModalStudent] = useState<Student | null>(null);

  const loadStudents = async () => {
    try {
      const data = await apiFetch("/students");
      setStudents(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = (students || []).filter((s) => {
    const q = (search || "").toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.student_id || s.login_id || "").toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  });

  return (
    <DashboardLayout allowedRoles={["staff"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Directory & Fee Search</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quickly look up student fee balances and collect installments.
          </p>
        </div>

        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student by name, ID (e.g. STU0001), or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider font-black text-sm border-b-2 border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Student ID</th>
                    <th className="py-4 px-5">Full Name</th>
                    <th className="py-4 px-5">Batch</th>
                    <th className="py-4 px-5">Total Fee</th>
                    <th className="py-4 px-5">Total Paid</th>
                    <th className="py-4 px-5">Remaining Balance</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-indigo-700 text-base">{s.student_id}</td>
                      <td className="py-4 px-5 font-black text-slate-900 text-lg leading-snug">{s.full_name}</td>
                      <td className="py-4 px-5 text-slate-800 font-bold text-base">{s.batch_name || "General"}</td>
                      <td className="py-4 px-5 font-bold text-slate-900 text-base">{formatCurrency(s.total_fee)}</td>
                      <td className="py-4 px-5 font-black text-emerald-700 text-base">{formatCurrency(s.total_paid)}</td>
                      <td className="py-4 px-5 font-black text-amber-700 text-base">{formatCurrency(s.remaining_balance)}</td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => setPayModalStudent(s.id)}
                          className="h-9 text-xs font-bold px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                        >
                          <CreditCard className="h-4 w-4 mr-1" /> Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWaModalStudent(s)}
                          className="h-9 text-xs font-bold px-3.5 text-emerald-800 border-emerald-400 hover:bg-emerald-50 rounded-xl shadow-xs"
                        >
                          <BellRing className="h-4 w-4 mr-1" /> Reminder
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

      {payModalStudent && (
        <RecordPaymentModal
          open={!!payModalStudent}
          onOpenChange={(op) => !op && setPayModalStudent(null)}
          students={students}
          preSelectedStudentId={payModalStudent}
          onSuccess={loadStudents}
        />
      )}

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
