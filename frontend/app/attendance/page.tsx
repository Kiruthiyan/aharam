"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Search } from "lucide-react";
import clsx from "clsx";

// Parent View Component
function ParentAttendanceView() {
    const studentName = "Kavin Kumar"; // TODO: Fetch from Context/API
    const [month, setMonth] = useState("December 2024");

    const attendanceRecords = [
        { date: "2024-12-01", status: "Present" },
        { date: "2024-12-02", status: "Present" },
        { date: "2024-12-03", status: "Absent" },
    ];

    return (
        <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">எனது வருகை (My Attendance)</h1>
                    <p className="text-sm text-gray-500">Student: {studentName}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {attendanceRecords.map((record, idx) => (
                        <div key={idx} className={clsx(
                            "flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md",
                            record.status === 'Present' ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                        )}>
                            <div className="flex items-center">
                                <Calendar className={clsx("h-5 w-5 mr-3", record.status === 'Present' ? "text-green-600" : "text-red-500")} />
                                <span className="font-semibold text-gray-700">{record.date}</span>
                            </div>
                            <span className={clsx(
                                "px-2 py-1 rounded-md text-xs font-bold uppercase",
                                record.status === 'Present' ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                            )}>
                                {record.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Staff/Admin View Component
function StaffAttendanceView() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [students] = useState([
        { id: "STD-001", name: "Kavin Kumar", status: "Present" },
        { id: "STD-002", name: "Ravi Shankar", status: "Absent" },
        { id: "STD-003", name: "Meena Kumari", status: "Present" },
    ]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">மாணவர் வருகை (Attendance)</h1>
                    <p className="text-sm text-gray-500">தினசரி வருகை பதிவு (Mark Daily Attendance).</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-800 font-medium"
                    />
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                        View
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Class: Grade 10 - Mathematics</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search student..." className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b">ID</th>
                                <th className="p-4 font-medium border-b">Name</th>
                                <th className="p-4 font-medium border-b">Status</th>
                                <th className="p-4 font-medium border-b text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-900 font-medium">{student.id}</td>
                                    <td className="p-4 text-gray-600">{student.name}</td>
                                    <td className="p-4">
                                        <span className={clsx(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            student.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        )}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="p-1 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors">
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                        <button className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AttendancePage() {
    const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF_ADMIN" | "PARENT">("STAFF_ADMIN");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setUserRole(storedRole as any);
    }, []);

    return (
        <AdminLayout userRole={userRole}>
            {userRole === "PARENT" ? <ParentAttendanceView /> : <StaffAttendanceView />}
        </AdminLayout>
    );
}
