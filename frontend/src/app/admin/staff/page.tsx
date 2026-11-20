"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { Staff } from "@/types";
import { formatDate } from "@/lib/utils";
import { UserCheck, Plus, KeyRound, Shield, Check, X } from "lucide-react";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalStaff, setResetModalStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Add staff form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("Accountant / Cashier");
  const [canCollectFees, setCanCollectFees] = useState(true);
  const [canVerifyUpi, setCanVerifyUpi] = useState(true);
  const [canSendReminders, setCanSendReminders] = useState(true);
  const [canViewReports, setCanViewReports] = useState(true);
  const [canManageStudents, setCanManageStudents] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadStaff = async () => {
    try {
      const data = await apiFetch("/staff");
      setStaffList(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/staff", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email,
          designation,
          can_collect_fees: canCollectFees,
          can_verify_upi: canVerifyUpi,
          can_send_reminders: canSendReminders,
          can_view_reports: canViewReports,
          can_manage_students: canManageStudents,
        }),
      });
      setShowAddModal(false);
      setFullName("");
      setPhone("");
      setEmail("");
      loadStaff();
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStaff || !newPassword) return;

    try {
      await apiFetch("/auth/admin-reset-password", {
        method: "POST",
        body: JSON.stringify({
          user_id: resetModalStaff.user_id,
          new_password: newPassword,
        }),
      });
      alert(`Password for ${resetModalStaff.staff_id} reset successfully!`);
      setResetModalStaff(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    }
  };

  const togglePermission = async (staffId: string, permKey: string, currentVal: boolean) => {
    try {
      await apiFetch(`/staff/${staffId}`, {
        method: "PUT",
        body: JSON.stringify({
          [permKey]: !currentVal,
        }),
      });
      loadStaff();
    } catch {
      // Ignore
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Staff & Role Permissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control granular cashier permissions for fee collection, UPI verification, and reminders.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-1.5 text-xs h-9">
            <Plus className="h-4 w-4" /> Add Staff Member
          </Button>
        </div>

        {/* Staff Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Collect Fees</th>
                    <th className="py-3 px-4">Verify UPI</th>
                    <th className="py-3 px-4">Reminders</th>
                    <th className="py-3 px-4">Reports</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {st.staff_id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{st.full_name}</p>
                        <span className="text-[10px] text-slate-500">{st.phone || st.email || ""}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {st.designation}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePermission(st.id, "can_collect_fees", st.permissions.can_collect_fees)}
                          className={`h-6 px-2 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors ${
                            st.permissions.can_collect_fees ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {st.permissions.can_collect_fees ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {st.permissions.can_collect_fees ? "Allowed" : "Denied"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePermission(st.id, "can_verify_upi", st.permissions.can_verify_upi)}
                          className={`h-6 px-2 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors ${
                            st.permissions.can_verify_upi ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {st.permissions.can_verify_upi ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {st.permissions.can_verify_upi ? "Allowed" : "Denied"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePermission(st.id, "can_send_reminders", st.permissions.can_send_reminders)}
                          className={`h-6 px-2 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors ${
                            st.permissions.can_send_reminders ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {st.permissions.can_send_reminders ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {st.permissions.can_send_reminders ? "Allowed" : "Denied"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePermission(st.id, "can_view_reports", st.permissions.can_view_reports)}
                          className={`h-6 px-2 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors ${
                            st.permissions.can_view_reports ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {st.permissions.can_view_reports ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {st.permissions.can_view_reports ? "Allowed" : "Denied"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResetModalStaff(st)}
                          className="h-7 text-[11px] gap-1"
                        >
                          <KeyRound className="h-3 w-3" /> Reset Pwd
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

      {/* Add Staff Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Generates unique Staff ID (e.g. STF0003) and sets permissions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateStaff} className="space-y-3 my-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
            <Input
              placeholder="e.g. Suresh Kulkarni"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
              <Input
                placeholder="+91 98765 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Designation</label>
              <Input
                placeholder="Senior Accountant"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-2">Granted Role Permissions:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={canCollectFees}
                  onChange={(e) => setCanCollectFees(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Can Collect Fees & Issue Receipts
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={canVerifyUpi}
                  onChange={(e) => setCanVerifyUpi(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Can Verify Student UPI Payments
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={canSendReminders}
                  onChange={(e) => setCanSendReminders(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Can Trigger WhatsApp Due Reminders
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={canViewReports}
                  onChange={(e) => setCanViewReports(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Can View Collection Reports
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Staff Account"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Reset Password Modal */}
      {resetModalStaff && (
        <Dialog open={!!resetModalStaff} onOpenChange={(op) => !op && setResetModalStaff(null)}>
          <DialogHeader>
            <DialogTitle>Reset Password — {resetModalStaff.full_name}</DialogTitle>
            <DialogDescription>Assign a new temporary password for login ID {resetModalStaff.staff_id}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-3 my-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Password (Min 6 characters)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetModalStaff(null)}>Cancel</Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
