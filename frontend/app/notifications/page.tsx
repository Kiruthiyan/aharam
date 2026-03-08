"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState, useRef } from "react";
import {
  Bell, Megaphone, Send, MessageCircle, CheckCircle2, Clock, AlertTriangle,
  Loader2, FileText, X, Phone, Users, History, Sparkles, Smartphone, ChevronDown
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Notice {
  id?: number;
  title: string;
  message: string;
  audience: "STAFF" | "STUDENTS" | "ALL";
  channel: "APP" | "WHATSAPP" | "BOTH";
  sentBy?: string;
  sentByRole?: string;
  at: string;
  status?: "SENT" | "PENDING" | "FAILED";
  whatsappCount?: number;
}

// ── WhatsApp helper ─────────────────────────────────────────────────────────────
function openWhatsApp(phone: string, text: string) {
  const clean = phone.replace(/\D/g, "");
  const number = clean.startsWith("0") ? "94" + clean.slice(1) : clean;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ── Notification API ────────────────────────────────────────────────────────────

async function postNotification(payload: Omit<Notice, "at" | "id">): Promise<Notice> {
  const res: any = await api.post("/notifications/send", payload);
  return (res && typeof res === "object" && "data" in res ? res.data : res) as Notice;
}

async function fetchNotifications(): Promise<Notice[]> {
  const res: any = await api.get("/notifications");
  return (res && typeof res === "object" && "data" in res ? res.data : res) as Notice[];
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [userRole, setUserRole] = useState<Role>("SUPER_ADMIN");
  const [username, setUsername] = useState("Staff");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [previewPhone, setPreviewPhone] = useState("");
  const [showMiniTest, setShowMiniTest] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Notice["audience"]>("STUDENTS");
  const [channel, setChannel] = useState<Notice["channel"]>("BOTH");

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const charLimit = 1000;

  useEffect(() => {
    const role = localStorage.getItem("userRole") as Role;
    const name = localStorage.getItem("name") || localStorage.getItem("username") || "Staff";
    if (role) setUserRole(role);
    setUsername(name);
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotices(data);
    } catch {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await postNotification({ title, message, audience, channel });

      setNotices(prev => [result, ...prev]);

      const channels = channel === "BOTH" ? "App + WhatsApp" : channel === "WHATSAPP" ? "WhatsApp" : "App";
      setSuccess(`🎉 Notification successfully sent to ${audience === "ALL" ? "everyone" : audience.toLowerCase()} via ${channels}.`);
      setTitle("");
      setMessage("");
      loadNotifications();
      setTimeout(() => setSuccess(null), 5000);
    } catch (e: any) {
      setError(e?.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleTestWhatsApp = () => {
    if (!previewPhone) return;
    const text = `📢 *${title || "Test Notification"}*\n\n${message || "This is a test message from Aharam Academy."}\n\n— Sent by ${username}`;
    openWhatsApp(previewPhone, text);
  };

  const isStaff = userRole === "STAFF";
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const canCompose = isStaff || isSuperAdmin;

  const statusIcon = (s?: string) => {
    if (s === "SENT") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === "FAILED") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  const channelBadge = (c?: string) => {
    if (c === "WHATSAPP") return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </span>
    );
    if (c === "BOTH") return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-800 bg-blue-100/80 border border-blue-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
        <Megaphone className="h-3 w-3" /> App + Web
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 bg-gray-100 border border-gray-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
        <Bell className="h-3 w-3" /> App Only
      </span>
    );
  };

  const waMsgPreview = `📢 *${title || "[Title]"}*\n\n${message || "[Message]"}\n\n— ${username} | Aharam Academy`;

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white text-sm font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm";

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-6xl mx-auto space-y-6 pb-24">

        {/* ── Premium Page Header ────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 rounded-2xl sm:rounded-3xl"></div>
                <Bell className="h-8 w-8 sm:h-10 sm:w-10 relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">Notification Hub</h1>
                <p className="text-sm sm:text-base text-emerald-100/80 font-medium mt-1.5 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Broadcast multi-channel announcements
                </p>
              </div>
            </div>

            {canCompose && (
              <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner w-full sm:w-auto">
                {[
                  { key: "compose", label: "Broadcast", icon: Megaphone },
                  { key: "history", label: "History", icon: History },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                    className={clsx(
                      "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-xl",
                      activeTab === t.key
                        ? "bg-white text-emerald-900 shadow-md"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}>
                    <t.icon className={clsx("h-4 w-4", activeTab === t.key ? "text-emerald-600" : "opacity-70")} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Compose Area ─────────────────────────────────────────────────── */}
        {activeTab === "compose" && canCompose && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Form Section */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

              <div className="p-6 sm:p-10 space-y-8 relative z-10">

                {/* Status Messages */}
                {success && (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-900">{success}</p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm font-bold text-red-900">{error}</p>
                  </div>
                )}

                {/* Form Group: Title */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
                    <FileText className="h-4 w-4 text-emerald-500" /> Headline / Title
                  </label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Special Revision Class Tomorrow!"
                    maxLength={120}
                  />
                </div>

                {/* Form Group: Message */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-500 uppercase">
                      <MessageCircle className="h-4 w-4 text-emerald-500" /> Message Body
                    </label>
                    <span className={clsx("text-xs font-bold px-3 py-1 rounded-full bg-gray-100", message.length > charLimit * 0.9 ? "text-red-500 bg-red-50" : "text-gray-500")}>
                      {message.length} / {charLimit}
                    </span>
                  </div>
                  <textarea
                    ref={messageRef}
                    rows={7}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className={`${inputCls} resize-none leading-relaxed`}
                    placeholder="Write the full announcement here..."
                    maxLength={charLimit}
                  />

                  {/* Quick Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      "🚨 Urgent Update:\n",
                      "📅 Schedule Change:\n",
                      "✅ Reminder: Fees\n",
                      "📝 Exam Notice:\n",
                    ].map(t => (
                      <button key={t} type="button"
                        onClick={() => setMessage(prev => (prev ? prev + "\n" : "") + t)}
                        className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200/60 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-sm transition-all active:scale-95">
                        + {t.trim().replace(":", "")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Group: Target & Channel Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
                      <Users className="h-4 w-4 text-emerald-500" /> Audience
                    </label>
                    <div className="relative">
                      <select value={audience} onChange={e => setAudience(e.target.value as any)} className={`${inputCls} appearance-none pr-10 bg-white`}>
                        {isStaff ? (
                          <option value="STUDENTS">My Assigned Students</option>
                        ) : (
                          <>
                            <option value="STUDENTS">🎯 All Students</option>
                            <option value="STAFF">👔 All Staff Members</option>
                            <option value="ALL">🌍 Everyone (Institute Wide)</option>
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
                      <Smartphone className="h-4 w-4 text-emerald-500" /> Delivery Channel
                    </label>
                    <div className="relative">
                      <select value={channel} onChange={e => setChannel(e.target.value as any)} className={`${inputCls} appearance-none pr-10 bg-white`}>
                        <option value="BOTH">🚀 App + WhatsApp (Recommended)</option>
                        <option value="WHATSAPP">💬 WhatsApp Only</option>
                        <option value="APP">🔔 App Notification Only</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Block */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !title.trim() || !message.trim()}
                    className={clsx(
                      "w-full py-5 rounded-2xl font-black text-white text-base transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0",
                      channel === "WHATSAPP" || channel === "BOTH"
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-green-600/20"
                        : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-emerald-600/20"
                    )}>
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    {sending ? "Broadcasting..." : "Broadcast Message"}
                  </button>
                  <p className="text-center text-xs font-medium text-gray-400 mt-4">
                    Verify all details before sending. Messages cannot be edited once broadcasted.
                  </p>
                </div>

              </div>
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">

              {/* WhatsApp Mockup UI */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                {/* Mock Phone Bezel */}
                <div className="absolute top-0 inset-x-0 h-7 bg-gray-100 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Mock WhatsApp Header */}
                <div className="pt-7 px-5 py-4 bg-emerald-600 flex items-center gap-3 text-white shadow-md relative z-10">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0 border border-white/20">
                    <span className="font-bold text-sm">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">Aharam Academy</p>
                    <p className="text-[10px] text-emerald-100 opacity-90 truncate">Official Institute Channel</p>
                  </div>
                </div>

                {/* Mock Chat Area */}
                <div className="p-5 bg-[#efeae2] h-[400px] overflow-y-auto relative flex flex-col justify-end chat-bg">`n{/* The Message Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm inline-block max-w-[90%] self-start relative animate-in zoom-in-95 duration-300">
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                    <p className="text-xs text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {waMsgPreview}
                    </p>
                    <div className="flex justify-end items-center gap-1 mt-1.5">
                      <p className="text-[9px] text-gray-400 font-bold tracking-tight">
                        {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testing / Diagnostic panel */}
              {channel !== "APP" && (
                <div className="bg-emerald-50 rounded-3xl border border-emerald-200/60 p-5 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Diagnostic</h4>
                    </div>
                    <button onClick={() => setShowMiniTest(!showMiniTest)} className="text-[10px] font-black underline text-emerald-600">
                      {showMiniTest ? "Close" : "Test Single Number"}
                    </button>
                  </div>

                  {showMiniTest ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        <input
                          value={previewPhone}
                          onChange={e => setPreviewPhone(e.target.value)}
                          placeholder="+94 7X XXX XXXX"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-200 text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <button onClick={handleTestWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors w-full shadow-sm">
                        Shoot Test Message
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Messages will be dispatched to registered <strong className="font-black">Parent</strong> or <strong className="font-black">Student</strong> numbers instantly.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── History Tab ─────────────────────────────────────────────── */}
        {(activeTab === "history" || !canCompose) && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gray-200"></div>

            <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900">Broadcast History</h3>
                <p className="text-sm font-medium text-gray-400 mt-1">Review all past announcements sent from the system.</p>
              </div>
              <button onClick={loadNotifications} disabled={loading}
                className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-white shadow-sm border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95">
                <Loader2 className={clsx("h-4 w-4", loading && "animate-spin")} />
                Refresh Log
              </button>
            </div>

            <div className="flex-1 bg-white">
              {loading ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-emerald-500">
                  <div className="p-4 bg-emerald-50 rounded-full animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 font-mono text-center">SYNCING_LEDGER...</p>
                </div>
              ) : notices.length === 0 ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-5 text-center px-6">
                  <div className="h-24 w-24 rounded-[2rem] bg-gray-50 shadow-inner flex items-center justify-center border border-gray-100">
                    <History className="h-10 w-10 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900">It's quiet here.</h4>
                    <p className="text-base text-gray-400 font-medium mt-2 max-w-sm mx-auto">
                      No broadcast records found. Send your first announcement to see it tracked here.
                    </p>
                  </div>
                  {canCompose && (
                    <button onClick={() => setActiveTab("compose")} className="mt-4 text-emerald-600 font-bold border border-emerald-200 bg-emerald-50 px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
                      Compose Something
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notices.map((n, idx) => (
                    <div key={idx} className="p-6 sm:p-8 hover:bg-green-50/30 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1 bg-white p-1 rounded-full shadow-sm">
                            {statusIcon(n.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-gray-900 text-base sm:text-lg tracking-tight mb-1">{n.title}</h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed block overflow-hidden">
                              {n.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-2">
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap shadow-sm">
                            {n.at}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4 ml-8">
                        {channelBadge(n.channel)}
                        <span className={clsx(
                          "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm border",
                          n.audience === "STUDENTS" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            n.audience === "STAFF" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-purple-50 text-purple-700 border-purple-200"
                        )}>
                          🎯 {n.audience === "ALL" ? "Everyone" : n.audience === "STUDENTS" ? "Students" : "Staff"}
                        </span>
                        {n.sentBy && (
                          <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> by {n.sentBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

