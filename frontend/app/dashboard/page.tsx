"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Calendar, BookOpen, CreditCard, DollarSign, Clock, AlertTriangle, GraduationCap } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF_ADMIN" | "PARENT">("SUPER_ADMIN");

    const [stats, setStats] = useState<any>({
        totalStudents: 0,
        totalStaff: 0,
        monthlyIncome: 0,
        todaysAttendance: 0,
        pendingFees: 0,
        assignedStudents: 0
    });

    useEffect(() => {
        // Fetch stats
        // TODO: In real app, pass token to get role-specific data
        fetch("http://localhost:8080/api/dashboard/stats")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // Check local storage for role
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setUserRole(storedRole as any);

    }, []);

    const superAdminStats = [
        { label: "மொத்த மாணவர்கள்", value: stats.totalStudents, icon: Users, color: "bg-blue-500" },
        { label: "ஆசிரியர்கள் (Staff)", value: stats.totalStaff, icon: Users, color: "bg-purple-500" },
        { label: "மாத வருமானம்", value: `Rs. ${stats.monthlyIncome?.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-600" },
        { label: "நிலுவை கட்டணம் (Total Pending)", value: stats.pendingFees, icon: AlertTriangle, color: "bg-orange-500" },
    ];

    const staffAdminStats = [
        { label: "எனது மாணவர்கள் (Assigned)", value: stats.assignedStudents, icon: Users, color: "bg-blue-500" },
        { label: "இன்றைய வரவு (Present)", value: stats.todaysAttendance, icon: Calendar, color: "bg-emerald-500" },
        { label: "நிலுவை உள்ளவர்கள் (Pending Fees)", value: stats.pendingFees, icon: Clock, color: "bg-orange-500" },
    ];

    const parentStats = [
        { label: "வருகை பதிவு (Attendance)", value: "-", icon: Calendar, color: "bg-emerald-500" },
        { label: "கல்வித் தரம் (Marks Avg)", value: "-", icon: GraduationCap, color: "bg-blue-500" },
        { label: "கட்டண நிலை (Fee Status)", value: "-", icon: CreditCard, color: "bg-green-500" }, // Dynamic later
    ];

    let currentStats = superAdminStats;
    if (userRole === "STAFF_ADMIN") currentStats = staffAdminStats;
    if (userRole === "PARENT") currentStats = parentStats;

    return (
        <AdminLayout userRole={userRole}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {currentStats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex items-center">
                        <div className={clsx("p-4 rounded-xl text-white mr-4 shadow-lg", stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notices - Visible to All */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">சமீபத்திய அறிவிப்புகள் (Recent Notices)</h3>
                    <div className="space-y-4">
                        {/* TODO: Fetch real notices from API */}
                        <div className="text-gray-500 text-sm text-center py-4">No recent notices.</div>
                    </div>
                </div>

                {/* Role Specific Second Panel */}

                {userRole === "SUPER_ADMIN" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">வருமான வரைபடம் (Income Analytics)</h3>
                        <div className="flex items-center justify-center min-h-[200px] border-dashed border-2 border-emerald-100 rounded-lg">
                            <div className="text-center">
                                <DollarSign className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Chart Component Here</p>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === "PARENT" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">எனது பிள்ளை (My Student)</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                K
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Student Name</p>
                                <p className="text-sm text-gray-500">Grade - Section</p>
                                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">Status</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
