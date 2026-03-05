"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Calendar, AlertTriangle, CheckCircle2, XCircle, Shield, Layers, User2, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

type DashboardStats = {
    totalStudents?: number;
    totalStaff?: number;
    totalBatches?: number;
    totalBoys?: number;
    totalGirls?: number;
    todaysAttendance?: number; // backward compatible
    todayPresent?: number;
    todayAbsent?: number;
    overallAttendancePct?: number;
    feesPaidCount?: number;
    feesPendingCount?: number;
    pendingFees?: number; // backward compatible
    assignedStudents?: number; // staff
    recentLogs?: Array<{
        at?: string;
        actor?: string;
        role?: string;
        action?: string;
        details?: string;
    }>;
    notifications?: Array<{
        level?: "info" | "warning" | "critical";
        title?: string;
        message?: string;
        at?: string;
    }>;
};

export default function Dashboard() {
    const [userRole, setUserRole] = useState<Role>("SUPER_ADMIN");
    const [username, setUsername] = useState<string | null>(null);
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:8080/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                        return null;
                    }
                    throw new Error("Failed");
                }
                return res.json();
            })
            .then(data => { if (data) setStats(data); })
            .catch(err => console.error("Dashboard Fetch Error:", err));

        const storedRole = localStorage.getItem("userRole");
        const storedName = localStorage.getItem("name");
        const storedUser = localStorage.getItem("username");
        if (storedRole) setUserRole(storedRole as any);
        if (storedName) setUsername(storedName);
        else if (storedUser) setUsername(storedUser);

        const pwdChange = localStorage.getItem("requirePasswordChange");
        if (pwdChange === "true") setRequirePasswordChange(true);
    }, []);

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isStaff = userRole === "STAFF";
    const todayPresent = stats.todayPresent ?? stats.todaysAttendance ?? 0;
    const todayAbsent = stats.todayAbsent ?? 0;
    const overallAttendancePct = stats.overallAttendancePct ?? 0;
    const feePaid = stats.feesPaidCount ?? 0;
    const feePending = stats.feesPendingCount ?? stats.pendingFees ?? 0;
    const recentLogs = stats.recentLogs ?? [];

    const staffAssigned = stats.assignedStudents ?? 0;
    const staffAttendanceToday = stats.todaysAttendance ?? stats.todayPresent ?? 0;
    const staffNotMarkedToday = Math.max(0, staffAssigned - staffAttendanceToday);
    const staffPendingFees = stats.pendingFees ?? 0;

    return (
        <AdminLayout userRole={userRole}>
            {/* Password Change Warning */}
            {requirePasswordChange && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-bold">Password Change Required</h3>
                        <p className="text-red-700 text-sm mt-1">
                            Please change your password before continuing.{" "}
                            <Link href="/settings" className="underline font-bold">Go to Profile →</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Super Admin: Overview Banner */}
            {isSuperAdmin && (
                <div className="mb-6 p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-2xl text-white relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-20 -translate-y-20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300 rounded-full -translate-x-10 translate-y-10 blur-2xl" />
                    </div>
                    <div className="relative z-10 flex items-start justify-between gap-6">
                        <div>
                            <p className="text-emerald-200 text-xs font-semibold tracking-[0.22em] uppercase">
                                Admin Dashboard
                            </p>
                            <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
                                System Monitoring
                            </h2>
                            <p className="text-emerald-100/80 text-sm mt-1">
                                Welcome back, {username || "Admin"} — Here is your system overview.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Super Admin: Summary Cards */}
            {isSuperAdmin && (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalStudents ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total Students</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                                <Shield className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalStaff ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Active Staff</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                <Layers className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalBatches ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total Batches</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                                <User2 className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalBoys ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total Boys</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
                                <User2 className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.totalGirls ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total Girls</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-emerald-50">
                                <Calendar className="h-5 w-5 text-emerald-700" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 mt-3">{todayPresent}</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Present Today</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-xl bg-red-50">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 mt-3">{todayAbsent}</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Absent Today</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-xl bg-emerald-50">
                                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 mt-3">{overallAttendancePct}%</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Attendance %</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-xl bg-emerald-50">
                                <AlertTriangle className="h-5 w-5 text-emerald-700" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 mt-3">{feePending}</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Pending Fees</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-xl bg-emerald-50">
                                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 mt-3">{feePaid}</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Paid Fees</p>
                    </div>
                </div>
            )}

            {/* Super Admin: Recent Activity Logs Preview */}
            {isSuperAdmin && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h3 className="text-sm font-extrabold text-gray-900">
                            Recent Activity Logs (Preview)
                        </h3>
                        <Link href="/activity-logs" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {recentLogs.length === 0 ? (
                            <div className="col-span-full p-4 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                No activity logs yet (backend can send `recentLogs`).
                            </div>
                        ) : (
                            recentLogs.slice(0, 6).map((log, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {log.action || "Activity"}
                                        </p>
                                        <span className="text-[11px] text-slate-500 shrink-0">
                                            {log.at || ""}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {(log.actor || "—")} {log.role ? `(${log.role})` : ""}{log.details ? ` • ${log.details}` : ""}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Non-super-admin fallback (kept simple for now) */}
            {isStaff && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full -translate-x-32 translate-y-32 blur-3xl opacity-30" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-emerald-300 text-[10px] font-black tracking-[0.3em] uppercase mb-3">
                                Staff Dashboard
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                                Daily Operations View
                            </h2>
                            <p className="text-emerald-100/80 text-sm mt-2 font-medium">
                                Welcome back, <span className="text-white font-bold">{username || "Staff"}</span> — Here are your tasks and stats for today.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-2xl bg-emerald-50 w-fit text-emerald-600 mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{staffAssigned}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Assigned Students</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-2xl bg-teal-50 w-fit text-teal-600 mb-4">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{staffAttendanceToday}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Attendance Today</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-2xl bg-amber-50 w-fit text-amber-600 mb-4">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{staffNotMarkedToday}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Not Marked Today</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-2xl bg-rose-50 w-fit text-rose-600 mb-4">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{staffPendingFees}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Pending Fees</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-2xl bg-blue-50 w-fit text-blue-600 mb-4">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{Math.max(0, staffAssigned - staffPendingFees)}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Paid (Approx.)</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mt-8">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Activity (Preview)</h3>
                            <Link href="/notifications" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors">
                                View All Notifications
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {recentLogs.length === 0 ? (
                                <div className="col-span-full p-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium text-center">
                                    No recent activity logs available.
                                </div>
                            ) : (
                                recentLogs.slice(0, 6).map((log, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {log.action || "Activity"}
                                            </p>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                                {log.at || ""}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">
                                            {log.details || "—"}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!isSuperAdmin && !isStaff && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Dashboard Restricted</h2>
                    <p className="text-sm text-gray-500 font-medium mt-2 max-w-sm">
                        You do not have permission to view the administrative dashboards. Please use the sidebar to access your modules.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
