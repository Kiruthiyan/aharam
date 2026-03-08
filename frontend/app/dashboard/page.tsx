"use client";

import AdminLayout from "@/components/AdminLayout";
import {
    Users,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Shield,
    Layers,
    CreditCard,
    GraduationCap,
    Building2,
    ChevronRight,
    BookOpen,
    Bell,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import api from "@/lib/axios";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

type DashboardStats = {
    totalStudents?: number;
    totalStaff?: number;
    totalBatches?: number;
    totalCenters?: number;
    totalBoys?: number;
    totalGirls?: number;
    todaysAttendance?: number;
    todayPresent?: number;
    todayAbsent?: number;
    overallAttendancePct?: number;
    feesPaidCount?: number;
    feesPendingCount?: number;
    pendingFees?: number;
    assignedStudents?: number;
    recentLogs?: Array<{
        at?: string;
        actor?: string;
        role?: string;
        action?: string;
        details?: string;
    }>;
};

type StoredUserSnapshot = {
    role: Role;
    username: string | null;
    requirePasswordChange: boolean;
};

const DEFAULT_USER_SNAPSHOT: StoredUserSnapshot = {
    role: "SUPER_ADMIN",
    username: null,
    requirePasswordChange: false,
};

const getStoredRole = (storedRole: string | null): Role => {
    if (storedRole === "SUPER_ADMIN" || storedRole === "STAFF" || storedRole === "STUDENT") {
        return storedRole;
    }
    return "SUPER_ADMIN";
};

const readStoredUserSnapshot = (): StoredUserSnapshot => {
    if (typeof window === "undefined") {
        return DEFAULT_USER_SNAPSHOT;
    }

    return {
        role: getStoredRole(localStorage.getItem("userRole")),
        username: localStorage.getItem("name") || localStorage.getItem("username"),
        requirePasswordChange: localStorage.getItem("requirePasswordChange") === "true",
    };
};

function StatCard({ label, value, icon: Icon, tone }: {
    label: string;
    value: string | number;
    icon: ComponentType<{ className?: string }>;
    tone: "emerald" | "blue" | "amber" | "slate";
}) {
    const toneCls = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        slate: "bg-slate-50 text-slate-700 border-slate-100",
    }[tone];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`inline-flex p-2.5 rounded-xl border ${toneCls}`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-gray-900 mt-3">{value}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}

export default function Dashboard() {
    const [userSnapshot, setUserSnapshot] = useState<StoredUserSnapshot>(DEFAULT_USER_SNAPSHOT);
    const userRole = userSnapshot.role;
    const username = userSnapshot.username;
    const requirePasswordChange = userSnapshot.requirePasswordChange;
    const [stats, setStats] = useState<DashboardStats>({});

    useEffect(() => {
        const syncUserSnapshot = () => {
            const nextSnapshot = readStoredUserSnapshot();
            setUserSnapshot((prevSnapshot) => {
                if (
                    prevSnapshot.role === nextSnapshot.role
                    && prevSnapshot.username === nextSnapshot.username
                    && prevSnapshot.requirePasswordChange === nextSnapshot.requirePasswordChange
                ) {
                    return prevSnapshot;
                }
                return nextSnapshot;
            });
        };

        syncUserSnapshot();
        window.addEventListener("storage", syncUserSnapshot);
        return () => window.removeEventListener("storage", syncUserSnapshot);
    }, []);

    useEffect(() => {
        api.get("/dashboard/stats")
            .then((res: unknown) => {
                const data = (res && typeof res === "object" && "data" in res
                    ? (res as { data?: DashboardStats }).data
                    : res) as DashboardStats | undefined;
                if (data) setStats(data);
            })
            .catch((err) => console.error("Dashboard fetch error:", err));
    }, []);

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isStaff = userRole === "STAFF";

    const todayPresent = stats.todayPresent ?? stats.todaysAttendance ?? 0;
    const todayAbsent = stats.todayAbsent ?? 0;
    const feePending = stats.feesPendingCount ?? stats.pendingFees ?? 0;
    const overallAttendancePct = stats.overallAttendancePct ?? 0;
    const recentLogs = stats.recentLogs ?? [];

    const staffAssigned = stats.assignedStudents ?? 0;
    const staffAttendanceToday = stats.todaysAttendance ?? stats.todayPresent ?? 0;
    const staffNotMarkedToday = Math.max(0, staffAssigned - staffAttendanceToday);
    const staffPendingFees = stats.pendingFees ?? feePending;

    const now = useMemo(() => new Date(), []);
    const greeting = useMemo(() => {
        const hour = now.getHours();
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        return "Evening";
    }, [now]);
    const longDateLabel = useMemo(
        () =>
            now.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        [now]
    );

    return (
        <AdminLayout userRole={userRole}>
            {requirePasswordChange && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-bold">Password Change Required</h3>
                        <p className="text-red-700 text-sm mt-1">
                            Please change your password before continuing.{" "}
                            <Link href="/settings" className="underline font-bold">Go to Profile &gt;</Link>
                        </p>
                    </div>
                </div>
            )}

            {isSuperAdmin && (
                <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-[2rem] text-white shadow-xl">
                        <p className="text-emerald-200 text-xs font-bold uppercase tracking-[0.22em]">Super Admin Dashboard</p>
                        <h2 className="text-2xl font-black mt-2" suppressHydrationWarning>
                            Welcome back, {username || "Admin"}
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-1" suppressHydrationWarning>
                            {longDateLabel}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {[
                                { label: "Staff", href: "/staff" },
                                { label: "Reports", href: "/reports" },
                                { label: "Activity Logs", href: "/activity-logs" },
                                { label: "Notifications", href: "/notifications" },
                                { label: "Settings", href: "/settings" },
                            ].map((q) => (
                                <Link
                                    key={q.href}
                                    href={q.href}
                                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold hover:bg-white/20 transition-all"
                                >
                                    {q.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard label="Total Students" value={stats.totalStudents ?? 0} icon={Users} tone="emerald" />
                        <StatCard label="Active Staff" value={stats.totalStaff ?? 0} icon={Shield} tone="blue" />
                        <StatCard label="Batches" value={stats.totalBatches ?? 0} icon={Layers} tone="slate" />
                        <StatCard label="Centers" value={stats.totalCenters ?? 0} icon={Building2} tone="slate" />
                        <StatCard label="Boys" value={stats.totalBoys ?? 0} icon={Users} tone="blue" />
                        <StatCard label="Girls" value={stats.totalGirls ?? 0} icon={Users} tone="emerald" />
                        <StatCard label="Present Today" value={todayPresent} icon={Calendar} tone="emerald" />
                        <StatCard label="Absent Today" value={todayAbsent} icon={AlertTriangle} tone="amber" />
                        <StatCard label="Pending Fees" value={feePending} icon={CreditCard} tone="amber" />
                        <StatCard label="Attendance Rate" value={`${overallAttendancePct}%`} icon={CheckCircle2} tone="blue" />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Recent Activity</h3>
                            <Link href="/activity-logs" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                                View all &gt;
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {recentLogs.length === 0 ? (
                                <div className="col-span-full p-5 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                    No activity logs available yet.
                                </div>
                            ) : (
                                recentLogs.slice(0, 6).map((log, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{log.action || "Activity"}</p>
                                            <span className="text-xs text-slate-500 shrink-0">{log.at || ""}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {(log.actor || "-")} {log.role ? `(${log.role})` : ""} {log.details ? `- ${log.details}` : ""}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isStaff && (
                <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-[2rem] text-white shadow-xl">
                        <p className="text-emerald-200 text-xs font-bold uppercase tracking-[0.22em]">Staff Dashboard</p>
                        <h2 className="text-2xl font-black mt-2" suppressHydrationWarning>
                            Good {greeting}, {username || "Staff"}
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-1" suppressHydrationWarning>
                            {longDateLabel}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                        <StatCard label="Students" value={staffAssigned} icon={Users} tone="emerald" />
                        <StatCard label="Present" value={staffAttendanceToday} icon={Calendar} tone="blue" />
                        <StatCard label="Not Marked" value={staffNotMarkedToday} icon={AlertTriangle} tone="amber" />
                        <StatCard label="Fee Pending" value={staffPendingFees} icon={CreditCard} tone="amber" />
                        <StatCard label="Fee Paid" value={Math.max(0, staffAssigned - staffPendingFees)} icon={CheckCircle2} tone="slate" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Students",
                                description: "View and manage enrolled students",
                                href: "/students",
                                icon: Users,
                            },
                            {
                                title: "Attendance",
                                description: "Mark and review attendance sessions",
                                href: "/attendance",
                                icon: Calendar,
                            },
                            {
                                title: "Academic",
                                description: "Enter marks and monitor performance",
                                href: "/marks",
                                icon: BookOpen,
                            },
                            {
                                title: "Fee Management",
                                description: "Scan and update monthly fee status",
                                href: "/fees",
                                icon: CreditCard,
                            },
                        ].map((module) => (
                            <Link
                                key={module.href}
                                href={module.href}
                                className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <module.icon className="h-5 w-5" />
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h3 className="text-base font-black text-gray-900 mt-4">{module.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/students/register"
                        className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                        <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 group-hover:text-emerald-800">New Student Registration</p>
                            <p className="text-xs text-gray-500 mt-1">Register a student with full personal and academic details.</p>
                        </div>
                    </Link>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Recent Activity</h3>
                            <Link
                                href="/notifications"
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Bell className="h-3.5 w-3.5 inline mr-1" />
                                Notifications
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentLogs.length === 0 ? (
                                <div className="p-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-sm text-center">
                                    No recent activity available.
                                </div>
                            ) : (
                                recentLogs.slice(0, 5).map((log, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{log.action || "Activity"}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details || log.actor || "-"}</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 shrink-0">{log.at || ""}</span>
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
                    <h2 className="text-xl font-black text-gray-900">Dashboard Restricted</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                        This dashboard is available only for super admin and staff users.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
