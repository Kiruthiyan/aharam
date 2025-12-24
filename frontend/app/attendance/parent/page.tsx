"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function AttendancePage() {
    // In real app, this would be fetched based on the logged-in student's ID
    const studentName = "Kavin Kumar";
    const [month, setMonth] = useState("December 2024");

    const attendanceRecords = [
        { date: "2024-12-01", status: "Present" },
        { date: "2024-12-02", status: "Present" },
        { date: "2024-12-03", status: "Absent" },
        { date: "2024-12-04", status: "Present" },
        { date: "2024-12-05", status: "Present" },
    ];

    return (
        <AdminLayout userRole="PARENT">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">எனது வருகை (My Attendance)</h1>
                    <p className="text-sm text-gray-500">Student: {studentName}</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Previous</button>
                    <span className="px-3 py-1 text-sm font-bold text-emerald-800 border-x border-gray-200">{month}</span>
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Next</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
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

                <div className="bg-gray-50 p-6 border-t border-gray-100 mt-4">
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600">Present (80%)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-gray-600">Absent (20%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
