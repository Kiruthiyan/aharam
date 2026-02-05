"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import { CreditCard, Save, Search, ChevronLeft, ChevronRight, Check, Loader2, Filter, AlertCircle } from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    center?: string;
    medium?: string;
}

interface FeeRecord {
    id?: number;
    studentId?: string;
    student?: { studentId: string }; // Handle nested return from backend
    month: string; // "January 2025"
    amount: number;
    status: "PAID" | "PENDING";
}

// Fixed Months (Col Headers)
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// --- Staff View (Excel Grid) ---
function StaffFeesView({ username }: { username: string }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [feeData, setFeeData] = useState<Record<string, Record<string, FeeRecord>>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedBatch, setSelectedBatch] = useState("2026");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };

                // 1. Fetch Students
                const resStudents = await fetch("http://localhost:8080/api/students", { headers });
                const studentsData: Student[] = await resStudents.json();
                setStudents(studentsData);

                // 2. Fetch Fees for Batch
                // Using new endpoint: /api/fees/batch/{batch}
                const resFees = await fetch(`http://localhost:8080/api/fees/batch/${selectedBatch}`, { headers });

                if (resFees.ok) {
                    const data: any[] = await resFees.json();

                    // Transform to Grid: { studentId: { "Month Year": FeeRecord } }
                    const grid: Record<string, Record<string, FeeRecord>> = {};
                    data.forEach(r => {
                        const sId = r.student?.studentId || r.studentId;
                        const m = r.month; // e.g., "January 2025"

                        // Only add if matches selected year (simple string check)
                        if (m.includes(selectedYear)) {
                            if (!grid[sId]) grid[sId] = {};
                            grid[sId][m] = r;
                        }
                    });
                    setFeeData(grid);
                } else {
                    setFeeData({});
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedBatch, selectedYear]);

    // Filter Students
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBatch = (s.examBatch?.toString() || "") === selectedBatch;
            const matchesCenter = selectedCenter === "ALL" || s.center === selectedCenter;
            return matchesSearch && matchesBatch && matchesCenter;
        }).sort((a, b) => a.studentId.localeCompare(b.studentId));
    }, [students, searchTerm, selectedBatch, selectedCenter]);


    // Handle Cell Click (Pay)
    // For simplicity in grid: Toggle "Paid" vs "Not Paid" might not work because we need Amount.
    // So, clicking an empty cell prompts for Amount (with default).
    // Clicking a PAID cell shows details (maybe readonly for now).
    const handleCellClick = (studentId: string, monthFull: string) => {
        if (feeData[studentId]?.[monthFull]) {
            // Already paid
            return;
        }

        const amountStr = prompt(`Enter Fee Amount for ${monthFull}:`, "1500");
        if (amountStr && !isNaN(parseFloat(amountStr))) {
            const amount = parseFloat(amountStr);
            setFeeData(prev => ({
                ...prev,
                [studentId]: {
                    ...(prev[studentId] || {}),
                    [monthFull]: {
                        studentId,
                        month: monthFull,
                        amount,
                        status: "PAID" // Tentative status until saved
                    }
                }
            }));
        }
    };

    const handleSave = async () => {
        // Collect ALL new payments (logic: we only send what's in feeData, backend logic handles idempotency or we trust user input)
        // Ideally we only send unsaved ones. Since I don't track "unsaved" vs "saved" explicitly in this simple grid,
        // I'll send ALL. Backend `recordPayment` creates new records. Duplicate checks might be needed in backend or UI?
        // Basic Implementation: Send everything. Backend should ideally check if paid for that month.
        // **Current Backend `recordPayment` simply inserts.** This will create duplicates if I send all.
        // FIX: I should ONLY send entries that don't have an ID (i.e., purely local).
        // My `feeData` state mixes fetched (has ID) and new (no ID).

        const payload: any[] = [];
        for (const studentId in feeData) {
            for (const month in feeData[studentId]) {
                const record = feeData[studentId][month];
                if (!record.id) { // Only send RECORDS WITHOUT ID (New)
                    payload.push({
                        studentId,
                        month: record.month,
                        amount: record.amount,
                        recordedBy: username
                    });
                }
            }
        }

        if (payload.length === 0) {
            alert("No new payments to save.");
            return;
        }

        if (!confirm(`Save ${payload.length} new payments?`)) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/fees/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Fees Saved Successfully!");
                // Force Reload to get IDs
                window.location.reload();
            }
            else alert("Failed to save.");
        } catch (e) { console.error(e); alert("Network Error"); }
        finally { setSubmitting(false); }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            {/* Header & Controls */}
            <div className="bg-white p-4 shadow-sm z-10 hidden md:flex flex-col gap-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <CreditCard className="h-6 w-6 text-emerald-600" />
                        Fee Collection Register ({selectedYear})
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Year</span>
                        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-bold">
                            <option>2024</option><option>2025</option><option>2026</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Batch</span>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-bold">
                                <option>2024</option><option>2025</option><option>2026</option><option>2027</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Center</span>
                            <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-bold">
                                <option value="ALL">All Centers</option><option>KOKUVIL</option><option>MALLAKAM</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <button onClick={handleSave} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50">
                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Save New Payments
                        </button>
                    </div>
                </div>
            </div>

            {/* Excel Grid Container */}
            <div className="flex-1 overflow-auto bg-gray-50 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>
                ) : null}

                <table className="w-full border-collapse bg-white shadow-sm">
                    <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
                        <tr>
                            <th className="p-2 border border-gray-200 text-[10px] text-gray-500 uppercase w-10 text-center bg-gray-100 sticky left-0 z-20">#</th>
                            <th className="p-2 border border-gray-200 text-[10px] text-gray-500 uppercase text-left w-64 bg-gray-100 sticky left-10 z-20">Student Name</th>
                            {MONTHS.map(m => (
                                <th key={m} className="p-2 border border-gray-200 text-[10px] text-gray-500 uppercase w-24 text-center">{m.substring(0, 3)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan={MONTHS.length + 2} className="p-10 text-center text-gray-400">No students found.</td></tr>
                        ) : (
                            filteredStudents.map((s, idx) => (
                                <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-2 border border-gray-100 text-center text-xs text-gray-400 bg-gray-50 sticky left-0 z-10">{idx + 1}</td>
                                    <td className="p-2 border border-gray-100 bg-white sticky left-10 z-10 border-r-2 border-r-gray-100">
                                        <div className="font-bold text-gray-800 text-xs whitespace-nowrap overflow-hidden text-ellipsis w-48" title={s.fullName}>{s.fullName}</div>
                                        <div className="text-[9px] text-gray-400 font-mono">{s.studentId}</div>
                                    </td>
                                    {MONTHS.map(m => {
                                        const monthFull = `${m} ${selectedYear}`;
                                        const record = feeData[s.studentId]?.[monthFull];
                                        const isPaid = !!record;

                                        return (
                                            <td key={m}
                                                onClick={() => handleCellClick(s.studentId, monthFull)}
                                                className={clsx(
                                                    "p-0 border border-gray-100 text-center cursor-pointer hover:bg-gray-50 transition-all relative h-10",
                                                    isPaid ? "bg-emerald-50/50" : "bg-white"
                                                )}
                                            >
                                                {isPaid ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 rounded-full mb-0.5">PAID</span>
                                                        <span className="text-[9px] text-gray-400 font-mono">{record.amount}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-200 opacity-0 hover:opacity-100 text-xs">+</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function FeesPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("STAFF");
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        if (storedRole) setUserRole(storedRole as "ADMIN" | "STAFF" | "PARENT");
        if (storedUsername) setUsername(storedUsername);
    }, []);

    return (
        <AdminLayout userRole={userRole}>
            <StaffFeesView username={username} />
        </AdminLayout>
    );
}
