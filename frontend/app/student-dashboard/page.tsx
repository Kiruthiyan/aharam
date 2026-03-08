"use client";

import AdminLayout from "@/components/AdminLayout";
import { BookOpen, Calendar, CheckCircle2, AlertTriangle, GraduationCap, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";

type AttendanceRow = {
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE";
};

type MarkRow = {
    id: number;
    examId?: number;
    examName?: string;
    marksObtained?: number;
    grade?: string;
    updatedAt?: string;
};

type FeeRow = {
    id: number;
    month: string;
    status: "PAID" | "PENDING";
    updatedAt?: string;
};

type StudentProfile = {
    fullName?: string;
};

type Activity = {
    title: string;
    date: string;
    type: "academic" | "attendance" | "fee";
    sortKey: number;
};

type StudentStats = {
    attendancePct: number;
    presentDays: number;
    absentDays: number;
    totalExams: number;
    averageScore: number;
    pendingFees: number;
    recentActivities: Array<{
        title: string;
        date: string;
        type: "academic" | "attendance" | "fee";
    }>;
};

const unwrapData = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const toEpoch = (value?: string): number => {
    if (!value) {
        return 0;
    }
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
};

export default function StudentDashboard() {
    const [stats, setStats] = useState<StudentStats>({
        attendancePct: 0,
        presentDays: 0,
        absentDays: 0,
        totalExams: 0,
        averageScore: 0,
        pendingFees: 0,
        recentActivities: [],
    });
    const [studentName, setStudentName] = useState<string>("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [profileRes, attendanceRes, marksRes, feesRes] = await Promise.all([
                    api.get("/student-dashboard/profile"),
                    api.get("/student-dashboard/attendance"),
                    api.get("/student-dashboard/marks"),
                    api.get("/student-dashboard/fees"),
                ]);

                const profile = unwrapData<StudentProfile>(profileRes);
                const attendance = unwrapData<AttendanceRow[]>(attendanceRes);
                const marks = unwrapData<MarkRow[]>(marksRes);
                const fees = unwrapData<FeeRow[]>(feesRes);

                setStudentName(profile.fullName || localStorage.getItem("name") || localStorage.getItem("username") || "Student");

                const presentDays = attendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
                const absentDays = attendance.filter((r) => r.status === "ABSENT").length;
                const attendancePct = attendance.length === 0 ? 0 : Number(((presentDays * 100) / attendance.length).toFixed(1));

                const totalExams = new Set(marks.map((m) => m.examId)).size;
                const scoreRows = marks.filter((m) => typeof m.marksObtained === "number") as Array<MarkRow & { marksObtained: number }>;
                const averageScore = scoreRows.length === 0
                    ? 0
                    : Number((scoreRows.reduce((sum, row) => sum + row.marksObtained, 0) / scoreRows.length).toFixed(1));

                const pendingFees = fees.filter((f) => f.status === "PENDING").length;

                const activities: Activity[] = [
                    ...marks.map((m) => ({
                        type: "academic" as const,
                        title: `${m.examName || "Exam"} graded (${m.grade || "-"})`,
                        date: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString("en-GB") : "-",
                        sortKey: toEpoch(m.updatedAt),
                    })),
                    ...fees.map((f) => ({
                        type: "fee" as const,
                        title: `${f.month} fee status: ${f.status}`,
                        date: f.updatedAt ? new Date(f.updatedAt).toLocaleDateString("en-GB") : "-",
                        sortKey: toEpoch(f.updatedAt),
                    })),
                    ...attendance.map((a) => ({
                        type: "attendance" as const,
                        title: `Attendance marked: ${a.status}`,
                        date: a.date,
                        sortKey: toEpoch(a.date),
                    })),
                ]
                    .sort((a, b) => b.sortKey - a.sortKey)
                    .slice(0, 6);

                setStats({
                    attendancePct,
                    presentDays,
                    absentDays,
                    totalExams,
                    averageScore,
                    pendingFees,
                    recentActivities: activities.map(({ title, date, type }) => ({ title, date, type })),
                });
            } catch {
                setStudentName(localStorage.getItem("name") || localStorage.getItem("username") || "Student");
            }
        };

        loadDashboard();
    }, []);

    const feeCardLabel = useMemo(() => (stats.pendingFees > 0 ? "Pending Fee Records" : "No Pending Fees"), [stats.pendingFees]);

    return (
        <AdminLayout userRole="STUDENT">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full -translate-x-32 translate-y-32 blur-3xl opacity-30" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-300 text-[10px] font-black tracking-[0.3em] uppercase mb-3">Student Hub</p>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-emerald-400" />
                            Digital Report Card
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-3 font-medium max-w-xl leading-relaxed">
                            Welcome, <span className="text-white font-bold">{studentName}</span>. Track your academic progress, monitor attendance, and manage your tuition schedule all in one place.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 w-fit text-emerald-600 mb-3 sm:mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{stats.attendancePct}%</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Attendance Rate</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="p-2 sm:p-3 rounded-xl bg-blue-50 w-fit text-blue-600 mb-3 sm:mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{stats.averageScore}%</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Average Marks</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="p-2 sm:p-3 rounded-xl bg-indigo-50 w-fit text-indigo-600 mb-3 sm:mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{stats.totalExams}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Exams Completed</p>
                    </div>

                    <div className={clsx(
                        "rounded-2xl border shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group",
                        stats.pendingFees > 0 ? "bg-red-50/50 border-red-100" : "bg-white border-gray-100"
                    )}>
                        <div className={clsx(
                            "p-2 sm:p-3 rounded-xl w-fit mb-3 sm:mb-4 transition-colors",
                            stats.pendingFees > 0
                                ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                                : "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white"
                        )}>
                            {stats.pendingFees > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{stats.pendingFees}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">{feeCardLabel}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Activity Feed</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.recentActivities.map((act, i) => (
                                <div key={`${act.type}-${i}`} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-emerald-100 transition-colors">
                                    <div className={clsx(
                                        "p-2.5 rounded-xl shrink-0",
                                        act.type === "academic" ? "bg-blue-50 text-blue-600" :
                                            act.type === "fee" ? "bg-teal-50 text-teal-600" :
                                                "bg-amber-50 text-amber-600"
                                    )}>
                                        {act.type === "academic" ? <BookOpen className="h-5 w-5" /> :
                                            act.type === "fee" ? <CheckCircle2 className="h-5 w-5" /> :
                                                <AlertTriangle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{act.title}</p>
                                        <p className="text-xs font-medium text-gray-500 mt-1">{act.date}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.recentActivities.length === 0 && (
                                <div className="text-sm text-gray-400">No recent activity yet.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/marks" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-colors group">
                                <span className="text-sm font-bold">View Full Results</span>
                                <BookOpen className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Link>
                            <Link href="/attendance" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-colors group">
                                <span className="text-sm font-bold">View Attendance</span>
                                <Calendar className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Link>
                            <Link href="/fees" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-colors group">
                                <span className="text-sm font-bold">Payment History</span>
                                <CheckCircle2 className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
