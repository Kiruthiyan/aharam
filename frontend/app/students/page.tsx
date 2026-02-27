"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import { Search, Plus, FileText, GraduationCap, ChevronLeft, ChevronRight, X, Phone, School, Users, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Student {
    studentId: string;
    fullName: string;
    fatherName: string;
    parentPhoneNumber: string;
    schoolName: string;
    status: string;
    examBatch?: number;
    center?: string;
    medium?: string;
}

const PAGE_SIZE = 20;

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [role, setRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");
    const [selectedBatch, setSelectedBatch] = useState("ALL");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedMedium, setSelectedMedium] = useState("ALL");
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<Student | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole as any);

        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/students", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setStudents(await res.json());
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() => students.filter(student => {
        const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBatch = selectedBatch === "ALL" || (student.examBatch?.toString() === selectedBatch);
        const matchesCenter = selectedCenter === "ALL" || student.center === selectedCenter;
        const matchesMedium = selectedMedium === "ALL" || student.medium === selectedMedium;
        return matchesSearch && matchesBatch && matchesCenter && matchesMedium;
    }), [students, searchTerm, selectedBatch, selectedCenter, selectedMedium]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const paginated = filteredStudents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Reset to page 0 on filter change
    useEffect(() => setPage(0), [searchTerm, selectedBatch, selectedCenter, selectedMedium]);

    return (
        <AdminLayout userRole={role}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-emerald-600" />
                        மாணவர்கள் (Students)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <Link
                    href="/students/register"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all shadow-sm hover:shadow-md text-sm font-bold"
                >
                    <Plus className="h-4 w-4" />
                    புதிய மாணவர்
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or ID..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="ALL">All Batches</option>
                        <option>2024</option><option>2025</option><option>2026</option><option>2027</option>
                    </select>
                    <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="ALL">All Centers</option>
                        <option value="KOKUVIL">Kokuvil</option><option value="MALLAKAM">Mallakam</option>
                    </select>
                    <select value={selectedMedium} onChange={e => setSelectedMedium(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="ALL">All</option><option value="TAMIL">Tamil</option><option value="ENGLISH">English</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        <FileText className="h-4 w-4" /> Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Batch</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Parent</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading students...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No students found.</td></tr>
                            ) : (
                                paginated.map((student, idx) => (
                                    <tr key={student.studentId} className="hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => setSelected(student)}>
                                        <td className="p-4 text-gray-400 text-xs">{page * PAGE_SIZE + idx + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                                                    {student.fullName?.substring(0, 2).toUpperCase() || "UN"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{student.fullName}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg w-fit font-bold">Batch {student.examBatch || "-"}</span>
                                                <span className="text-gray-400">{student.center} / {student.medium}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <p className="text-gray-800 text-sm">{student.fatherName}</p>
                                            <p className="text-gray-400 text-xs">{student.parentPhoneNumber}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "inline-flex px-2 py-0.5 rounded-full text-xs font-bold border",
                                                student.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-red-50 text-red-600 border-red-200"
                                            )}>
                                                {student.status || "ACTIVE"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
                    <span className="text-gray-500 text-xs">
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors text-xs font-medium"
                        >
                            <ChevronLeft className="h-3 w-3" /> Previous
                        </button>
                        <span className="text-gray-400 text-xs">Page {page + 1} of {totalPages || 1}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors text-xs font-medium"
                        >
                            Next <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-over Detail Panel */}
            {selected && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300">
                        {/* Panel Header */}
                        <div className="p-5 bg-emerald-900 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg">Student Details</h2>
                                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                                    {selected.fullName?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{selected.fullName}</h3>
                                    <p className="text-emerald-300 font-mono text-sm">{selected.studentId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold border",
                                    selected.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                )}>
                                    {selected.status || "ACTIVE"}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-3">
                                <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                    <Users className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Father / Guardian</p>
                                        <p className="font-semibold text-gray-800 text-sm">{selected.fatherName || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Phone</p>
                                        <p className="font-semibold text-gray-800 text-sm">{selected.parentPhoneNumber || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                    <School className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">School</p>
                                        <p className="font-semibold text-gray-800 text-sm">{selected.schoolName || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Center</p>
                                        <p className="font-semibold text-gray-800 text-sm">{selected.center || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                    <Globe className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400">Batch / Medium</p>
                                        <p className="font-semibold text-gray-800 text-sm">Batch {selected.examBatch || "—"} — {selected.medium || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="pt-2">
                                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Quick Links</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/attendance" className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-xs font-bold">
                                        View Attendance
                                    </Link>
                                    <Link href="/marks" className="flex items-center gap-2 p-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-xs font-bold">
                                        View Marks
                                    </Link>
                                    <Link href="/fees" className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-bold">
                                        Fee Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
