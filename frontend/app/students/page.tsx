"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { Search, Filter, Plus, MoreHorizontal, FileText, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Student {
    studentId: string;
    fullName: string;
    fatherName: string;
    parentPhoneNumber: string;
    schoolName: string;
    status: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [role, setRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole as any);

        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/students", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStudents(data);
                }
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout userRole={role}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-emerald-600" />
                        மாணவர்கள் (Students)
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and view all registered students</p>
                </div>
                <Link
                    href="/students/register"
                    className="flex items-center justify-center px-4 py-2.5 bg-emerald-900 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-lg hover:shadow-emerald-900/20"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    <span>புதிய மாணவர் (New Student)</span>
                </Link>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex-1 md:flex-none">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex-1 md:flex-none">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent/Guardian</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <span className="font-mono text-sm text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                                                {student.studentId}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                                                    {student.fullName ? student.fullName.substring(0, 2) : "UN"}
                                                </div>
                                                <span className="font-medium text-gray-900">{student.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <p className="text-gray-900">{student.fatherName}</p>
                                                <p className="text-gray-400 text-xs">{student.parentPhoneNumber}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{student.schoolName}</td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                student.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            )}>
                                                {student.status || "ACTIVE"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Static for now) */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
                    <span>Showing {filteredStudents.length} students</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
