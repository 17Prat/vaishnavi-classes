"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  BUSINESS_WHATSAPP_NUMBER,
  getDirectChatWhatsAppUrl,
  openWhatsAppChat,
  formatEnquiryWhatsAppMessage,
} from "@/config/whatsapp";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  PhoneCall,
  Mail,
  Clock,
  ArrowRight,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  LogIn,
  Check,
  Phone,
  Building2,
  MapPin,
  X
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  // Enquiry Form State
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    serviceType: "10th Board Coaching (SSC/CBSE)",
    message: "I would like to enquire regarding admissions, batch timings, and fee structure.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [highlightForm, setHighlightForm] = useState(false);

  const courses = [
    {
      title: "Class 8th to 10th (Secondary)",
      board: "SSC / CBSE / ICSE",
      desc: "Complete conceptual mastery in Mathematics, Science, and English with rigorous regular chapter tests and board mock drills.",
      badge: "High Board Rankers",
      color: "border-blue-500/20 bg-blue-50/50 hover:border-blue-500/40",
      accent: "text-blue-700",
    },
    {
      title: "Class 11th & 12th Science",
      board: "HSC / CBSE / Foundation",
      desc: "In-depth teaching for Physics, Chemistry, Mathematics, and Biology with dedicated doubts-solving sessions and exam preparation.",
      badge: "Engineering & Medical",
      color: "border-emerald-500/20 bg-emerald-50/50 hover:border-emerald-500/40",
      accent: "text-emerald-700",
    },
    {
      title: "Class 11th & 12th Commerce",
      board: "Bookkeeping & Accountancy",
      desc: "Specialized coaching in Accounts, Economics, Organization of Commerce (OCM), and Secretarial Practice (SP) by expert faculty.",
      badge: "CA / CS Foundation Ready",
      color: "border-purple-500/20 bg-purple-50/50 hover:border-purple-500/40",
      accent: "text-purple-700",
    },
    {
      title: "Revision & Test Series Batch",
      board: "Intensive Practice",
      desc: "Exam-oriented mock tests, paper presentations, previous years solved questions, and personalized feedback for score enhancement.",
      badge: "Score Booster",
      color: "border-amber-500/20 bg-amber-50/50 hover:border-amber-500/40",
      accent: "text-amber-700",
    },
  ];

  const handleSelectCourse = (courseTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: courseTitle,
      message: `I would like to enquire regarding admissions, batch timings, and fee structure for ${courseTitle}.`,
    }));
    const el = document.getElementById("enquiry");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setHighlightForm(true);
      setTimeout(() => setHighlightForm(false), 2000);
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.customerName.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg("Please enter your enquiry message");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      await fetch(`${apiUrl}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.customerName.trim(),
          mobile_number: formData.mobileNumber.trim(),
          email: formData.email.trim() || undefined,
          service_type: formData.serviceType,
          message: formData.message.trim(),
        }),
      }).catch(() => {
        // Fallback for offline resilience
      });

      // Save locally
      const stored = JSON.parse(localStorage.getItem("vaishnavi_enquiries") || "[]");
      stored.push({
        ...formData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("vaishnavi_enquiries", JSON.stringify(stored));

      setSubmittedData({ ...formData });
      setSubmittedModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectChat = (customText?: string) => {
    const text = customText || "Hello Vaishnavi Classes, I would like to enquire about course admissions and fees.";
    const url = getDirectChatWhatsAppUrl(text);
    openWhatsAppChat(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans scroll-smooth">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white text-xs py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider animate-pulse">
              Admissions Open 2026-27
            </span>
            <span className="text-slate-100">Welcome to Vaishnavi Classes — 28+ Years of Academic Excellence (Since 1996)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <button
              onClick={() => handleDirectChat()}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer font-bold"
            >
              <PhoneCall className="h-3 w-3 text-emerald-400" />
              <span>WhatsApp: +91 96642 57346</span>
            </button>
            <span className="text-slate-400">|</span>
            <Link href="/login" className="hover:text-indigo-200 transition-colors font-bold text-white flex items-center gap-1">
              Portal Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.png"
              alt="Vaishnavi Classes Logo"
              className="h-12 w-12 rounded-xl object-cover shadow-sm border border-slate-200 transition-transform group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Vaishnavi Classes
                </span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Since 1996
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Pioneers in Quality Education &amp; Board Exam Coaching
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#courses" className="hover:text-indigo-600 transition-colors">Courses</a>
            <a href="#why-us" className="hover:text-indigo-600 transition-colors">Why Vaishnavi</a>
            <a href="#enquiry" className="hover:text-indigo-600 transition-colors text-indigo-600">
              Admission Enquiry
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDirectChat()}
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              WhatsApp Us
            </button>

            {user ? (
              <Link
                href={`/${user.role}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                Open Dashboard ({user.role})
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                Portal Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>28+ Years of Academic Excellence (Est. 1996)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Empowering Students to Achieve <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Top Academic Results</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Vaishnavi Classes provides expert-led, result-driven coaching for 8th, 9th, 10th School Boards (SSC/CBSE) and 11th &amp; 12th Science &amp; Commerce. Experience personalized guidance, small batch sizes, and transparent digital fee management.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#enquiry"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Send WhatsApp Enquiry
                </a>

                <button
                  onClick={() => handleDirectChat()}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm px-5 py-3.5 rounded-xl shadow-xs transition-all hover:border-slate-400 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  Chat on WhatsApp (+91 96642 57346)
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-sm px-3 py-3.5"
                >
                  <span>Student/Staff Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">28+</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Years of Trust (1996)</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <p className="text-2xl sm:text-3xl font-black text-indigo-600">10,000+</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Successful Students</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Digital Receipts &amp; Fees</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 ring-4 ring-indigo-50/50">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <img
                    src="/logo.png"
                    alt="Vaishnavi Classes"
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Vaishnavi Classes</h3>
                    <p className="text-xs text-indigo-600 font-bold">Since 1996 • Excellence Always</p>
                    <p className="text-[11px] text-slate-500 font-medium">Official Portal &amp; Fee Management</p>
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Experienced Faculty</p>
                      <p className="text-[11px] text-slate-500">Mentors with over two decades of board exam expertise.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Instant WhatsApp Fee Reminders</p>
                      <p className="text-[11px] text-slate-500">Automated installment notices &amp; QR code payment receipts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct Owner WhatsApp Support</p>
                      <p className="text-[11px] text-slate-500">Instant communication at +91 96642 57346 with notifications.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#enquiry"
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    Apply for Admission 2026 →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Academic Programs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Coaching Programs Tailored for High Performance
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Comprehensive curriculum coverage, structured doubt clearing, and regular assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 border ${course.color} transition-all duration-200 hover:shadow-xl flex flex-col justify-between group`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {course.board}
                  </span>
                  <h3 className="font-black text-slate-900 text-lg mt-3 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5 font-normal">
                    {course.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${course.accent} bg-white px-2.5 py-1 rounded-md border border-slate-200/70 shadow-2xs`}>
                    {course.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectCourse(course.title)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Enquire →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Vaishnavi Classes */}
      <section id="why-us" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Why Vaishnavi Classes?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              28 Years of Proven Trust and Success
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Since 1996, generations of students have achieved their highest academic potential with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-2xs">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Unmatched Teaching Heritage</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                Founded in 1996, we bring over 28 years of consistent board toppers, deep subject knowledge, and proven pedagogical methods.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Personalized Mentorship</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                Every student receives individual attention, customized study strategies, periodic parent updates, and one-on-one doubt clearance.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Transparent Digital Portal</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                Students and parents get a dedicated dashboard to track fee plans, download verified QR-code PDF receipts, and view payment ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP ENQUIRY & CONTACT SECTION */}
      <section id="enquiry" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info & WhatsApp Instruction */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Admission &amp; Fee Enquiry
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                  Connect Directly with Management
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                  Fill out the form to submit your admission inquiry. It records your request in our system and connects directly with the institute management at <strong>+91 96642 57346</strong>.
                </p>
              </div>

              {/* Direct Info Card */}
              <div className="bg-slate-50/90 rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
                <a
                  href="tel:+919664257346"
                  className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Registered WhatsApp &amp; Mobile</p>
                    <p className="text-sm font-bold text-slate-900">+91 96642 57346</p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 p-2 rounded-xl">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Inquiry Hours</p>
                    <p className="text-sm font-bold text-slate-900">Mon – Sat (8:00 AM – 8:30 PM)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-2 rounded-xl">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Campus &amp; Desk</p>
                    <p className="text-sm font-bold text-slate-900">Vaishnavi Classes Main Branch</p>
                  </div>
                </div>
              </div>

              {/* Mobile Notification Notice */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Direct Communication Guarantee:</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-normal">
                  Your enquiry is saved directly to our system database. You can also chat directly on WhatsApp with pre-filled details to get instant admission confirmations.
                </p>
              </div>

              {/* Quick direct chat button */}
              <button
                type="button"
                onClick={() => handleDirectChat()}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Quick Direct Chat (+91 96642 57346)
              </button>
            </div>

            {/* Right: The Interactive Enquiry Form */}
            <div className="lg:col-span-7">
              <div
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border transition-all duration-300 ${
                  highlightForm
                    ? "border-indigo-500 ring-4 ring-indigo-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Vaishnavi Classes"
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Website Enquiry Form</h3>
                      <p className="text-xs text-slate-500">Official Vaishnavi Classes Contact</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                  {/* Customer Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Customer / Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Email & Service Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Service / Enquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="10th Board Coaching (SSC/CBSE)">10th Board Coaching (SSC/CBSE)</option>
                        <option value="Class 11th & 12th Science">Class 11th &amp; 12th Science</option>
                        <option value="Class 11th & 12th Commerce">Class 11th &amp; 12th Commerce</option>
                        <option value="Class 8th to 10th (Secondary)">Class 8th to 10th (Secondary)</option>
                        <option value="Revision & Test Series Batch">Revision &amp; Test Series Batch</option>
                        <option value="Fee Plan & Admission Inquiries">Fee Plan &amp; Admission Inquiries</option>
                        <option value="General Information">General Information</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message / Special Queries <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Type details about your requirement..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Message Preview Box */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono">
                    <p className="font-bold text-slate-800 mb-1">📋 Prefilled WhatsApp Message Preview:</p>
                    <p className="whitespace-pre-line text-slate-700 font-medium">
                      {formatEnquiryWhatsAppMessage(formData)}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Sending Enquiry Directly..." : "🚀 Send Enquiry Directly to Vaishnavi Classes"}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Your enquiry is sent directly from the website without opening any external tabs or windows.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS CONFIRMATION MODAL */}
      {submittedModalOpen && submittedData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSubmittedModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Enquiry Recorded Successfully!</h3>
                <p className="text-xs text-slate-500">Vaishnavi Classes Desk has received your request</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{submittedData.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">WhatsApp Mobile:</span>
                <span className="font-bold text-slate-900">{submittedData.mobileNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Selected Program:</span>
                <span className="font-bold text-indigo-700">{submittedData.serviceType}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Message:</span>
                <p className="italic text-slate-700 font-medium">"{submittedData.message}"</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const url = `https://wa.me/919664257346?text=${encodeURIComponent(
                    formatEnquiryWhatsAppMessage(submittedData)
                  )}`;
                  openWhatsAppChat(url);
                  setSubmittedModalOpen(false);
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> Also Open in WhatsApp to Message Management Now
              </button>
              <button
                type="button"
                onClick={() => setSubmittedModalOpen(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Done / Management will call me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Vaishnavi Classes"
                  className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Vaishnavi Classes</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Since 1996 • 28+ Years</p>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Dedicated to academic perfection, conceptual clarity, and outstanding student achievement.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Courses</h5>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li><button onClick={() => handleSelectCourse("Class 8th to 10th (Secondary)")} className="hover:text-white transition-colors cursor-pointer">Class 8th, 9th &amp; 10th (SSC / CBSE)</button></li>
                <li><button onClick={() => handleSelectCourse("Class 11th & 12th Science")} className="hover:text-white transition-colors cursor-pointer">Class 11th &amp; 12th Science</button></li>
                <li><button onClick={() => handleSelectCourse("Class 11th & 12th Commerce")} className="hover:text-white transition-colors cursor-pointer">Class 11th &amp; 12th Commerce</button></li>
                <li><button onClick={() => handleSelectCourse("Revision & Test Series Batch")} className="hover:text-white transition-colors cursor-pointer">Intensive Board Test Series</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Portals</h5>
              <ul className="space-y-2 text-slate-400 text-[11px]">
                <li><Link href="/login" className="hover:text-white transition-colors">Student Portal Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Staff Portal Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><Link href="/verify-receipt" className="hover:text-white transition-colors">Verify PDF Receipt QR</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Direct Contact</h5>
              <div className="space-y-2 text-slate-400 text-[11px]">
                <p>📞 Phone: +91 96642 57346</p>
                <p>💬 WhatsApp: +91 96642 57346</p>
                <p>📍 Location: Vaishnavi Classes</p>
                <button
                  onClick={() => handleDirectChat()}
                  className="mt-2 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                >
                  <Send className="h-3 w-3" /> Chat on WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <p>© {new Date().getFullYear()} Vaishnavi Classes (Since 1996). All rights reserved.</p>
            <p>FeeFlow Management System — Designed for Vaishnavi Classes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
