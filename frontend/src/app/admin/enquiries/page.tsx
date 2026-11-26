"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  MessageSquare,
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Send,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle
} from "lucide-react";
import { BUSINESS_WHATSAPP_NUMBER } from "@/config/whatsapp";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Enquiry {
  id: string;
  customer_name: string;
  mobile_number: string;
  email?: string;
  service_type: string;
  message: string;
  source: string;
  status: "pending" | "contacted" | "converted";
  whatsapp_url: string;
  created_at: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Direct Reply Modal State
  const [replyEnquiry, setReplyEnquiry] = useState<Enquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Enquiry[]>("/enquiries");
      setEnquiries(data || []);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    setUpdatingId(enquiryId);
    try {
      const updated = await apiFetch<Enquiry>(`/enquiries/${enquiryId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: updated.status } : e))
      );
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDirectReply = (enquiry: Enquiry) => {
    setReplyEnquiry(enquiry);
    setReplySuccess(null);
    setReplyText(
      `Hello ${enquiry.customer_name},\n\nThank you for reaching out to *Vaishnavi Classes (Since 1996)* regarding *${enquiry.service_type}*.\n\nWe have received your enquiry: "${enquiry.message}"\n\nHow can we help you today with admissions, batch timings, or course syllabus?\n\nWarm regards,\n*Vaishnavi Classes Management*\n+91 ${BUSINESS_WHATSAPP_NUMBER.slice(-10)}`
    );
  };

  const handleSendDirectReply = async () => {
    if (!replyEnquiry || !replyText.trim()) return;
    setReplySending(true);

    try {
      await apiFetch("/reminders/send-direct", {
        method: "POST",
        body: JSON.stringify({
          recipient_phone: replyEnquiry.mobile_number,
          custom_message: replyText.trim(),
          template_type: "general",
        }),
      });

      // Update enquiry status to contacted
      handleStatusChange(replyEnquiry.id, "contacted");
      setReplySuccess(`Message sent directly to +91 ${replyEnquiry.mobile_number.slice(-10)}!`);
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setReplySending(false);
    }
  };

  const filtered = (enquiries || []).filter((e) => {
    const q = (search || "").toLowerCase();
    const matchesSearch =
      (e.customer_name || "").toLowerCase().includes(q) ||
      (e.mobile_number || "").includes(q) ||
      (e.service_type || "").toLowerCase().includes(q) ||
      (e.email && e.email.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = (enquiries || []).length;
  const pendingCount = (enquiries || []).filter((e) => e.status === "pending").length;
  const contactedCount = (enquiries || []).filter((e) => e.status === "contacted").length;
  const convertedCount = (enquiries || []).filter((e) => e.status === "converted").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Enquiries</h1>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Direct Messaging Active
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Visitor enquiries submitted directly from the website without opening third-party tabs.
            </p>
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Enquiries</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Action</p>
            <p className="text-3xl font-black text-amber-900 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 shadow-xs">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Contacted</p>
            <p className="text-3xl font-black text-blue-900 mt-1">{contactedCount}</p>
          </div>
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Converted</p>
            <p className="text-3xl font-black text-emerald-900 mt-1">{convertedCount}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Customer &amp; Date</th>
                  <th className="px-4 py-3.5">Mobile Number</th>
                  <th className="px-4 py-3.5">Service / Course</th>
                  <th className="px-4 py-3.5">Message</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Loading inquiries...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No website inquiries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-base">{enquiry.customer_name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {new Date(enquiry.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-900 font-bold text-sm">{enquiry.mobile_number}</div>
                        {enquiry.email && (
                          <div className="text-xs text-slate-500 truncate max-w-[160px]">
                            {enquiry.email}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-md text-xs border border-indigo-100">
                          {enquiry.service_type}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-slate-700 text-sm truncate" title={enquiry.message}>
                          {enquiry.message}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={enquiry.status}
                          disabled={updatingId === enquiry.id}
                          onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                            enquiry.status === "converted"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : enquiry.status === "contacted"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openDirectReply(enquiry)}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95"
                          title="Reply directly from the website without opening any extra tab"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Reply Directly
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Direct Reply Dialog (No external tabs!) */}
        {replyEnquiry && (
          <Dialog open={!!replyEnquiry} onOpenChange={(op) => !op && setReplyEnquiry(null)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Reply Directly to {replyEnquiry.customer_name}
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Direct Send
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Sends reply directly from website to +91 {replyEnquiry.mobile_number.slice(-10)} without opening WhatsApp Web.
              </DialogDescription>
            </DialogHeader>

            {replySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{replySuccess}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Status updated to &quot;Contacted&quot;. No browser tab was opened.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={() => setReplyEnquiry(null)} className="w-full text-xs">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Message Preview:
                  </label>
                  <textarea
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-950 font-medium">
                  ⚡ <strong>Direct Sending:</strong> Clicking below will dispatch this message directly in the background. No extra tab or window will be opened!
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReplyEnquiry(null)} disabled={replySending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendDirectReply}
                    disabled={replySending || !replyText.trim()}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-200"
                  >
                    {replySending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> 🚀 Send Directly (No New Tab)
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
