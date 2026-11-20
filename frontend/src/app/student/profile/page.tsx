"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { User, KeyRound, CheckCircle2 } from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPwd,
          new_password: newPwd,
        }),
      });
      setSuccess(true);
      setCurrentPwd("");
      setNewPwd("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Profile & Security</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your credentials and view institutional registration details.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" /> Student Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Student Login ID:</span>
              <span className="font-mono font-bold text-indigo-700">{user?.login_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-semibold text-slate-800">{user?.full_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-800">{user?.email || "Not specified"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Institution:</span>
              <span className="font-semibold text-slate-800">{user?.institute_name}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-purple-600" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {success && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Password changed successfully!
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password *</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password (Min 6 chars) *</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="gap-2 text-xs">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
