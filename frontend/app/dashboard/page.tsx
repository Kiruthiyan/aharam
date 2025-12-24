"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Calendar, BookOpen, CreditCard, DollarSign, Clock, AlertTriangle, GraduationCap } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function Dashboard() {
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");
    const [username, setUsername] = useState<string | null>(null);

    const [requirePasswordChange, setRequirePasswordChange] = useState(false);

    const [stats, setStats] = useState<any>({
        totalStudents: 0,
        totalStaff: 0,
        // monthlyIncome: 0, // Hidden for safety
        todaysAttendance: 0,
        pendingFees: 0,
        assignedStudents: 0
    });

    useEffect(() => {
        // Fetch stats
        // TODO: In real app, pass token to get role-specific data
        const token = localStorage.getItem("token");
        fetch("http://localhost:8080/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        // Token invalid/expired - Force logout
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                        return null;
                    }
                    throw new Error("Failed to fetch stats");
                }
                return res.json();
            })
            .then(data => {
                if (data) setStats(data);
            })
            .catch(err => console.error("Dashboard Fetch Error:", err));

        // Check local storage for role & password change requirement
        const storedRole = localStorage.getItem("userRole");
        const storedUser = localStorage.getItem("username");
        if (storedRole) setUserRole(storedRole as any);
        if (storedUser) setUsername(storedUser);

        const pwdChange = localStorage.getItem("requirePasswordChange");
        if (pwdChange === "true") setRequirePasswordChange(true);

    }, []);

    const adminStats = [
        { label: "மொத்த மாணவர்கள் (Total Students)", value: stats.totalStudents, icon: Users, color: "bg-blue-500" },
        { label: "ஆசிரியர்கள் (Total Staff)", value: stats.totalStaff, icon: Users, color: "bg-purple-500" },
        // Income HIDDEN as per strict security requirement
        // { label: "மாத வருமானம்", value: `Rs. ${stats.monthlyIncome?.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-600" },
        { label: "நிலுவை கட்டணம் (Pending Fees)", value: stats.pendingFees, icon: AlertTriangle, color: "bg-orange-500" },
    ];

    const staffStats = [
        { label: "எனது மாணவர்கள் (Assigned)", value: stats.assignedStudents, icon: Users, color: "bg-blue-500" },
        { label: "இன்றைய வரவு (Present)", value: stats.todaysAttendance, icon: Calendar, color: "bg-emerald-500" },
        { label: "நிலுவை உள்ளவர்கள் (Pending Fees)", value: stats.pendingFees, icon: Clock, color: "bg-orange-500" },
    ];

    const parentStats = [
        { label: "வருகை பதிவு (Attendance)", value: "-", icon: Calendar, color: "bg-emerald-500" },
        { label: "கல்வித் தரம் (Marks Avg)", value: "-", icon: GraduationCap, color: "bg-blue-500" },
        { label: "கட்டண நிலை (Fee Status)", value: "-", icon: CreditCard, color: "bg-green-500" }, // Dynamic later
    ];

    let currentStats = adminStats;
    if (userRole === "STAFF") currentStats = staffStats;
    if (userRole === "PARENT") currentStats = parentStats;

    return (
        <AdminLayout userRole={userRole}>
            {/* Password Change Warning */}
            {requirePasswordChange && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-bold text-lg">கடவுச்சொல் மாற்றம் தேவை (Password Change Required)</h3>
                        <p className="text-red-700 mt-1">
                            இது உங்களின் முதல் நுழைவு அல்லது பாதுகாப்பு காரணமாக உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. தயவுசெய்து உங்கள் கடவுச்சொல்லை உடனடியாக மாற்றவும்.
                        </p>
                    </div>
                </div>
            )}

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

                {userRole === "ADMIN" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">மாணவர் சேர்க்கை விவரம் (Admission Trends)</h3>
                        <div className="flex items-center justify-center min-h-[200px] border-dashed border-2 border-blue-100 rounded-lg bg-blue-50/50">
                            <div className="text-center">
                                <Users className="h-8 w-8 text-blue-300 mx-auto mb-2" />
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
