"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo, useRef } from "react";
import {
    CreditCard, Search, Loader2, X, CheckCircle2, AlertCircle,
    Clock, Users, Filter, Barcode, User, ZapIcon,
    TrendingUp, BarChart3, History, Calendar, RefreshCw,
    ChevronDown, ChevronUp
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    gender?: string;
    center?: string;
    phone?: string;
}

interface FeeRecord {
    id: number;
    student?: Student;
    month: string;
    academicYear: string;
    status: "PAID" | "PENDING";
    updateMethod?: "BARCODE" | "MANUAL";
    updatedBy?: { fullName: string };
    updatedAt?: string;
}

// ── Shared Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "PAID" | "PENDING" }) {
    return (
        <span className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            status === "PAID"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
        )}>
            {status === "PAID" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {status}
        </span>
    );
}

function StatCard({ title, value, sub, icon: Icon, color }: {
    title: string; value: string | number; sub?: string; icon: any; color: string;
}) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={clsx("h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", color)}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
                <p className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 leading-none">{value}</p>
                <p className="text-[9px] sm:text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1 truncate">
                    {title}{sub && <span className="text-gray-300 ml-1 font-bold">{sub}</span>}
                </p>
            </div>
        </div>
    );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ student, month, year, action, onConfirm, onCancel }: {
    student: Student; month: string; year: string; action: "PAID" | "PENDING";
    onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
                <div className={clsx("p-8 text-white", action === "PAID" ? "bg-emerald-900" : "bg-amber-700")}>
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5 border border-white/20">
                        {action === "PAID" ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Confirm Fee Update</h2>
                    <p className="text-sm opacity-80 mt-2 font-medium">{student.fullName} — {month} {year}</p>
                </div>
                <div className="p-8">
                    <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                        You are marking this fee as <strong className={action === "PAID" ? "text-emerald-700" : "text-amber-700"}>{action}</strong>. This action will be logged with your staff ID.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-50 hover:border-gray-200 transition-all tracking-wide">Cancel</button>
                        <button onClick={onConfirm} className={clsx(
                            "flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all tracking-wide hover:-translate-y-0.5",
                            action === "PAID" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20" : "bg-amber-600 hover:bg-amber-700 shadow-amber-900/20"
                        )}>
                            Confirm {action}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── STAFF VIEW ────────────────────────────────────────────────────────────────

function StaffFeesView({ staffId }: { staffId: string }) {
    const { toast } = useToast();
    const barcodeRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Helpers
    const openWhatsApp = (phone: string, text: string) => {
        if (!phone) return;
        const clean = phone.replace(/\D/g, "");
        const number = clean.startsWith("0") ? "94" + clean.slice(1) : clean;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
    };

    // Config
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [batch, setBatch] = useState("2026");

    // State
    const [barcodeValue, setBarcodeValue] = useState("");
    const [sessionActive, setSessionActive] = useState(false);
    const [loadingBarcode, setLoadingBarcode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [batchFees, setBatchFees] = useState<FeeRecord[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [confirm, setConfirm] = useState<{ student: Student; action: "PAID" | "PENDING" } | null>(null);
    const [markingId, setMarkingId] = useState<string | null>(null);

    // Recent barcode results
    const [recentScans, setRecentScans] = useState<FeeRecord[]>([]);

    // Active tab
    const [tab, setTab] = useState<"BARCODE" | "SEARCH" | "BATCH">("BARCODE");

    useEffect(() => {
        if (sessionActive && barcodeRef.current) barcodeRef.current.focus();
    }, [sessionActive]);

    // Load students + batch fees
    useEffect(() => {
        const load = async () => {
            setLoadingData(true);
            try {
                const [sRes, fRes]: any = await Promise.all([
                    api.get("/students"),
                    api.get(`/fees/batch/${batch}?month=${month}&academicYear=${year}`)
                ]);
                const studentsData = sRes.data || sRes;
                setAllStudents(studentsData.filter((s: Student) => s.examBatch?.toString() === batch));
                setBatchFees(fRes.data || fRes);
            } catch { } finally { setLoadingData(false); }
        };
        load();
    }, [batch, month, year]);

    // Barcode scan
    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeValue.trim()) return;
        setLoadingBarcode(true);
        try {
            const res: any = await api.post("/fees/scan", { barcode: barcodeValue.trim(), month, academicYear: year, staffId: parseInt(staffId) });
            const rec: FeeRecord = res.data || res;
            setRecentScans(prev => [rec, ...prev.slice(0, 9)]);
            setBatchFees(prev => [rec, ...prev.filter(f => f.student?.studentId !== rec.student?.studentId)]);
            toast("success", `✔ ${rec.student?.fullName} — Fee PAID for ${month}`);

            // Open WhatsApp auto-message fallback
            if (rec.student?.phone) {
                openWhatsApp(rec.student.phone, `✅ *Fee Update*\n\n${rec.student.fullName}'s fee for ${month} ${year} has been successfully paid.\n\n— Aharam Academy`);
            }

            setBarcodeValue("");
            barcodeRef.current?.focus();
        } catch (err: any) {
            const msg = err.message || "";
            if (msg.includes("already marked")) {
                toast("info", msg);
            } else {
                toast("error", msg || "Student not found.");
            }
            setBarcodeValue("");
            barcodeRef.current?.focus();
        } finally { setLoadingBarcode(false); }
    };

    // Manual mark
    const doManualMark = async (studentId: string, action: "PAID" | "PENDING") => {
        setMarkingId(studentId + action);
        try {
            const res: any = await api.post("/fees/manual", { studentId, month, academicYear: year, status: action, staffId: parseInt(staffId) });
            const rec: FeeRecord = res.data || res;
            setBatchFees(prev => [rec, ...prev.filter(f => f.student?.studentId !== rec.student?.studentId)]);
            toast("success", `${action}: ${rec.student?.fullName}`);

            // Open WhatsApp auto-message fallback
            if (rec.student?.phone) {
                const emoji = action === "PAID" ? "✅" : "⏳";
                openWhatsApp(rec.student.phone, `${emoji} *Fee Update*\n\n${rec.student.fullName}'s fee for ${month} ${year} is now ${action}.\n\n— Aharam Academy`);
            }

            setConfirm(null);
        } catch (err: any) { toast("error", err.message || "Failed to update."); } finally { setMarkingId(null); }
    };

    // Map of studentId -> fee record for batch view
    const feeMap = useMemo(() => {
        const m: Record<string, FeeRecord> = {};
        batchFees.forEach(f => { if (f.student?.studentId) m[f.student.studentId] = f; });
        return m;
    }, [batchFees]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allStudents.filter(s =>
            s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [searchQuery, allStudents]);

    const stats = useMemo(() => {
        const paid = Object.values(feeMap).filter(f => f.status === "PAID").length;
        const total = allStudents.length;
        return { paid, pending: total - paid, total };
    }, [feeMap, allStudents]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Confirm Modal */}
            {confirm && (
                <ConfirmModal
                    student={confirm.student} month={month} year={year} action={confirm.action}
                    onConfirm={() => doManualMark(confirm.student.studentId, confirm.action)}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fee Management</h1>
                        <p className="text-sm text-gray-400 font-medium mt-1">Hybrid: Barcode · Search · Batch Monitor</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                    <select value={month} onChange={e => setMonth(e.target.value)}
                        className="bg-white border text-gray-700 border-gray-200 px-5 py-3 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm cursor-pointer transition-all hover:bg-gray-50 min-w-[140px]">
                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="bg-white border text-gray-700 border-gray-200 px-5 py-3 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm cursor-pointer transition-all hover:bg-gray-50 min-w-[120px]">
                        {["2024", "2025", "2026", "2027"].map(y => <option key={y}>{y}</option>)}
                    </select>
                    <select value={batch} onChange={e => setBatch(e.target.value)}
                        className="bg-white border text-gray-700 border-gray-200 px-5 py-3 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm cursor-pointer transition-all hover:bg-gray-50 min-w-[140px]">
                        {["2024", "2025", "2026", "2027"].map(b => <option key={b}>Batch {b}</option>)}
                    </select>
                </div>
            </div>

            {/* ── Stats ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Completion" value={stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) + "%" : "0%"} icon={TrendingUp} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                <StatCard title="Paid" value={stats.paid} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="bg-amber-50 text-amber-500 border border-amber-100" />
                <StatCard title="Students" value={stats.total} icon={Users} color="bg-purple-50 text-purple-600 border border-purple-100" />
            </div>

            {/* ── Method Tabs ──────────────────────────────────────────── */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50/30">
                    {([
                        { key: "BARCODE", label: "Barcode", icon: Barcode },
                        { key: "SEARCH", label: "Name / ID", icon: Search },
                        { key: "BATCH", label: "Batch", icon: Users }
                    ] as const).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-5 text-xs sm:text-sm font-black transition-all border-b-2",
                                tab === t.key
                                    ? "text-emerald-700 border-emerald-600 bg-emerald-50/80 shadow-inner"
                                    : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <t.icon className="h-4 w-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB: BARCODE SCAN ───────────────────────────────── */}
                {tab === "BARCODE" && (
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Scanner */}
                            <div className="bg-emerald-950 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700"><Barcode className="h-64 w-64" /></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2 text-emerald-50">
                                        <div className="h-10 w-10 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-inner">
                                            <ZapIcon className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-black">Counter Scan</h2>
                                    </div>
                                    <p className="text-emerald-400/80 text-sm font-medium mb-8 ml-13">
                                        Scan student ID card → instant PAID update. <br />Session: <strong className="text-emerald-300 ml-1">{month} {year}</strong>
                                    </p>
                                    <form onSubmit={handleScan} className="relative">
                                        <Barcode className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 pointer-events-none" />
                                        <input
                                            ref={barcodeRef}
                                            type="text"
                                            autoFocus
                                            value={barcodeValue}
                                            onChange={e => setBarcodeValue(e.target.value)}
                                            placeholder="Scan barcode or type ID..."
                                            className="w-full bg-white text-gray-900 pl-16 pr-12 py-5 rounded-2xl text-xl font-mono tracking-widest focus:ring-4 focus:ring-emerald-500/50 outline-none shadow-inner placeholder:text-gray-300 font-bold"
                                        />
                                        {loadingBarcode && (
                                            <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 animate-spin" />
                                        )}
                                    </form>
                                </div>
                            </div>

                            {/* Recent Scans */}
                            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                                    Scan Log
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">{month} {year}</span>
                                </h3>
                                {recentScans.length === 0 ? (
                                    <div className="text-center py-16 text-gray-300">
                                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border border-gray-100 mx-auto mb-4 shadow-sm">
                                            <Barcode className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <p className="font-bold text-sm text-gray-400 tracking-wide">No scans this session yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                        {recentScans.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all">
                                                <div>
                                                    <p className="font-black text-gray-900 text-base">{r.student?.fullName}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">{r.student?.studentId}</p>
                                                </div>
                                                <StatusBadge status="PAID" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: SEARCH ─────────────────────────────────────── */}
                {tab === "SEARCH" && (
                    <div className="p-8">
                        <div className="relative mb-6">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by student name or ID..."
                                className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner placeholder:text-gray-300 transition-all"
                            />
                        </div>

                        {searchResults.length === 0 && searchQuery && (
                            <p className="text-center text-gray-400 py-16 font-bold tracking-wide">No students found for "{searchQuery}"</p>
                        )}

                        {searchResults.length === 0 && !searchQuery && (
                            <div className="text-center py-16 text-gray-300">
                                <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mx-auto mb-4">
                                    <User className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="font-bold text-gray-400 tracking-wide">Type a name or ID to search</p>
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map(s => {
                                    const rec = feeMap[s.studentId];
                                    const isPaid = rec?.status === "PAID";
                                    return (
                                        <div key={s.studentId} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-[1rem] bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-500 text-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    {s.fullName.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-base">{s.fullName}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">{s.studentId} · Batch {s.examBatch}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {rec && <StatusBadge status={rec.status} />}
                                                {!isPaid ? (
                                                    <button
                                                        onClick={() => setConfirm({ student: s, action: "PAID" })}
                                                        disabled={markingId === s.studentId + "PAID"}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {markingId === s.studentId + "PAID" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                                        Mark Paid
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirm({ student: s, action: "PENDING" })}
                                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-amber-50 text-gray-500 hover:text-amber-700 hover:border-amber-200 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Revert
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: BATCH MONITOR ──────────────────────────────── */}
                {tab === "BATCH" && (
                    <div className="p-0">
                        {loadingData ? (
                            <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
                        ) : (
                            <div className="overflow-auto max-h-[580px] scrollbar-hide">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0 backdrop-blur-md z-10">
                                        <tr>
                                            {["#", "Student", "Gender", "Status", "Method", "Updated By", "Actions"].map((h, i) => (
                                                <th key={h} className={clsx("px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest", i >= 5 && "text-right")}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {allStudents.length === 0 ? (
                                            <tr><td colSpan={7} className="py-24 text-center text-gray-400 font-bold tracking-wide">No students found for Batch {batch}.</td></tr>
                                        ) : (
                                            allStudents.map((s, idx) => {
                                                const rec = feeMap[s.studentId];
                                                const isPaid = rec?.status === "PAID";
                                                return (
                                                    <tr key={s.studentId} className="hover:bg-emerald-50/30 transition-colors group">
                                                        <td className="px-8 py-5 text-sm font-black text-gray-300 group-hover:text-emerald-300">{idx + 1}</td>
                                                        <td className="px-8 py-5">
                                                            <p className="font-black text-gray-900 text-base">{s.fullName}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">{s.studentId}</p>
                                                        </td>
                                                        <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">{s.gender || "—"}</td>
                                                        <td className="px-8 py-5">
                                                            <StatusBadge status={rec?.status || "PENDING"} />
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {rec?.updateMethod ? (
                                                                <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl w-fit drop-shadow-sm">
                                                                    {rec.updateMethod === "BARCODE" ? <Barcode className="h-3.5 w-3.5 text-gray-400" /> : <User className="h-3.5 w-3.5 text-gray-400" />}
                                                                    {rec.updateMethod}
                                                                </span>
                                                            ) : <span className="text-gray-300 text-sm">—</span>}
                                                        </td>
                                                        <td className="px-8 py-5 text-xs font-medium text-gray-400 text-right">{rec?.updatedBy?.fullName || "—"}</td>
                                                        <td className="px-8 py-5 text-right">
                                                            {!isPaid ? (
                                                                <button
                                                                    onClick={() => setConfirm({ student: s, action: "PAID" })}
                                                                    disabled={!!markingId}
                                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setConfirm({ student: s, action: "PENDING" })}
                                                                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-amber-50 text-gray-500 hover:text-amber-700 hover:border-amber-200 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    Revert
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── ADMIN VIEW ────────────────────────────────────────────────────────────────

function AdminFeesView() {
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [summary, setSummary] = useState<any>(null);
    const [records, setRecords] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [sRes, rRes]: any = await Promise.all([
                api.get(`/fees/admin/summary?academicYear=${year}`),
                api.get(`/fees/admin/all?academicYear=${year}`)
            ]);
            setSummary(sRes.data || sRes);
            setRecords(rRes.data || rRes);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [year]);

    const byBatch = useMemo(() => {
        const g: Record<string, FeeRecord[]> = {};
        records.forEach(r => {
            const b = r.student?.examBatch?.toString() || "Unknown";
            if (!g[b]) g[b] = [];
            g[b].push(r);
        });
        return g;
    }, [records]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0"><BarChart3 className="h-6 w-6" /></div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fee Analytics</h1>
                        <p className="text-sm text-gray-400 font-medium mt-1">View-only: Admin cannot update fee status</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                    <select value={year} onChange={e => setYear(e.target.value)}
                        className="bg-white border text-gray-700 border-gray-200 px-5 py-3 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm cursor-pointer transition-all hover:bg-gray-50 min-w-[120px]">
                        {["2024", "2025", "2026", "2027"].map(y => <option key={y}>{y}</option>)}
                    </select>
                    <button onClick={load} className="flex items-center gap-2 text-sm font-black text-gray-500 border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Completion" value={`${summary.completionPercentage}%`} icon={TrendingUp} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                    <StatCard title="Total Records" value={summary.totalRecords} icon={Users} color="bg-purple-50 text-purple-600 border border-purple-100" />
                    <StatCard title="Paid" value={summary.paid} icon={CheckCircle2} color="bg-blue-50 text-blue-600 border border-blue-100" />
                    <StatCard title="Pending" value={summary.pending} icon={AlertCircle} color="bg-amber-50 text-amber-500 border border-amber-100" />
                </div>
            )}

            {/* Monthly Overview */}
            {summary?.monthlyPaid && (
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Monthly Paid Count — {year}</h3>
                    <div className="flex items-end gap-3 h-36">
                        {MONTHS.map(m => {
                            const count = summary.monthlyPaid[m] || 0;
                            const max = Math.max(...Object.values(summary.monthlyPaid as Record<string, number>), 1);
                            const height = Math.round((count / max) * 100);
                            return (
                                <div key={m} className="flex-1 flex flex-col items-center gap-2 group">
                                    <span className="text-[10px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 relative top-2">{count > 0 ? count : ""}</span>
                                    <div
                                        style={{ height: `${Math.max(height, count > 0 ? 10 : 2)}%` }}
                                        className={clsx("w-full rounded-t-xl transition-all duration-500 group-hover:brightness-110", count > 0 ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "bg-gray-100")}
                                    />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.substring(0, 3)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Batch Breakdown */}
            {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-gray-900">Batch-Wise Breakdown</h3>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-black border border-emerald-100">{Object.keys(byBatch).length} Batches</div>
                    </div>
                    {Object.entries(byBatch).map(([b, recs]) => {
                        const paid = recs.filter(r => r.status === "PAID").length;
                        const pct = recs.length > 0 ? Math.round((paid / recs.length) * 100) : 0;
                        const isOpen = expandedBatch === b;
                        return (
                            <div key={b} className="border-b border-gray-50 last:border-0">
                                <button
                                    onClick={() => setExpandedBatch(isOpen ? null : b)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-gray-900">Batch {b}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full"><div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded-full" /></div>
                                            <span className="text-xs font-bold text-gray-500">{pct}%</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{paid} / {recs.length} paid</span>
                                    </div>
                                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                </button>
                                {isOpen && (
                                    <div className="overflow-auto max-h-80 border-t border-gray-50 scrollbar-hide">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {["Student", "Month", "Status", "Method", "Updated By"].map(h => (
                                                        <th key={h} className="px-5 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px]">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {recs.map(r => (
                                                    <tr key={r.id} className="hover:bg-gray-50">
                                                        <td className="px-5 py-3 font-bold text-gray-900">{r.student?.fullName}</td>
                                                        <td className="px-5 py-3 text-gray-500">{r.month}</td>
                                                        <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                                                        <td className="px-5 py-3 text-gray-500">{r.updateMethod || "—"}</td>
                                                        <td className="px-5 py-3 text-gray-400">{r.updatedBy?.fullName || "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── STUDENT VIEW ──────────────────────────────────────────────────────────────

function StudentFeesView({ userId }: { userId: string }) {
    const [records, setRecords] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res: any = await api.get(`/fees/student/${userId}`);
                setRecords(res.data || res);
            } catch { } finally { setLoading(false); }
        };
        if (userId) load();
    }, [userId]);

    const stats = useMemo(() => {
        const paid = records.filter(r => r.status === "PAID").length;
        return { paid, pending: records.length - paid, total: records.length };
    }, [records]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-5 transform rotate-6 scale-110"><CreditCard className="h-64 w-64" /></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                <CreditCard className="h-6 w-6 text-emerald-100" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">My Fee Status</h2>
                        </div>
                        <p className="text-emerald-100/80 text-sm font-medium pl-1">View-only — contact staff to update payment status.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-black/20 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 min-w-[120px] shadow-inner">
                            <p className="text-4xl font-black tracking-tight">{stats.paid}</p>
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-2">Paid</p>
                        </div>
                        <div className="text-center bg-black/20 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 min-w-[120px] shadow-inner">
                            <p className="text-4xl font-black tracking-tight">{stats.pending}</p>
                            <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest mt-2">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Alert */}
            {stats.pending > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 border-l-4 border-l-amber-500 rounded-[1.5rem] p-6 flex items-start sm:items-center gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-bold text-amber-900 leading-relaxed">
                        You have <strong className="text-amber-700 text-base mx-1">{stats.pending}</strong> pending month(s). Please contact your centre staff to update your fee status.
                    </p>
                </div>
            )}

            {/* Records */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 tracking-tight text-lg">Payment History</h3>
                </div>
                {loading ? (
                    <div className="py-24 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
                ) : records.length === 0 ? (
                    <div className="py-24 text-center text-gray-400 font-bold tracking-wide">No fee records found yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    {["Month", "Year", "Status", "Updated By", "Date"].map((h, i) => (
                                        <th key={h} className={clsx("px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest", i >= 3 && "text-right")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-gray-900 text-base">{r.month}</td>
                                        <td className="px-8 py-6 text-gray-500 font-bold tracking-widest">{r.academicYear}</td>
                                        <td className="px-8 py-6"><StatusBadge status={r.status} /></td>
                                        <td className="px-8 py-6 text-gray-500 text-xs font-bold text-right">{r.updatedBy?.fullName || "System"}</td>
                                        <td className="px-8 py-6 text-gray-400 text-xs font-mono text-right">
                                            {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("en-GB") : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Entry Point ───────────────────────────────────────────────────────────────

export default function FeesPage() {
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedId = localStorage.getItem("userId") || localStorage.getItem("username") || "";
        if (storedRole) setRole(storedRole as any);
        setUserId(storedId);
    }, []);

    return (
        <AdminLayout userRole={role}>
            <div className="p-2 sm:p-4">
                {role === "STUDENT" ? <StudentFeesView userId={userId} />
                    : role === "SUPER_ADMIN" ? <AdminFeesView />
                        : <StaffFeesView staffId={userId} />}
            </div>
        </AdminLayout>
    );
}
