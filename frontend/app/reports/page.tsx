"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    BarChart3,
    Users,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Loader2,
    RefreshCw,
    BookOpen,
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

interface ReportSummary {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    feePaidRecords: number;
    feePendingRecords: number;
    feeCompletionRate: number;
    attendanceTodayPresent: number;
    attendanceTodayAbsent: number;
}

interface Defaulter {
    studentId: string;
    name: string;
    center?: string;
    examBatch?: number;
    pendingCount: number;
    latestPendingMonth?: string;
}

interface TopPerformer {
    studentId: string;
    name: string;
    center?: string;
    examBatch?: number;
    averageScore: number;
    examsCount: number;
}

function MetricCard({ title, value, icon: Icon, tone }: {
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={clsx("p-3 rounded-xl border", toneClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-500">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 truncate">{value}</h3>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
    const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [summaryRes, defaultersRes, topRes] = await Promise.all([
                api.get("/reports/summary"),
                api.get("/reports/defaulters"),
                api.get("/reports/top-performers"),
            ]);
            const nextSummary = (summaryRes && typeof summaryRes === "object" && "data" in summaryRes
                ? (summaryRes as { data?: ReportSummary }).data
                : summaryRes) as ReportSummary | undefined;
            const nextDefaulters = (defaultersRes && typeof defaultersRes === "object" && "data" in defaultersRes
                ? (defaultersRes as { data?: Defaulter[] }).data
                : defaultersRes) as Defaulter[] | undefined;
            const nextTop = (topRes && typeof topRes === "object" && "data" in topRes
                ? (topRes as { data?: TopPerformer[] }).data
                : topRes) as TopPerformer[] | undefined;

            setSummary(nextSummary ?? null);
            setDefaulters(nextDefaulters ?? []);
            setTopPerformers(nextTop ?? []);
        } catch (err) {
            console.error("Failed to load reports", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const attendanceRate = useMemo(() => {
        if (!summary) return 0;
        const total = summary.attendanceTodayPresent + summary.attendanceTodayAbsent;
        if (total === 0) return 0;
        return Math.round((summary.attendanceTodayPresent * 100) / total);
    }, [summary]);

    return (
        <AdminLayout userRole="SUPER_ADMIN">
            <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-emerald-600 shrink-0" />
                        System Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Live operational insights for fees, attendance, and performance.</p>
                </div>
                <button
                    onClick={fetchAll}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold text-gray-700 self-start lg:self-auto"
                >
                    <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {loading && !summary ? (
                <div className="flex justify-center p-16">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-6">
                        <MetricCard title="Total Students" value={summary?.totalStudents ?? 0} icon={Users} tone="blue" />
                        <MetricCard title="Active Students" value={summary?.activeStudents ?? 0} icon={CheckCircle} tone="emerald" />
                        <MetricCard title="Inactive Students" value={summary?.inactiveStudents ?? 0} icon={AlertTriangle} tone="amber" />
                        <MetricCard title="Fee Paid Records" value={summary?.feePaidRecords ?? 0} icon={TrendingUp} tone="emerald" />
                        <MetricCard title="Fee Pending Records" value={summary?.feePendingRecords ?? 0} icon={AlertTriangle} tone="amber" />
                        <MetricCard
                            title="Attendance Today"
                            value={`${attendanceRate}%`}
                            icon={BarChart3}
                            tone="slate"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    Fee Defaulters
                                </h3>
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                                    {defaulters.length} records
                                </span>
                            </div>

                            {defaulters.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm border border-dashed border-gray-200 text-gray-400">
                                    No pending fee records found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                                                <th className="pb-3">Student</th>
                                                <th className="pb-3">Center</th>
                                                <th className="pb-3 text-right">Pending</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {defaulters.map((row) => (
                                                <tr key={row.studentId}>
                                                    <td className="py-3">
                                                        <p className="font-bold text-gray-900">{row.name}</p>
                                                        <p className="text-xs text-gray-500">{row.studentId} | Batch {row.examBatch ?? "-"}</p>
                                                    </td>
                                                    <td className="py-3 text-gray-600 font-medium">{row.center || "-"}</td>
                                                    <td className="py-3 text-right">
                                                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                                                            {row.pendingCount}
                                                        </span>
                                                        <p className="text-[11px] text-gray-400 mt-1">{row.latestPendingMonth || "-"}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-gray-900 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Top Performers
                                </h3>
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                                    {topPerformers.length} records
                                </span>
                            </div>

                            {topPerformers.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm border border-dashed border-gray-200 text-gray-400">
                                    No marks data available for ranking.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                                                <th className="pb-3">Student</th>
                                                <th className="pb-3">Center</th>
                                                <th className="pb-3 text-right">Average</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {topPerformers.map((row) => (
                                                <tr key={row.studentId}>
                                                    <td className="py-3">
                                                        <p className="font-bold text-gray-900">{row.name}</p>
                                                        <p className="text-xs text-gray-500">{row.studentId} | Batch {row.examBatch ?? "-"}</p>
                                                    </td>
                                                    <td className="py-3 text-gray-600 font-medium">{row.center || "-"}</td>
                                                    <td className="py-3 text-right">
                                                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            {row.averageScore.toFixed(2)}
                                                        </span>
                                                        <p className="text-[11px] text-gray-400 mt-1">{row.examsCount} exams</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

