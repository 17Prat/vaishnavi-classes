"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ShieldCheck, ArrowRight, UserCheck, GraduationCap, Building2 } from "lucide-react";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const u = await login(loginId, password);
      router.push(`/${u.role}`);
    } catch (err: any) {
      setError(err.message || "Invalid Login ID or Password");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (id: string, pwd: string) => {
    setLoginId(id);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            FeeFlow Management System
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your institutional fee portal
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border-slate-200/90 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Account Login</CardTitle>
            <CardDescription className="text-xs">
              Enter your assigned User ID (e.g. ADM0001, STF0001, STU0001)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  User ID / Login ID
                </label>
                <Input
                  placeholder="e.g. ADM0001, STF0001, STU0001"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                  required
                  className="font-mono uppercase text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold shadow-md shadow-indigo-200 gap-2 mt-2"
              >
                {loading ? "Signing In..." : "Sign In to Portal"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Credentials Switcher */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                Instant One-Click Demo Logins
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials("ADM0001", "admin123")}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                    <Building2 className="h-3.5 w-3.5" /> Admin
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">ADM0001</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials("STF0001", "staff123")}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <UserCheck className="h-3.5 w-3.5" /> Staff
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">STF0001</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials("STU0001", "student123")}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                    <GraduationCap className="h-3.5 w-3.5" /> Student
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">STU0001</p>
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-100 py-3 bg-slate-50/50 rounded-b-2xl">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> End-to-End Encrypted Session
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
