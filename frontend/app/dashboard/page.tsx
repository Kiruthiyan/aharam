"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Calendar, BookOpen, CreditCard, AlertTriangle, GraduationCap, ArrowUpRight, ArrowDownRight, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import Link from "next/link";
import clsx from "clsx";

export default function Dashboard() {
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");
    const [username, setUsername] = useState<string | null>(null);
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);
    const [stats, setStats] = useState<any>({
        totalStudents: 0,
        totalStaff: 0,
        todaysAttendance: 0,
        pendingFees: 0,
        assignedStudents: 0
    });

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

    const adminCards = [
        {
            label: "மொத்த மாணவர்கள்",
            sublabel: "Total Students",
            value: stats.totalStudents,
            icon: Users,
            trend: "+3 this month",
            up: true,
            gradient: "from-blue-600 to-indigo-600",
            bg: "bg-blue-50",
            text: "text-blue-700"
        },
        {
            label: "ஆசிரியர்கள்",
            sublabel: "Total Staff",
            value: stats.totalStaff,
            icon: Users,
            trend: "Active accounts",
            up: true,
            gradient: "from-purple-600 to-violet-600",
            bg: "bg-purple-50",
            text: "text-purple-700"
        },
        {
            label: "நிலுவை கட்டணம்",
            sublabel: "Pending Fees",
            value: stats.pendingFees,
            icon: AlertTriangle,
            trend: "Needs attention",
            up: false,
            gradient: "from-orange-500 to-red-500",
            bg: "bg-orange-50",
            text: "text-orange-700"
        },
        {
            label: "இன்றைய வரவு",
            sublabel: "Today's Attendance",
            value: stats.todaysAttendance,
            icon: Calendar,
            trend: "Present today",
            up: true,
            gradient: "from-emerald-600 to-teal-600",
            bg: "bg-emerald-50",
            text: "text-emerald-700"
        },
    ];

    const staffCards = [
        { label: "எனது மாணவர்கள்", sublabel: "Assigned Students", value: stats.assignedStudents, icon: Users, gradient: "from-blue-600 to-indigo-600", bg: "bg-blue-50", text: "text-blue-700" },
        { label: "இன்றைய வரவு", sublabel: "Present Today", value: stats.todaysAttendance, icon: Calendar, gradient: "from-emerald-600 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-700" },
        { label: "நிலுவை உள்ளவர்கள்", sublabel: "Pending Fees", value: stats.pendingFees, icon: AlertTriangle, gradient: "from-orange-500 to-red-500", bg: "bg-orange-50", text: "text-orange-700" },
    ];

    const currentCards = userRole === "ADMIN" ? adminCards : staffCards;

    const adminQuickActions = [
        { label: "Add Student", sublabel: "பொதுவான", href: "/students/register", icon: GraduationCap, color: "bg-blue-600 hover:bg-blue-700" },
        { label: "Attendance", sublabel: "வரவு பதிவு", href: "/attendance", icon: Calendar, color: "bg-emerald-600 hover:bg-emerald-700" },
        { label: "Record Fee", sublabel: "கட்டணம்", href: "/fees", icon: CreditCard, color: "bg-purple-600 hover:bg-purple-700" },
        { label: "View Marks", sublabel: "மதிப்பு", href: "/marks", icon: BookOpen, color: "bg-amber-600 hover:bg-amber-700" },
    ];

    // Simple CSS bar chart for attendance (mock monthly data - would be fetched ideally)
    const monthlyBars = [
        { month: "Sep", pct: 85 }, { month: "Oct", pct: 90 }, { month: "Nov", pct: 78 },
        { month: "Dec", pct: 92 }, { month: "Jan", pct: 88 }, { month: "Feb", pct: 95 },
    ];

    return (
        <AdminLayout userRole={userRole}>
            {/* Password Change Warning */}
            {requirePasswordChange && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-bold">கடவுச்சொல் மாற்றம் தேவை (Password Change Required)</h3>
                        <p className="text-red-700 text-sm mt-1">தயவுசெய்து உங்கள் கடவுச்சொல்லை உடனடியாக மாற்றவும்.{" "}
                            <Link href="/settings" className="underline font-bold">Settings →</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="mb-6 p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 rounded-2xl text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-20 -translate-y-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300 rounded-full -translate-x-10 translate-y-10 blur-2xl" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-xl sm:text-2xl font-bold">வணக்கம், {username || "Admin"} 🎉</h2>
                    <p className="text-emerald-200 text-sm mt-1">
                        {userRole === "ADMIN" ? "அகரம் உயர்நிலைக் கல்லூரி — Admin Panel" :
                            userRole === "STAFF" ? "உங்கள் மாணவர் வளர்ச்சியை கண்காணிக்கவும்" :
                                "உங்கள் பிள்ளையின் முன்னேற்றத்தை கண்காணிக்கவும்"}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {currentCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-200 group">
                        <div className="flex items-start justify-between">
                            <div className={clsx("p-2.5 rounded-xl", card.bg)}>
                                <card.icon className={clsx("h-5 w-5", card.text)} />
                            </div>
                            {"trend" in card && (
                                <span className={clsx("text-[10px] font-bold flex items-center gap-0.5",
                                    (card as any).up ? "text-emerald-600" : "text-red-500")}>
                                    {(card as any).up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {(card as any).trend}
                                </span>
                            )}
                        </div>
                        <p className={clsx("text-3xl font-bold mt-3 group-hover:scale-105 transition-transform origin-left", card.text)}>
                            {card.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{card.sublabel}</p>
                        <p className="text-[10px] text-gray-400">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Quick Actions / விரைவு செயல்கள்
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {adminQuickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className={clsx(
                                    "flex items-center gap-3 p-3.5 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                                    action.color
                                )}
                            >
                                <action.icon className="h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-bold text-xs">{action.label}</p>
                                    <p className="text-[10px] opacity-75">{action.sublabel}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Attendance Trend Chart (CSS bars) */}
                {(userRole === "ADMIN" || userRole === "STAFF") && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            வருகை போக்கு — Monthly Attendance Trend
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">6-month attendance percentage</p>
                        <div className="flex items-end gap-3 h-32">
                            {monthlyBars.map(bar => (
                                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-emerald-700">{bar.pct}%</span>
                                    <div className="w-full bg-emerald-100 rounded-t-lg relative overflow-hidden" style={{ height: "80px" }}>
                                        <div
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-700"
                                            style={{ height: `${bar.pct}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{bar.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Parent View - My Student */}
                {userRole === "PARENT" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">எனது பிள்ளை (My Student)</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {username?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{username || "Student Name"}</p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Active</span>
                                    <Link href="/attendance" className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition-colors">View Attendance →</Link>
                                    <Link href="/marks" className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-200 transition-colors">View Marks →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notices Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        சமீபத்திய அறிவிப்புகள் — Recent Notices
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        <BookOpen className="h-8 w-8 text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400">No recent notices</p>
                        {userRole === "ADMIN" && (
                            <button className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Add Notice
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
