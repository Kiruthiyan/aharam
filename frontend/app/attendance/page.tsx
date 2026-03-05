"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo, useRef } from "react";
import {
    Calendar, Check, X, Loader2,
    Barcode, User, Users, Clock, Shield, AlertCircle,
    CheckCircle2, TrendingUp, Filter, BarChart3, Info,
    Search, MapPin, RefreshCw, PieChart, ZapIcon
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    center?: string;
    gender?: string;
    barcode?: string;
}

interface AttendanceRecord {
    id: number;
    student: Student;
    date: string;
    time?: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    method: "BARCODE" | "MANUAL";
    markedBy?: { fullName: string; id: number };
    batchOrClass?: string;
    center?: string;
}

// ── Shared Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "PRESENT" | "ABSENT" | "LATE" }) {
    return (
        <span className={clsx(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
            status === "PRESENT" && "bg-emerald-50 text-emerald-700 border-emerald-200",
            status === "LATE" && "bg-amber-50 text-amber-700 border-amber-200",
            status === "ABSENT" && "bg-red-50 text-red-700 border-red-200",
        )}>
            {status}
        </span>
    );
}

function StatCard({ title, value, sub, icon: Icon, color }: {
    title: string; value: string | number; sub?: string; icon: any; color: string;
}) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
            <div className={clsx("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-3xl font-black tracking-tight text-gray-900">{value}</p>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mt-1">
                    {title}{sub && <span className="text-gray-300 ml-1 font-bold">{sub}</span>}
                </p>
            </div>
        </div>
    );
}

// ── Staff View ────────────────────────────────────────────────────────────────

function StaffAttendanceView({ userId }: { userId: string }) {
    const { toast } = useToast();
    const barcodeRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Session config
    const [batch, setBatch] = useState("2026");
    const [center, setCenter] = useState("KOKUVIL");
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);

    // Session state
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState("");
    const [sessionRecords, setSessionRecords] = useState<AttendanceRecord[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // Manual search
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Focus barcode when session activates
    useEffect(() => {
        if (isSessionActive && barcodeRef.current) {
            barcodeRef.current.focus();
        }
    }, [isSessionActive]);

    // Load batch students when session starts
    const startSession = async () => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/students", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const all: Student[] = await res.json();
                setAllStudents(all.filter(s => s.examBatch?.toString() === batch));
            }
        } catch (e) { console.error(e); }
        setLoadingStudents(false);
        setIsSessionActive(true);
    };

    // Barcode scan handler
    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scannedBarcode.trim() || !isSessionActive) return;

        setLoadingAction("scan");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ barcode: scannedBarcode.trim(), staffId: userId, batch, center })
            });
            if (res.ok) {
                const rec: AttendanceRecord = await res.json();
                addOrUpdate(rec);
                toast("success", `✔ ${rec.student.fullName} — PRESENT`);
                setScannedBarcode("");
            } else {
                const msg = await res.text();
                toast("error", msg || "Barcode not recognised");
                setScannedBarcode("");
            }
        } catch {
            toast("error", "Connection error — check server.");
        } finally {
            setLoadingAction(null);
            barcodeRef.current?.focus();
        }
    };

    // Manual mark handler
    const markManual = async (studentId: string, status: "PRESENT" | "LATE" | "ABSENT") => {
        setLoadingAction(studentId + status);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/attendance/mark-manual", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ studentId, status, staffId: userId, date: targetDate })
            });
            if (res.ok) {
                const rec: AttendanceRecord = await res.json();
                addOrUpdate(rec);
                toast("success", `${status}: ${rec.student.fullName}`);
                setSearchQuery("");
                setShowSearch(false);
            } else {
                toast("error", "Failed to mark attendance.");
            }
        } catch {
            toast("error", "Connection error.");
        } finally {
            setLoadingAction(null);
        }
    };

    const addOrUpdate = (rec: AttendanceRecord) => {
        setSessionRecords(prev => [rec, ...prev.filter(r => r.student.studentId !== rec.student.studentId)]);
    };

    // End session
    const endSession = async () => {
        if (!confirm("End session? All unmarked students in this batch will be marked ABSENT.")) return;
        setLoadingAction("end");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/attendance/end-session", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ batch, date: targetDate, staffId: userId })
            });
            if (res.ok) {
                setIsSessionActive(false);
                toast("info", "Session closed. Auto-absent processed for unmarked students.");
                setSessionRecords([]);
            }
        } catch {
            toast("error", "Error ending session.");
        } finally {
            setLoadingAction(null);
        }
    };

    const stats = useMemo(() => ({
        present: sessionRecords.filter(r => r.status === "PRESENT").length,
        late: sessionRecords.filter(r => r.status === "LATE").length,
        absent: sessionRecords.filter(r => r.status === "ABSENT").length,
        barcode: sessionRecords.filter(r => r.method === "BARCODE").length,
        total: sessionRecords.length,
    }), [sessionRecords]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allStudents.filter(s =>
            s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
        ).slice(0, 6);
    }, [searchQuery, allStudents]);

    // Which students are already marked
    const markedIds = new Set(sessionRecords.map(r => r.student.studentId));

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">
            {/* ── Config Panel ─────────────────────────────────────────── */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
                                <Shield className="h-5 w-5" />
                            </div>
                            Attendance Session
                        </h1>
                        <p className="text-sm text-gray-400 mt-2 font-medium ml-13 border-l-2 border-emerald-100 pl-3">
                            {isSessionActive
                                ? <span className="flex items-center gap-2 text-emerald-600 font-bold"><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" /><span className="h-2 w-2 rounded-full bg-emerald-500" /></span>Session active — scanning for {center}</span>
                                : "Configure center and batch, then start session."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!isSessionActive ? (
                            <button
                                onClick={startSession}
                                disabled={loadingStudents}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loadingStudents ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
                                Start Session
                            </button>
                        ) : (
                            <button
                                onClick={endSession}
                                disabled={loadingAction === "end"}
                                className="bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 hover:text-red-700 px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loadingAction === "end" ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                                End &amp; Auto-Absent
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100">
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Center</label>
                        <select
                            disabled={isSessionActive}
                            value={center} onChange={e => setCenter(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <option value="KOKUVIL">KOKUVIL</option>
                            <option value="MALLAKAM">MALLAKAM</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Batch / Year</label>
                        <select
                            disabled={isSessionActive}
                            value={batch} onChange={e => setBatch(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <option>2024</option><option>2025</option><option>2026</option><option>2027</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Session Date</label>
                        <input
                            disabled={isSessionActive}
                            type="date" value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* ── Active Session Area ───────────────────────────────────── */}
            {isSessionActive && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Barcode Scanner */}
                    <div className="bg-emerald-950 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                            <Barcode className="h-64 w-64" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-2 flex items-center gap-3 text-emerald-50">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-inner">
                                    <ZapIcon className="h-5 w-5" />
                                </div>
                                Barcode Scanner
                            </h2>
                            <p className="text-emerald-400/80 text-sm font-medium mb-8 ml-13">Scan card — system will mark PRESENT instantly.</p>
                            <form onSubmit={handleBarcodeSubmit} className="relative">
                                <Barcode className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 pointer-events-none" />
                                <input
                                    ref={barcodeRef}
                                    type="text"
                                    placeholder="Scan or type barcode..."
                                    value={scannedBarcode}
                                    onChange={e => setScannedBarcode(e.target.value)}
                                    className="w-full bg-white text-gray-900 pl-16 pr-6 py-5 rounded-2xl text-xl font-mono tracking-widest focus:ring-4 focus:ring-emerald-500/50 outline-none shadow-inner placeholder:text-gray-300 font-bold"
                                />
                                {loadingAction === "scan" && (
                                    <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 animate-spin" />
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Manual Search */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-10">
                        <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                <Search className="h-5 w-5" />
                            </div>
                            Manual Mark
                        </h2>
                        <p className="text-sm text-gray-400 mb-8 font-medium ml-13">Search student by name or ID, then mark status.</p>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Name or Student ID..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                                onFocus={() => setShowSearch(true)}
                                className="w-full bg-gray-50/50 border border-gray-200 pl-14 pr-5 py-5 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300 shadow-inner"
                            />
                        </div>

                        {showSearch && searchResults.length > 0 && (
                            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden shadow-lg">
                                {searchResults.map(s => {
                                    const marked = markedIds.has(s.studentId);
                                    const rec = sessionRecords.find(r => r.student.studentId === s.studentId);
                                    return (
                                        <div key={s.studentId} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{s.fullName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{s.studentId}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {marked ? (
                                                    <StatusBadge status={rec!.status} />
                                                ) : null}
                                                <button
                                                    onClick={() => markManual(s.studentId, "PRESENT")}
                                                    disabled={loadingAction === s.studentId + "PRESENT"}
                                                    title="Mark Present"
                                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                                >
                                                    {loadingAction === s.studentId + "PRESENT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => markManual(s.studentId, "LATE")}
                                                    title="Mark Late"
                                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => markManual(s.studentId, "ABSENT")}
                                                    title="Mark Absent"
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {showSearch && searchQuery && searchResults.length === 0 && (
                            <p className="mt-4 text-center text-sm text-gray-400 py-4">No students found matching "{searchQuery}"</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Session Stats ─────────────────────────────────────────── */}
            {isSessionActive && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Present Rate" value={stats.total > 0 ? Math.round((stats.present / stats.total) * 100) + "%" : "0%"} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
                    <StatCard title="Barcode Scans" value={stats.barcode} icon={Barcode} color="bg-blue-50 text-blue-600" />
                    <StatCard title="Late Arrivals" value={stats.late} icon={Clock} color="bg-amber-50 text-amber-500" />
                    <StatCard title="Total Marked" value={stats.total} icon={Users} color="bg-purple-50 text-purple-600" />
                </div>
            )}

            {/* ── Attendance Log Table ──────────────────────────────────── */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center justify-between gap-4 flex-wrap">
                    <h3 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                            <Filter className="h-4 w-4" />
                        </div>
                        Live Attendance Log
                    </h3>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest bg-white py-2 px-4 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> {stats.present} Present</span>
                        <span className="text-amber-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {stats.late} Late</span>
                        <span className="text-red-500 flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> {stats.absent} Absent</span>
                    </div>
                </div>
                <div className="overflow-auto max-h-[500px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                                {["Student", "Time", "Status", "Method", "Actions"].map(h => (
                                    <th key={h} className={clsx("px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest", h === "Actions" && "text-right")}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sessionRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                <Info className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="font-bold text-gray-500 tracking-wide">
                                                {isSessionActive ? "Start scanning — records will appear here." : "Start a session to begin marking attendance."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sessionRecords.map(rec => (
                                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{rec.student.fullName}</p>
                                            <p className="text-[10px] font-mono text-gray-400">{rec.student.studentId}</p>
                                        </td>
                                        <td className="p-4 font-mono text-gray-500 text-xs whitespace-nowrap">{rec.time || "—"}</td>
                                        <td className="p-4"><StatusBadge status={rec.status} /></td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-150 w-fit">
                                                {rec.method === "BARCODE" ? <Barcode className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                {rec.method}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {isSessionActive && (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => markManual(rec.student.studentId, "PRESENT")} title="Mark Present" className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                                                    <button onClick={() => markManual(rec.student.studentId, "LATE")} title="Mark Late" className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"><Clock className="h-4 w-4" /></button>
                                                    <button onClick={() => markManual(rec.student.studentId, "ABSENT")} title="Mark Absent" className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ── Admin View ────────────────────────────────────────────────────────────────

function AdminAttendanceView() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState({
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0]
    });
    const [batch, setBatch] = useState("2026");
    const [centerFilter, setCenterFilter] = useState("ALL");

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:8080/api/attendance/batch/${batch}?start=${range.start}&end=${range.end}`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            if (res.ok) setRecords(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [batch, range]);

    const filtered = useMemo(() =>
        centerFilter === "ALL" ? records : records.filter(r => r.center === centerFilter),
        [records, centerFilter]
    );

    const stats = useMemo(() => ({
        present: filtered.filter(r => r.status === "PRESENT").length,
        late: filtered.filter(r => r.status === "LATE").length,
        absent: filtered.filter(r => r.status === "ABSENT").length,
        total: filtered.length,
    }), [filtered]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Panel */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            Attendance Analytics
                        </h1>
                        <p className="text-sm text-gray-400 mt-2 font-medium ml-13 border-l-2 border-emerald-100 pl-3">Overview of all recorded attendance sessions.</p>
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-3 text-sm font-black tracking-widest uppercase text-gray-500 hover:text-emerald-700 border-2 border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 px-6 py-3.5 rounded-2xl transition-all shadow-sm">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-200 px-5 py-3.5 rounded-2xl shadow-inner focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch</span>
                        <select value={batch} onChange={e => setBatch(e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer">
                            <option>2024</option><option>2025</option><option>2026</option><option>2027</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-200 px-5 py-3.5 rounded-2xl shadow-inner focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer">
                            <option value="ALL">All Centers</option>
                            <option>KOKUVIL</option><option>MALLAKAM</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-200 px-5 py-3.5 rounded-2xl shadow-inner focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <input type="date" value={range.start} onChange={e => setRange({ ...range, start: e.target.value })} className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer" />
                        <span className="text-gray-300 font-bold mx-1">→</span>
                        <input type="date" value={range.end} onChange={e => setRange({ ...range, end: e.target.value })} className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer" />
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100">
                    <StatCard title="Attendance Rate" value={stats.total > 0 ? Math.round((stats.present / stats.total) * 100) + "%" : "0%"} icon={PieChart} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                    <StatCard title="Present" sub="Today" value={stats.present} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                    <StatCard title="Late" sub="Arrivals" value={stats.late} icon={Clock} color="bg-amber-50 text-amber-500 border border-amber-100" />
                    <StatCard title="Absent" value={stats.absent} icon={AlertCircle} color="bg-red-50 text-red-500 border border-red-100" />
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                            <Filter className="h-4 w-4" />
                        </div>
                        Detailed Log
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">{filtered.length} records</span>
                </div>
                <div className="overflow-auto max-h-[580px]">
                    {loading ? (
                        <div className="py-24 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    {["Date", "Student", "Center", "Status", "Time", "Method", "Staff"].map(h => (
                                        <th key={h} className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold">No records found for this range.</td></tr>
                                ) : (
                                    filtered.map(r => (
                                        <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-8 py-4 font-bold text-xs text-gray-700">{r.date}</td>
                                            <td className="px-8 py-4">
                                                <p className="font-bold text-gray-900">{r.student.fullName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-wider">{r.student.studentId}</p>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-gray-500">{r.center || "—"}</td>
                                            <td className="px-8 py-4"><StatusBadge status={r.status} /></td>
                                            <td className="px-8 py-4 font-mono text-xs text-gray-500">{r.time || "—"}</td>
                                            <td className="px-8 py-4 text-xs font-bold text-gray-500">{r.method}</td>
                                            <td className="px-8 py-4 text-xs text-gray-500">{r.markedBy?.fullName || "System"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Student View ──────────────────────────────────────────────────────────────

function StudentAttendanceView({ userId }: { userId: string }) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:8080/api/attendance/student/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setRecords(await res.json());
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        if (userId) fetch_();
    }, [userId]);

    const stats = useMemo(() => {
        const present = records.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
        const absent = records.filter(r => r.status === "ABSENT").length;
        const late = records.filter(r => r.status === "LATE").length;
        const total = records.length;
        return { present, absent, late, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
    }, [records]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Summary Hero */}
            <div className="bg-emerald-950 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700"><CheckCircle2 className="h-72 w-72" /></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div>
                        <h2 className="text-4xl font-black mb-3 text-emerald-50 tracking-tight">My Attendance</h2>
                        <p className="text-emerald-400 font-bold text-sm tracking-wide">Consistency drives success 🚀</p>
                    </div>
                    <div className="flex items-center gap-10 bg-emerald-900/50 p-6 rounded-[2rem] border border-emerald-800/50 backdrop-blur-sm">
                        <div className="h-28 w-28 rounded-full border-8 border-emerald-500/30 bg-emerald-800/50 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-4xl font-black text-white">{stats.pct}%</span>
                            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest mt-1">Rate</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-bold text-emerald-50"><div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> {stats.present} Attended</div>
                            <div className="flex items-center gap-3 text-sm font-bold text-emerald-50"><div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> {stats.late} Late</div>
                            <div className="flex items-center gap-3 text-sm font-bold text-emerald-50"><div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> {stats.absent} Absent</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning banner if below 75% */}
            {stats.total > 0 && stats.pct < 75 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-[1.5rem] p-6 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-red-800 text-lg">Attendance Below 75%</p>
                        <p className="text-sm text-red-600 font-medium mt-1 leading-relaxed">Please contact your tutor. Consistent attendance is mandatory to sit examinations.</p>
                    </div>
                </div>
            )}

            {/* History */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
                    <h3 className="font-black text-gray-900 text-lg flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                            <Calendar className="h-4 w-4" />
                        </div>
                        Attendance History
                    </h3>
                </div>
                {loading ? (
                    <div className="py-24 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
                ) : records.length === 0 ? (
                    <div className="py-24 text-center">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <span className="text-gray-400 font-bold block">No attendance records found.</span>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50/80 p-4">
                        {records.slice(0, 50).map(r => (
                            <div key={r.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={clsx(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center border",
                                        r.status === "PRESENT" ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm"
                                            : r.status === "LATE" ? "bg-amber-50 border-amber-100 text-amber-600 shadow-sm"
                                                : "bg-red-50 border-red-100 text-red-600 shadow-sm"
                                    )}>
                                        {r.status === "PRESENT" ? <Check className="h-5 w-5" /> : r.status === "LATE" ? <Clock className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-base">{r.date}</p>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                            {r.time ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span> : ""}
                                            {r.time && <span className="opacity-50">•</span>}
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.center || "—"}</span>
                                            <span className="opacity-50">•</span>
                                            <span className="flex items-center gap-1"><ZapIcon className="h-3 w-3" />{r.method}</span>
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={r.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Page Entry ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
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
                {role === "STUDENT" ? (
                    <StudentAttendanceView userId={userId} />
                ) : role === "SUPER_ADMIN" ? (
                    <AdminAttendanceView />
                ) : (
                    <StaffAttendanceView userId={userId} />
                )}
            </div>
        </AdminLayout>
    );
}
