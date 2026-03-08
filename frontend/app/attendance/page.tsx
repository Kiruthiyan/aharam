"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    Barcode,
    Check,
    CheckCircle2,
    Clock,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Shield,
    Users,
    X,
} from "lucide-react";
import type { ComponentType } from "react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import api from "@/lib/axios";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    center?: string;
}

interface AttendanceRecord {
    id: number;
    student: Student;
    date: string;
    time?: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    method: "BARCODE" | "MANUAL";
    markedBy?: { fullName: string; id: number };
    center?: string;
}

const normalizeAttendanceRecord = (raw: any): AttendanceRecord => ({
    id: raw?.id,
    student: {
        studentId: raw?.student?.studentId ?? raw?.studentId ?? "",
        fullName: raw?.student?.fullName ?? raw?.studentName ?? "-",
        examBatch: raw?.student?.examBatch,
        center: raw?.student?.center ?? raw?.center,
    },
    date: raw?.date,
    time: raw?.time,
    status: raw?.status,
    method: raw?.method,
    markedBy: raw?.markedBy ?? (raw?.markedById ? { fullName: `ID ${raw.markedById}`, id: raw.markedById } : undefined),
    center: raw?.center,
});

const unwrapData = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === "object" && "message" in err) {
        const maybe = (err as { message?: unknown }).message;
        if (typeof maybe === "string" && maybe.trim()) return maybe;
    }
    return fallback;
};

function StatusBadge({ status }: { status: "PRESENT" | "ABSENT" | "LATE" }) {
    const style =
        status === "PRESENT"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : status === "LATE"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200";
    return (
        <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border", style)}>
            {status}
        </span>
    );
}

function StatCard({ title, value, icon: Icon, tone }: {
    title: string;
    value: string | number;
    icon: ComponentType<{ className?: string }>;
    tone: "emerald" | "blue" | "amber" | "slate";
}) {
    const toneClass = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        slate: "bg-slate-50 text-slate-700 border-slate-100",
    }[tone];

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className={clsx("inline-flex p-2.5 rounded-xl border", toneClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-gray-900 mt-3">{value}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{title}</p>
        </div>
    );
}

function StaffAttendanceView({ userId }: { userId: string }) {
    const { toast } = useToast();
    const barcodeRef = useRef<HTMLInputElement>(null);

    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [centers, setCenters] = useState<string[]>([]);

    const [batch, setBatch] = useState("");
    const [center, setCenter] = useState("");
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
    const [sessionActive, setSessionActive] = useState(false);

    const [barcodeValue, setBarcodeValue] = useState("");
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const staffIdNum = Number(userId);

    const loadStudents = async () => {
        try {
            const res = await api.get("/students");
            const all = unwrapData<Student[]>(res).filter((s: Student) => Boolean(s?.studentId));
            setStudents(all);

            const derivedBatches = Array.from(
                new Set(all.map((s) => s.examBatch?.toString()).filter(Boolean) as string[])
            ).sort();
            const derivedCenters = Array.from(
                new Set(all.map((s) => s.center).filter((c): c is string => Boolean(c && c.trim())))
            ).sort();

            setBatches(derivedBatches);
            setCenters(derivedCenters);
            if (!batch) setBatch(derivedBatches[0] || String(new Date().getFullYear()));
            if (!center) setCenter(derivedCenters[0] || "");
        } catch (e) {
            console.error(e);
            toast("error", "Failed to load students.");
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        if (sessionActive) barcodeRef.current?.focus();
    }, [sessionActive]);

    const filteredStudents = useMemo(
        () =>
            students.filter(
                (s) =>
                    (!batch || s.examBatch?.toString() === batch) &&
                    (!center || s.center === center)
            ),
        [students, batch, center]
    );

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return filteredStudents
            .filter(
                (s) =>
                    s.fullName.toLowerCase().includes(q) ||
                    s.studentId.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [searchQuery, filteredStudents]);

    const ensureStaffId = () => {
        if (!Number.isFinite(staffIdNum)) {
            toast("error", "Invalid staff session. Please log in again.");
            return false;
        }
        return true;
    };

    const upsertRecord = (rec: AttendanceRecord) => {
        setRecords((prev) => [rec, ...prev.filter((r) => r.student.studentId !== rec.student.studentId)]);
    };

    const startSession = () => {
        setSessionActive(true);
        setRecords([]);
        setSearchQuery("");
    };

    const scanBarcode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionActive || !barcodeValue.trim() || !ensureStaffId()) return;
        setLoading(true);
        try {
            const res = await api.post("/attendance/scan", {
                barcode: barcodeValue.trim(),
                staffId: staffIdNum,
                batch,
                center,
            });
            const rec = normalizeAttendanceRecord(unwrapData<any>(res));
            upsertRecord(rec);
            toast("success", `${rec.student.fullName} marked PRESENT`);
            setBarcodeValue("");
        } catch (err: unknown) {
            toast("error", getErrorMessage(err, "Barcode not recognized."));
        } finally {
            setLoading(false);
            barcodeRef.current?.focus();
        }
    };

    const markManual = async (studentId: string, status: "PRESENT" | "LATE" | "ABSENT") => {
        if (!ensureStaffId()) return;
        setLoading(true);
        try {
            const res = await api.post("/attendance/mark-manual", {
                studentId,
                status,
                staffId: staffIdNum,
                date: targetDate,
            });
            const rec = normalizeAttendanceRecord(unwrapData<any>(res));
            upsertRecord(rec);
            toast("success", `${rec.student.fullName} marked ${status}`);
            setSearchQuery("");
        } catch (err: unknown) {
            toast("error", getErrorMessage(err, "Failed to mark attendance."));
        } finally {
            setLoading(false);
        }
    };

    const endSession = async () => {
        if (!ensureStaffId()) return;
        setLoading(true);
        try {
            await api.post("/attendance/end-session", {
                batch,
                date: targetDate,
                staffId: staffIdNum,
            });
            setSessionActive(false);
            toast("info", "Session ended. Remaining students marked absent.");
        } catch (err: unknown) {
            toast("error", getErrorMessage(err, "Failed to end session."));
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const present = records.filter((r) => r.status === "PRESENT").length;
        const late = records.filter((r) => r.status === "LATE").length;
        const absent = records.filter((r) => r.status === "ABSENT").length;
        const total = records.length;
        return { present, late, absent, total };
    }, [records]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Shield className="h-6 w-6 text-emerald-700" />
                            Attendance Session
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure session and mark attendance using barcode or manual search.
                        </p>
                    </div>
                    {!sessionActive ? (
                        <button
                            onClick={startSession}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm"
                        >
                            Start Session
                        </button>
                    ) : (
                        <button
                            onClick={endSession}
                            disabled={loading}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-3 rounded-xl font-bold text-sm"
                        >
                            End Session
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Center</label>
                        <select
                            disabled={sessionActive}
                            value={center}
                            onChange={(e) => setCenter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
                        >
                            {centers.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batch</label>
                        <select
                            disabled={sessionActive}
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
                        >
                            {batches.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                        <input
                            disabled={sessionActive}
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
                        />
                    </div>
                </div>
            </div>

            {sessionActive && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-emerald-950 rounded-[2rem] p-6 text-white">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <Barcode className="h-5 w-5" />
                            Barcode Scanner
                        </h2>
                        <p className="text-sm text-emerald-200 mt-1">Scan student card to mark PRESENT instantly.</p>
                        <form onSubmit={scanBarcode} className="mt-4 relative">
                            <input
                                ref={barcodeRef}
                                value={barcodeValue}
                                onChange={(e) => setBarcodeValue(e.target.value)}
                                placeholder="Scan barcode or type student ID"
                                className="w-full px-4 py-4 rounded-xl text-gray-900 font-semibold"
                            />
                            {loading && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-700 animate-spin" />
                            )}
                        </form>
                    </section>

                    <section className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-600" />
                            Manual Mark
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Search student and set attendance status manually.</p>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or student ID"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold"
                            />
                        </div>

                        <div className="mt-3 max-h-72 overflow-auto">
                            {searchQuery && searchResults.length === 0 && (
                                <p className="text-sm text-gray-400 py-4">No matching students.</p>
                            )}
                            {searchResults.map((s) => (
                                <div key={s.studentId} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{s.fullName}</p>
                                        <p className="text-xs text-gray-500">{s.studentId}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => markManual(s.studentId, "PRESENT")}
                                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            title="Present"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => markManual(s.studentId, "LATE")}
                                            className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                                            title="Late"
                                        >
                                            <Clock className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => markManual(s.studentId, "ABSENT")}
                                            className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                            title="Absent"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Present" value={stats.present} icon={CheckCircle2} tone="emerald" />
                <StatCard title="Late" value={stats.late} icon={Clock} tone="amber" />
                <StatCard title="Absent" value={stats.absent} icon={AlertCircle} tone="slate" />
                <StatCard title="Total Marked" value={stats.total} icon={Users} tone="blue" />
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Live Attendance Log</h3>
                    <span className="text-xs text-gray-500 font-bold">{records.length} records</span>
                </div>
                <div className="overflow-auto max-h-[520px]">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                {["Student", "Date", "Time", "Status", "Method"].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400">No attendance records in this session.</td>
                                </tr>
                            ) : (
                                records.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-3">
                                            <p className="font-bold text-gray-900">{r.student.fullName}</p>
                                            <p className="text-xs text-gray-500">{r.student.studentId}</p>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 font-medium">{r.date}</td>
                                        <td className="px-6 py-3 text-gray-600 font-mono">{r.time || "-"}</td>
                                        <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                                        <td className="px-6 py-3 text-gray-600 font-semibold">{r.method}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function AdminAttendanceView() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [allBatches, setAllBatches] = useState<string[]>([]);
    const [allCenters, setAllCenters] = useState<string[]>([]);
    const [batch, setBatch] = useState("");
    const [centerFilter, setCenterFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState({
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
    });

    const loadMeta = async () => {
        try {
            const res = await api.get("/students");
            const students = unwrapData<Student[]>(res);
            const batches = Array.from(
                new Set(students.map((s) => s.examBatch?.toString()).filter(Boolean) as string[])
            ).sort();
            const centers = Array.from(
                new Set(students.map((s) => s.center).filter((c): c is string => Boolean(c && c.trim())))
            ).sort();
            setAllBatches(batches);
            setAllCenters(centers);
            if (!batch) setBatch(batches[0] || String(new Date().getFullYear()));
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async (selectedBatch: string) => {
        if (!selectedBatch) return;
        setLoading(true);
        try {
            const res = await api.get(
                `/attendance/batch/${selectedBatch}?start=${range.start}&end=${range.end}`
            );
            setRecords(unwrapData<any[]>(res).map(normalizeAttendanceRecord));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeta();
    }, []);

    useEffect(() => {
        if (batch) fetchData(batch);
    }, [batch, range.start, range.end]);

    const filtered = useMemo(
        () => (centerFilter === "ALL" ? records : records.filter((r) => r.center === centerFilter)),
        [records, centerFilter]
    );

    const stats = useMemo(() => {
        const present = filtered.filter((r) => r.status === "PRESENT").length;
        const late = filtered.filter((r) => r.status === "LATE").length;
        const absent = filtered.filter((r) => r.status === "ABSENT").length;
        const total = filtered.length;
        const rate = total === 0 ? 0 : Math.round(((present + late) * 100) / total);
        return { present, late, absent, total, rate };
    }, [filtered]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Attendance Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Filter and review attendance records by date, batch, and center.</p>
                    </div>
                    <button
                        onClick={() => fetchData(batch)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                    >
                        {allBatches.map((b) => (
                            <option key={b} value={b}>Batch {b}</option>
                        ))}
                    </select>
                    <select
                        value={centerFilter}
                        onChange={(e) => setCenterFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                    >
                        <option value="ALL">All Centers</option>
                        {allCenters.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={range.start}
                        onChange={(e) => setRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                    />
                    <input
                        type="date"
                        value={range.end}
                        onChange={(e) => setRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Attendance Rate" value={`${stats.rate}%`} icon={CheckCircle2} tone="emerald" />
                <StatCard title="Present" value={stats.present} icon={CheckCircle2} tone="blue" />
                <StatCard title="Late" value={stats.late} icon={Clock} tone="amber" />
                <StatCard title="Absent" value={stats.absent} icon={AlertCircle} tone="slate" />
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Detailed Attendance Log</h3>
                    <span className="text-xs font-bold text-gray-500">{filtered.length} records</span>
                </div>
                <div className="overflow-auto max-h-[620px]">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {["Date", "Student", "Center", "Status", "Time", "Method", "Staff"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-gray-400">No attendance records found for this filter.</td>
                                    </tr>
                                ) : (
                                    filtered.map((r) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-3 text-gray-700 font-semibold">{r.date}</td>
                                            <td className="px-6 py-3">
                                                <p className="font-bold text-gray-900">{r.student.fullName}</p>
                                                <p className="text-xs text-gray-500">{r.student.studentId}</p>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {r.center || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                                            <td className="px-6 py-3 text-gray-600 font-mono">{r.time || "-"}</td>
                                            <td className="px-6 py-3 text-gray-600 font-semibold">{r.method}</td>
                                            <td className="px-6 py-3 text-gray-600">{r.markedBy?.fullName || "System"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}

function StudentAttendanceView() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/student-dashboard/attendance");
                setRecords(unwrapData<any[]>(res).map(normalizeAttendanceRecord));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
        const absent = records.filter((r) => r.status === "ABSENT").length;
        const late = records.filter((r) => r.status === "LATE").length;
        const total = records.length;
        const pct = total === 0 ? 0 : Math.round((present * 100) / total);
        return { present, absent, late, total, pct };
    }, [records]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-emerald-950 rounded-[2rem] p-8 text-white">
                <h2 className="text-3xl font-black">My Attendance</h2>
                <p className="text-sm text-emerald-200 mt-1">Attendance summary and history.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <StatCard title="Rate" value={`${stats.pct}%`} icon={CheckCircle2} tone="emerald" />
                    <StatCard title="Present" value={stats.present} icon={CheckCircle2} tone="blue" />
                    <StatCard title="Late" value={stats.late} icon={Clock} tone="amber" />
                    <StatCard title="Absent" value={stats.absent} icon={AlertCircle} tone="slate" />
                </div>
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900">Attendance History</h3>
                </div>
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">No attendance records found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {records.slice(0, 100).map((r) => (
                            <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-gray-900">{r.date}</p>
                                    <p className="text-xs text-gray-500">{r.time || "-"} | {r.method}</p>
                                </div>
                                <StatusBadge status={r.status} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function AttendancePage() {
    const [role] = useState<Role>(() => {
        if (typeof window === "undefined") return "STAFF";
        const stored = localStorage.getItem("userRole");
        return stored === "SUPER_ADMIN" || stored === "STAFF" || stored === "STUDENT" ? stored : "STAFF";
    });
    const [userId] = useState(() => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("userId") || "";
    });

    return (
        <AdminLayout userRole={role}>
            <div className="p-2 sm:p-4">
                {role === "STUDENT" ? (
                    <StudentAttendanceView />
                ) : role === "SUPER_ADMIN" ? (
                    <AdminAttendanceView />
                ) : (
                    <StaffAttendanceView userId={userId} />
                )}
            </div>
        </AdminLayout>
    );
}
