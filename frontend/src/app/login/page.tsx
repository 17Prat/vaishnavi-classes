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
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-24 w-24 rounded-2xl shadow-xl mx-auto mb-3 object-cover border-2 border-white ring-4 ring-indigo-100"
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Vaishnavi Classes
          </h2>
          <p className="text-xs text-indigo-700 font-semibold mt-1">
            Since 1996 • Official Fee Management Portal
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
                Master Admin Login
              </p>
              <button
                type="button"
                onClick={() => setDemoCredentials("ADM0001", "admin123")}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <Building2 className="h-4 w-4" /> Admin Account (Vaishnavi Classes)
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">ADM0001</span>
                  <span className="text-[10px] text-slate-500 block">Password: admin123</span>
                </div>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Log in as Admin to add your courses, staff members, and students.
              </p>
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
