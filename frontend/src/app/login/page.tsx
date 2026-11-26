"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  GraduationCap,
  Building2,
  UserPlus,
  KeyRound,
  Phone,
  Mail,
  User,
  BookOpen,
  CheckCircle2,
  X,
  MessageSquare
} from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<"student" | "staff">("student");
  const [regCourse, setRegCourse] = useState("Class 11 Science (PCM)");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSuccess, setRegSuccess] = useState<any>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const { login, registerUser, forgotPassword } = useAuth();
  const router = useRouter();

  // Handle Login
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

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (regPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const u = await registerUser({
        full_name: regFullName,
        phone: regPhone,
        email: regEmail || undefined,
        role: regRole,
        password: regPassword,
        course_interest: regCourse,
      });

      setRegSuccess({
        loginId: u.login_id,
        name: u.full_name,
        role: u.role,
      });

      setTimeout(() => {
        router.push(`/${u.role}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Check / Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (forgotStep === 1) {
      if (!forgotInput.trim()) {
        setForgotError("Please enter your Login ID or Mobile Number.");
        return;
      }
      setForgotLoading(true);
      try {
        const res = await forgotPassword(forgotInput.trim());
        setForgotStep(2);
      } catch (err: any) {
        setForgotError(err.message || "Account not found with provided ID or mobile number.");
      } finally {
        setForgotLoading(false);
      }
    } else {
      if (!newPassword || newPassword.length < 6) {
        setForgotError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setForgotError("Passwords do not match.");
        return;
      }
      setForgotLoading(true);
      try {
        const res = await forgotPassword(forgotInput.trim(), newPassword);
        setForgotSuccess(res.message || "Password has been reset successfully! You can now log in.");
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotInput("");
          setNewPassword("");
          setConfirmNewPassword("");
          setForgotSuccess("");
          if (res.login_id) setLoginId(res.login_id);
        }, 2200);
      } catch (err: any) {
        setForgotError(err.message || "Failed to update password.");
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const setDemoCredentials = (id: string, pwd: string) => {
    setLoginId(id);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Vaishnavi Classes"
            className="h-24 w-24 rounded-2xl shadow-xl mx-auto mb-3 object-cover border-2 border-white ring-4 ring-indigo-100"
          />
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Vaishnavi Classes
          </h2>
          <p className="text-sm text-indigo-700 font-extrabold mt-1">
            Since 1996 • Official Fee Management Portal
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl mb-6 text-base font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "login"
                ? "bg-white text-indigo-700 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-5 w-5" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "register"
                ? "bg-white text-indigo-700 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="h-5 w-5" /> Create Account
          </button>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-slate-200/90 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 bg-white">
            <CardTitle className="text-2xl font-black text-slate-900">
              {activeTab === "login" ? "Account Sign In" : "New Account Registration"}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 font-medium mt-1">
              {activeTab === "login"
                ? "Enter your assigned User ID (e.g. ADM0001, STF0001, STU0001) or mobile"
                : "Register for Vaishnavi Classes portal to access fee ledger and notices"}
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-white px-6 pb-6">
            {error && (
              <div className="p-4 mb-5 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-base font-bold">
                {error}
              </div>
            )}

            {regSuccess && (
              <div className="p-4 mb-5 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-xl text-base font-medium flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-lg">Account created successfully!</p>
                  <p className="mt-1 text-base">
                    Your assigned ID is <span className="font-mono font-black text-indigo-700">{regSuccess.loginId}</span>. Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-base font-black text-slate-800 block mb-2">
                    User ID / Login ID
                  </label>
                  <Input
                    placeholder="e.g. ADM0001, STF0001, STU0001"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    required
                    className="font-mono uppercase text-base sm:text-lg h-13"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-base font-black text-slate-800 block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotInput(loginId);
                        setForgotStep(1);
                        setForgotError("");
                        setForgotSuccess("");
                      }}
                      className="text-sm font-black text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-13 text-base sm:text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-base sm:text-lg font-black shadow-lg shadow-indigo-200 gap-2.5 mt-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  {loading ? "Signing In..." : "Sign In to Portal"} <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            ) : (
              /* TAB 2: CREATE ACCOUNT FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Switcher */}
                <div>
                  <label className="text-sm font-black text-slate-800 block mb-2">
                    Register As
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => setRegRole("student")}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        regRole === "student"
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 font-black"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" /> Student / Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole("staff")}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        regRole === "staff"
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 font-black"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Building2 className="h-5 w-5" /> Staff / Faculty
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black text-slate-800 block mb-1.5">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Pratham Patel"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    className="h-12 text-base font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-slate-800 block mb-1.5">
                    WhatsApp Mobile Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. 9664257346"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="h-12 text-base font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-slate-800 block mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="h-12 text-base font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-slate-800 block mb-1.5">
                    Target Course / Batch
                  </label>
                  <select
                    value={regCourse}
                    onChange={(e) => setRegCourse(e.target.value)}
                    className="w-full text-base font-medium border-2 border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 11 Science (PCM)">Class 11 Science (PCM)</option>
                    <option value="Class 12 Science (PCM)">Class 12 Science (PCM)</option>
                    <option value="Class 10 CBSE Board">Class 10 CBSE Board</option>
                    <option value="JEE / NEET Foundation">JEE / NEET Foundation</option>
                    <option value="Commerce & Accounts">Commerce & Accounts</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-black text-slate-800 block mb-1.5">
                      Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-800 block mb-1.5">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-enter"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 text-base font-black shadow-md shadow-indigo-200 gap-2 mt-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  {loading ? "Creating Account..." : "Create Account & Sign In"} <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            )}

            {/* Quick Demo Credentials Switcher for Instant Testing */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                Instant 1-Click Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setDemoCredentials("ADM0001", "admin123");
                  }}
                  className="p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
                    <Building2 className="h-4 w-4" /> Admin Account
                  </div>
                  <div className="text-xs text-slate-700 font-mono font-bold mt-1">ADM0001 • admin123</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setDemoCredentials("STU0001", "student123");
                  }}
                  className="p-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                    <GraduationCap className="h-4 w-4" /> Student Account
                  </div>
                  <div className="text-xs text-slate-700 font-mono font-bold mt-1">STU0001 • student123</div>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 py-3.5 bg-slate-50/50">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> End-to-End Encrypted Session • Vaishnavi Classes
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Reset Account Password</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {forgotStep === 1
                    ? "Enter your User ID or Registered Mobile Number"
                    : "Set your new account password"}
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3.5 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3.5 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 1 ? (
                <div>
                  <label className="text-sm font-black text-slate-800 block mb-1.5">
                    Login ID or WhatsApp Mobile *
                  </label>
                  <Input
                    placeholder="e.g. ADM0001, STU0001, or 9664257346"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the ID or phone number associated with your account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      New Password (Min 6 chars) *
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Confirm New Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {forgotLoading
                    ? "Verifying..."
                    : forgotStep === 1
                    ? "Verify Account"
                    : "Update Password"}
                </Button>
              </div>
            </form>

            {/* WhatsApp Quick Help Option */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 mb-2">Need direct assistance from institute office?</p>
              <a
                href={`https://wa.me/919664257346?text=${encodeURIComponent(
                  `Hello Vaishnavi Classes, I need assistance resetting my password. My User ID or Mobile is: ${forgotInput || "Not specified"}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Office Desk (+91 9664257346)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
