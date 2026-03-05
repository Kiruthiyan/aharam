"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import {
    Search, Plus, FileText, GraduationCap, ChevronLeft, ChevronRight,
    X, Phone, School, Users, MapPin, Globe, Mail, Briefcase,
    MoreVertical, Edit3, Trash2, ExternalLink, Loader2
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Student {
    studentId: string;
    fullName: string;
    fatherName: string;
    motherName: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    parentPhoneNumber: string;
    schoolName: string;
    status: string;
    examBatch?: number;
    center?: string;
    medium?: string;
    gender?: string;
    email?: string;
    address?: string;
}

const PAGE_SIZE = 12;

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [selectedBatch, setSelectedBatch] = useState("ALL");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<Student | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole as any);
        if (storedRole === "SUPER_ADMIN" || storedRole === "STUDENT") {
            window.location.href = "/dashboard";
            return;
        }

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
        return matchesSearch && matchesBatch && matchesCenter;
    }), [students, searchTerm, selectedBatch, selectedCenter]);

    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const paginated = filteredStudents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    useEffect(() => setPage(0), [searchTerm, selectedBatch, selectedCenter]);

    return (
        <AdminLayout userRole={role}>
            {/* Header Area */}
            <div className="max-w-7xl mx-auto space-y-6 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-emerald-600" />
                            Student Directory
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Manage and monitor students across all batches.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold">
                            <FileText className="h-4 w-4" /> Export CSV
                        </button>
                        <Link
                            href="/students/register"
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 text-sm font-bold"
                        >
                            <Plus className="h-4 w-4" />
                            New Registration
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center transition-all hover:shadow-md">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, ID or school..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="flex-1 md:w-44 px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-black text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer hover:bg-gray-50">
                            <option value="ALL">All Batches</option>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Batch {y}</option>)}
                        </select>
                        <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="flex-1 md:w-44 px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-black text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer hover:bg-gray-50">
                            <option value="ALL">All Centers</option>
                            <option value="KOKUVIL">Kokuvil</option>
                            <option value="MALLAKAM">Mallakam</option>
                        </select>
                    </div>
                </div>

                {/* Grid View */}
                {loading ? (
                    <div className="py-24 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>
                ) : paginated.length === 0 ? (
                    <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Users className="h-16 w-16 opacity-10" />
                        <p className="font-extrabold text-gray-500">No students found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginated.map((student) => (
                            <div
                                key={student.studentId}
                                onClick={() => setSelected(student)}
                                className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col items-center text-center focus-within:ring-4 focus-within:ring-emerald-500/20"
                                tabIndex={0}
                            >
                                <div className="absolute top-6 right-6">
                                    <div className={clsx(
                                        "h-3 w-3 rounded-full border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-125",
                                        student.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
                                    )} title={`Status: ${student.status}`} />
                                </div>

                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-700 font-black text-2xl border-4 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 mb-4">
                                    {student.fullName?.substring(0, 2).toUpperCase()}
                                </div>

                                <div className="space-y-1 w-full mb-4">
                                    <h3 className="font-black text-gray-900 text-lg leading-tight truncate px-2" title={student.fullName}>{student.fullName}</h3>
                                    <p className="text-xs font-bold text-emerald-600/70 font-mono tracking-widest uppercase">{student.studentId}</p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2 w-full mb-5">
                                    {student.examBatch && (
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100/50">
                                            Batch {student.examBatch}
                                        </span>
                                    )}
                                    {student.center && (
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100/50">
                                            {student.center}
                                        </span>
                                    )}
                                </div>

                                <div className="w-full pt-4 space-y-3 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center justify-center gap-2 text-[11px] font-black text-gray-500 bg-gray-50/50 py-2 rounded-xl">
                                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                                        {student.parentPhoneNumber || "No Phone"}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate px-2" title={student.schoolName}>
                                        <School className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                        <span className="truncate">{student.schoolName || "No School Info"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between pb-10">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredStudents.length)} <span className="text-gray-300">of</span> {filteredStudents.length}
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="bg-white border border-gray-200 text-gray-600 h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-black text-gray-900">{page + 1}<span className="text-gray-300 mx-1">/</span>{totalPages || 1}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="bg-white border border-gray-200 text-gray-600 h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal Overlay */}
            {selected && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
                        {/* Left sidebar info */}
                        <div className="md:w-80 bg-emerald-900 p-8 text-white flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute inset-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full translate-x-10 -translate-y-10 blur-2xl opacity-30" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500 rounded-full -translate-x-10 translate-y-10 blur-2xl opacity-20" />
                            </div>
                            
                            <div className="relative z-10 w-full flex flex-col items-center">
                                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-800 font-black text-4xl border-[4px] border-emerald-800/50 shadow-2xl mb-6">
                                    {selected.fullName?.substring(0, 2).toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-black mb-1 leading-tight tracking-tight">{selected.fullName}</h2>
                                <p className="text-emerald-300 font-bold font-mono tracking-widest text-xs bg-black/20 px-4 py-1.5 rounded-full mb-8 border border-white/10">{selected.studentId}</p>

                                <div className="w-full space-y-4 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-300 font-bold uppercase tracking-widest">Status</span>
                                        <span className="font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-sm">ACTIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-300 font-bold uppercase tracking-widest">Centers</span>
                                        <span className="font-bold">{selected.center}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-300 font-bold uppercase tracking-widest">Medium</span>
                                        <span className="font-bold">{selected.medium}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right scrollable content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Detailed Record</h4>
                                <button onClick={() => setSelected(null)} className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Academic Sector */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <GraduationCap className="h-5 w-5" />
                                        <h5 className="text-xs font-black uppercase tracking-widest">Academic Background</h5>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current School</p>
                                            <p className="text-sm font-black text-gray-900">{selected.schoolName || "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Exam Batch</p>
                                            <p className="text-sm font-black text-gray-900">{selected.examBatch} G.C.E A/L</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Family Sector */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <Users className="h-5 w-5" />
                                        <h5 className="text-xs font-black uppercase tracking-widest">Guardian & Family</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-extrabold text-sm shadow-sm">F</div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{selected.fatherName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{selected.fatherOccupation || "No occupation listed"}</p>
                                                </div>
                                            </div>
                                            <a href={`tel:${selected.parentPhoneNumber}`} className="h-10 w-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
                                                <Phone className="h-4 w-4" />
                                            </a>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-extrabold text-sm shadow-sm">M</div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{selected.motherName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{selected.motherOccupation || "No occupation listed"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* System Sector & Barcode */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <ExternalLink className="h-5 w-5" />
                                        <h5 className="text-xs font-black uppercase tracking-widest">System Record & Barcode</h5>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <Link href="/attendance" className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl font-black text-[10px] tracking-widest text-center border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm">ATTENDANCE LOG</Link>
                                        <Link href="/fees" className="bg-blue-50 text-blue-700 p-4 rounded-2xl font-black text-[10px] tracking-widest text-center border border-blue-100 hover:bg-blue-100 transition-all shadow-sm">PAYMENT HISTORY</Link>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center space-y-4 shadow-sm">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scan Student ID</h5>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full flex justify-center overflow-hidden">
                                            {/* @ts-ignore - react-barcode types issue */}
                                            {typeof window !== 'undefined' && require('react-barcode') ? (
                                                <div className="scale-90 transform origin-center grayscale contrast-200">
                                                    {(() => {
                                                        const Barcode = require('react-barcode');
                                                        return <Barcode value={selected.studentId || "00000"} height={60} fontSize={14} background="#ffffff" lineColor="#111827" margin={0} />;
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="h-24 flex items-center justify-center text-gray-400 font-bold">Loading barcode...</div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const printWindow = window.open('', '_blank');
                                                if (printWindow) {
                                                    printWindow.document.write(`
                                                        <html>
                                                            <head><title>Print Barcode - ${selected.fullName}</title></head>
                                                            <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;">
                                                                <div style="text-align:center;">
                                                                    <div style="font-weight:bold;margin-bottom:10px;font-size:24px;">${selected.fullName}</div>
                                                                    <img src="https://barcode.tec-it.com/barcode.ashx?data=${selected.studentId}&code=Code128&dpi=96" alt="Barcode" />
                                                                </div>
                                                                <script>window.onload = function() { window.print(); window.close(); }</script>
                                                            </body>
                                                        </html>
                                                    `);
                                                    printWindow.document.close();
                                                }
                                            }}
                                            className="w-full bg-emerald-700 text-white font-black py-4 rounded-xl text-xs tracking-widest uppercase hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
                                        >
                                            PRINT ID CARD / BARCODE
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
