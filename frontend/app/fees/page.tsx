"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    AlertCircle,
    Barcode,
    CheckCircle2,
    Clock,
    CreditCard,
    Loader2,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import api from "@/lib/axios";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    center?: string;
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

const normalizeFeeRecord = (raw: any): FeeRecord => ({
    id: raw?.id,
    student: raw?.student ?? {
        studentId: raw?.studentId ?? "",
        fullName: raw?.studentName ?? "-",
    },
    month: raw?.month,
    academicYear: raw?.academicYear,
    status: raw?.status,
    updateMethod: raw?.updateMethod,
    updatedBy: raw?.updatedBy ?? (raw?.updatedById ? { fullName: `ID ${raw.updatedById}` } : undefined),
    updatedAt: raw?.updatedAt,
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

function StatusBadge({ status }: { status: "PAID" | "PENDING" }) {
    const cls =
        status === "PAID"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-50 text-amber-700 border-amber-200";
    return <span className={clsx("inline-flex px-2.5 py-1 rounded-full text-xs font-bold border", cls)}>{status}</span>;
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

function StaffFeesView({ staffId }: { staffId: string }) {
    const { toast } = useToast();
    const staffIdNum = Number(staffId);

    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [batchOptions, setBatchOptions] = useState<string[]>([]);
    const [yearOptions, setYearOptions] = useState<string[]>([]);

    const [batch, setBatch] = useState("");
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
    const [year, setYear] = useState(String(new Date().getFullYear()));

    const [barcodeValue, setBarcodeValue] = useState("");
    const [fees, setFees] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const ensureStaffId = () => {
        if (!Number.isFinite(staffIdNum)) {
            toast("error", "Invalid staff session. Please log in again.");
            return false;
        }
        return true;
    };

    const loadStudents = async () => {
        try {
            const res = await api.get("/students");
            const list = unwrapData<Student[]>(res).filter((s: Student) => Boolean(s?.studentId));
            setAllStudents(list);

            const batches = Array.from(
                new Set(list.map((s) => s.examBatch?.toString()).filter(Boolean) as string[])
            ).sort();
            setBatchOptions(batches);
            if (!batch) setBatch(batches[0] || String(new Date().getFullYear()));

            const currentYear = new Date().getFullYear();
            const years = Array.from(new Set([
                ...batches,
                String(currentYear - 1),
                String(currentYear),
                String(currentYear + 1),
            ])).sort();
            setYearOptions(years);
            if (!years.includes(year)) setYear(String(currentYear));
        } catch (e) {
            console.error(e);
            toast("error", "Failed to load students.");
        }
    };

    const loadBatchFees = async (selectedBatch: string, selectedMonth: string, selectedYear: string) => {
        if (!selectedBatch || !selectedYear) return;
        setLoading(true);
        try {
            const res = await api.get(`/fees/batch/${selectedBatch}?month=${selectedMonth}&academicYear=${selectedYear}`);
            setFees(unwrapData<any[]>(res).map(normalizeFeeRecord));
        } catch (e) {
            console.error(e);
            toast("error", "Failed to load fee records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        if (batch) loadBatchFees(batch, month, year);
    }, [batch, month, year]);

    const batchStudents = useMemo(
        () => allStudents.filter((s) => s.examBatch?.toString() === batch),
        [allStudents, batch]
    );

    const feeMap = useMemo(() => {
        const map: Record<string, FeeRecord> = {};
        fees.forEach((f) => {
            if (f.student?.studentId) map[f.student.studentId] = f;
        });
        return map;
    }, [fees]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return batchStudents.filter(
            (s) => s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [searchQuery, batchStudents]);

    const stats = useMemo(() => {
        const total = batchStudents.length;
        const paid = Object.values(feeMap).filter((f) => f.status === "PAID").length;
        const pending = Math.max(0, total - paid);
        const completion = total === 0 ? 0 : Math.round((paid * 100) / total);
        return { total, paid, pending, completion };
    }, [batchStudents, feeMap]);

    const upsertFee = (record: FeeRecord) => {
        setFees((prev) => [record, ...prev.filter((f) => f.student?.studentId !== record.student?.studentId)]);
    };

    const scanBarcode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeValue.trim() || !ensureStaffId()) return;
        setLoading(true);
        try {
            const res = await api.post("/fees/scan", {
                barcode: barcodeValue.trim(),
                month,
                academicYear: year,
                staffId: staffIdNum,
            });
            const record = normalizeFeeRecord(unwrapData<any>(res));
            upsertFee(record);
            toast("success", `${record.student?.fullName || "Student"} marked PAID`);
            setBarcodeValue("");
        } catch (err: unknown) {
            toast("error", getErrorMessage(err, "Barcode scan failed."));
        } finally {
            setLoading(false);
        }
    };

    const markManual = async (studentId: string, status: "PAID" | "PENDING") => {
        if (!ensureStaffId()) return;
        setLoading(true);
        try {
            const res = await api.post("/fees/manual", {
                studentId,
                month,
                academicYear: year,
                status,
                staffId: staffIdNum,
            });
            const record = normalizeFeeRecord(unwrapData<any>(res));
            upsertFee(record);
            toast("success", `${record.student?.fullName || "Student"} marked ${status}`);
            setSearchQuery("");
        } catch (err: unknown) {
            toast("error", getErrorMessage(err, "Failed to update fee status."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-emerald-700" />
                    Fee Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Scan barcode, search students, and update monthly fee status.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white">
                        {MONTHS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white">
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select value={batch} onChange={(e) => setBatch(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white">
                        {batchOptions.map((b) => (
                            <option key={b} value={b}>Batch {b}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Completion" value={`${stats.completion}%`} icon={TrendingUp} tone="emerald" />
                <StatCard title="Paid" value={stats.paid} icon={CheckCircle2} tone="blue" />
                <StatCard title="Pending" value={stats.pending} icon={AlertCircle} tone="amber" />
                <StatCard title="Students" value={stats.total} icon={Users} tone="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-emerald-950 rounded-[2rem] p-6 text-white">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Barcode className="h-5 w-5" />
                        Barcode Scan
                    </h2>
                    <p className="text-sm text-emerald-200 mt-1">Scan card to mark selected month as PAID.</p>
                    <form onSubmit={scanBarcode} className="mt-4 relative">
                        <input
                            value={barcodeValue}
                            onChange={(e) => setBarcodeValue(e.target.value)}
                            placeholder="Scan barcode or type student ID"
                            className="w-full px-4 py-4 rounded-xl text-gray-900 font-semibold"
                        />
                        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-700 animate-spin" />}
                    </form>
                </section>

                <section className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-600" />
                        Manual Update
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Search student and set status manually.</p>
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
                        {searchResults.map((s) => {
                            const rec = feeMap[s.studentId];
                            return (
                                <div key={s.studentId} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{s.fullName}</p>
                                        <p className="text-xs text-gray-500">{s.studentId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {rec ? <StatusBadge status={rec.status} /> : null}
                                        <button onClick={() => markManual(s.studentId, "PAID")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">PAID</button>
                                        <button onClick={() => markManual(s.studentId, "PENDING")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100">PENDING</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Batch Fee Status</h3>
                    <span className="text-xs font-bold text-gray-500">{batchStudents.length} students</span>
                </div>
                <div className="overflow-auto max-h-[560px]">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                {["Student", "ID", "Status", "Updated By", "Actions"].map((h) => (
                                    <th key={h} className={clsx("px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider", h === "Actions" && "text-right")}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && fees.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600 inline" /></td></tr>
                            ) : batchStudents.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">No students found for selected batch.</td></tr>
                            ) : (
                                batchStudents.map((s) => {
                                    const rec = feeMap[s.studentId];
                                    return (
                                        <tr key={s.studentId}>
                                            <td className="px-6 py-3 font-bold text-gray-900">{s.fullName}</td>
                                            <td className="px-6 py-3 text-gray-600 font-mono">{s.studentId}</td>
                                            <td className="px-6 py-3">{rec ? <StatusBadge status={rec.status} /> : <span className="text-xs text-gray-400">No record</span>}</td>
                                            <td className="px-6 py-3 text-gray-500">{rec?.updatedBy?.fullName || "-"}</td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="inline-flex gap-2">
                                                    <button onClick={() => markManual(s.studentId, "PAID")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">PAID</button>
                                                    <button onClick={() => markManual(s.studentId, "PENDING")} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100">PENDING</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function AdminFeesView() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(String(currentYear));
    const [summary, setSummary] = useState<Record<string, number> | null>(null);
    const [records, setRecords] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const yearOptions = useMemo(
        () => [String(currentYear - 2), String(currentYear - 1), String(currentYear), String(currentYear + 1)],
        [currentYear]
    );

    const load = async () => {
        setLoading(true);
        try {
            const [summaryRes, recordsRes] = await Promise.all([
                api.get(`/fees/admin/summary?academicYear=${year}`),
                api.get(`/fees/admin/all?academicYear=${year}`),
            ]);
            setSummary(unwrapData<Record<string, number>>(summaryRes));
            setRecords(unwrapData<any[]>(recordsRes).map(normalizeFeeRecord));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [year]);

    const grouped = useMemo(() => {
        const map: Record<string, FeeRecord[]> = {};
        records.forEach((r) => {
            const b = r.student?.examBatch?.toString() || "Unknown";
            if (!map[b]) map[b] = [];
            map[b].push(r);
        });
        return map;
    }, [records]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Fee Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">View annual fee records and batch performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white">
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button onClick={load} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50">
                        <RefreshCw className={clsx("h-4 w-4 inline mr-2", loading && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Completion" value={`${summary.completionPercentage ?? 0}%`} icon={TrendingUp} tone="emerald" />
                    <StatCard title="Total Records" value={summary.totalRecords ?? 0} icon={Users} tone="slate" />
                    <StatCard title="Paid" value={summary.paid ?? 0} icon={CheckCircle2} tone="blue" />
                    <StatCard title="Pending" value={summary.pending ?? 0} icon={AlertCircle} tone="amber" />
                </div>
            )}

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Batch Breakdown</h3>
                    <span className="text-xs text-gray-500 font-bold">{Object.keys(grouped).length} batches</span>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600 inline" /></div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="py-20 text-center text-gray-400">No fee records available for this year.</div>
                ) : (
                    Object.entries(grouped).map(([batchKey, recs]) => {
                        const paid = recs.filter((r) => r.status === "PAID").length;
                        const pct = recs.length === 0 ? 0 : Math.round((paid * 100) / recs.length);
                        return (
                            <div key={batchKey} className="border-b border-gray-100 last:border-0">
                                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-gray-900">Batch {batchKey}</p>
                                        <p className="text-xs text-gray-500 mt-1">{paid} paid / {recs.length} records</p>
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{pct}%</span>
                                </div>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm whitespace-nowrap">
                                        <thead className="bg-white sticky top-0">
                                            <tr>
                                                {["Student", "Month", "Status", "Method", "Updated By"].map((h) => (
                                                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recs.map((r) => (
                                                <tr key={r.id}>
                                                    <td className="px-6 py-3 font-bold text-gray-900">{r.student?.fullName || "-"}</td>
                                                    <td className="px-6 py-3 text-gray-600">{r.month}</td>
                                                    <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                                                    <td className="px-6 py-3 text-gray-600">{r.updateMethod || "-"}</td>
                                                    <td className="px-6 py-3 text-gray-600">{r.updatedBy?.fullName || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}

function StudentFeesView() {
    const [records, setRecords] = useState<FeeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/student-dashboard/fees");
                setRecords(unwrapData<any[]>(res).map(normalizeFeeRecord));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const paid = records.filter((r) => r.status === "PAID").length;
        const pending = records.length - paid;
        return { paid, pending, total: records.length };
    }, [records]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-emerald-950 rounded-[2rem] p-8 text-white">
                <h2 className="text-3xl font-black">My Fee Status</h2>
                <p className="text-sm text-emerald-200 mt-1">Current fee summary and payment history.</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <StatCard title="Paid" value={stats.paid} icon={CheckCircle2} tone="emerald" />
                    <StatCard title="Pending" value={stats.pending} icon={Clock} tone="amber" />
                    <StatCard title="Total" value={stats.total} icon={Users} tone="slate" />
                </div>
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900">Fee History</h3>
                </div>
                {loading ? (
                    <div className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600 inline" /></div>
                ) : records.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">No fee records found.</div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Month", "Year", "Status", "Updated By", "Updated At"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-3 font-bold text-gray-900">{r.month}</td>
                                        <td className="px-6 py-3 text-gray-600">{r.academicYear}</td>
                                        <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                                        <td className="px-6 py-3 text-gray-600">{r.updatedBy?.fullName || "System"}</td>
                                        <td className="px-6 py-3 text-gray-600">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("en-GB") : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function FeesPage() {
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
                    <StudentFeesView />
                ) : role === "SUPER_ADMIN" ? (
                    <AdminFeesView />
                ) : (
                    <StaffFeesView staffId={userId} />
                )}
            </div>
        </AdminLayout>
    );
}
