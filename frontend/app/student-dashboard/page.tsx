"use client";

import AdminLayout from "@/components/AdminLayout";
import { BookOpen, Calendar, CheckCircle2, Shield, AlertTriangle, GraduationCap, XCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type StudentStats = {
    attendancePct?: number;
    presentDays?: number;
    absentDays?: number;
    totalExams?: number;
    averageScore?: number;
    pendingFees?: number;
    recentActivities?: Array<{
        title: string;
        date: string;
        type: "academic" | "attendance" | "fee";
    }>;
};

export default function StudentDashboard() {
    const [stats, setStats] = useState<StudentStats>({});
    const [studentName, setStudentName] = useState<string>("");

    useEffect(() => {
        // This simulates a fetch since the backend StudentStats endpoint might not be fully built yet
        // In a real scenario, we'll fetch from `/api/dashboard/stats`
        const storedName = localStorage.getItem("name") || localStorage.getItem("username") || "Student";
        setStudentName(storedName);

        // Mock data for the static UI build:
        setStats({
            attendancePct: 92.5,
            presentDays: 148,
            absentDays: 12,
            totalExams: 6,
            averageScore: 78.4,
            pendingFees: 0,
            recentActivities: [
                { title: "Term 2 Full Exam Graded", date: "Today", type: "academic" },
                { title: "January Tuition Fee Paid", date: "Jan 5", type: "fee" },
                { title: "Absent: General Maths", date: "Jan 2", type: "attendance" },
            ]
        });
    }, []);

    return (
        <AdminLayout userRole="STUDENT">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Welcome Banner */}
                <div className="mb-6 p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full -translate-x-32 translate-y-32 blur-3xl opacity-30" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-300 text-[10px] font-black tracking-[0.3em] uppercase mb-3">
                            Student Hub
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-emerald-400" />
                            Digital Report Card
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-3 font-medium max-w-xl leading-relaxed">
                            Welcome, <span className="text-white font-bold">{studentName}</span>. Track your academic progress, monitor attendance, and manage your tuition schedule all in one place.
                        </p>
                    </div>
                </div>

                {/* Key Metrics */}
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
                        stats.pendingFees && stats.pendingFees > 0 ? "bg-red-50/50 border-red-100" : "bg-white border-gray-100"
                    )}>
                        <div className={clsx(
                            "p-2 sm:p-3 rounded-xl w-fit mb-3 sm:mb-4 transition-colors",
                            stats.pendingFees && stats.pendingFees > 0
                                ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                                : "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white"
                        )}>
                            {stats.pendingFees && stats.pendingFees > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-gray-400">Rs.</span>
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">{stats.pendingFees}</p>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Pending Fees</p>
                    </div>
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Activity Feed</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.recentActivities?.map((act, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-emerald-100 transition-colors">
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
                        </div>
                    </div>

                    {/* Quick Links */}
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
