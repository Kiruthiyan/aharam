"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import { CreditCard, Save, Search, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

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
    student?: { studentId: string };
    month: string;
    amount: number;
    status: "PAID" | "PENDING";
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// Fee Entry Modal — replaces browser prompt()
function FeeModal({
    studentName, monthFull, onConfirm, onCancel
}: {
    studentName: string;
    monthFull: string;
    onConfirm: (amount: number, notes: string) => void;
    onCancel: () => void;
}) {
    const [amount, setAmount] = useState("1500");
    const [notes, setNotes] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-5 bg-emerald-900 text-white relative">
                    <h2 className="text-lg font-bold">Record Payment</h2>
                    <p className="text-emerald-200 text-sm mt-1">{studentName} — {monthFull}</p>
                    <button onClick={onCancel} className="absolute top-4 right-4 text-emerald-300 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Amount (Rs.)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-4 py-3 text-lg font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Partial payment, cheque no."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                const amt = parseFloat(amount);
                                if (!isNaN(amt) && amt > 0) onConfirm(amt, notes);
                            }}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors"
                        >
                            Record Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StaffFeesView({ username }: { username: string }) {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [feeData, setFeeData] = useState<Record<string, Record<string, FeeRecord>>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState<{ studentId: string; studentName: string; monthFull: string } | null>(null);

    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedBatch, setSelectedBatch] = useState("2026");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };
                const resStudents = await fetch("http://localhost:8080/api/students", { headers });
                const studentsData: Student[] = await resStudents.json();
                setStudents(studentsData);

                const resFees = await fetch(`http://localhost:8080/api/fees/batch/${selectedBatch}`, { headers });
                if (resFees.ok) {
                    const data: any[] = await resFees.json();
                    const grid: Record<string, Record<string, FeeRecord>> = {};
                    data.forEach(r => {
                        const sId = r.student?.studentId || r.studentId;
                        const m = r.month;
                        if (m.includes(selectedYear)) {
                            if (!grid[sId]) grid[sId] = {};
                            grid[sId][m] = r;
                        }
                    });
                    setFeeData(grid);
                } else setFeeData({});
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        loadData();
    }, [selectedBatch, selectedYear]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBatch = (s.examBatch?.toString() || "") === selectedBatch;
            const matchesCenter = selectedCenter === "ALL" || s.center === selectedCenter;
            return matchesSearch && matchesBatch && matchesCenter;
        }).sort((a, b) => a.studentId.localeCompare(b.studentId));
    }, [students, searchTerm, selectedBatch, selectedCenter]);

    const handleCellClick = (student: Student, monthFull: string) => {
        if (feeData[student.studentId]?.[monthFull]) return; // Already paid
        setModal({ studentId: student.studentId, studentName: student.fullName, monthFull });
    };

    const handleModalConfirm = (amount: number, notes: string) => {
        if (!modal) return;
        setFeeData(prev => ({
            ...prev,
            [modal.studentId]: {
                ...(prev[modal.studentId] || {}),
                [modal.monthFull]: {
                    studentId: modal.studentId,
                    month: modal.monthFull,
                    amount,
                    status: "PAID"
                }
            }
        }));
        setModal(null);
        toast("info", `Payment of Rs. ${amount} recorded for ${modal.studentName}. Click Save to commit.`);
    };

    const handleSave = async () => {
        const payload: any[] = [];
        for (const studentId in feeData) {
            for (const month in feeData[studentId]) {
                const record = feeData[studentId][month];
                if (!record.id) {
                    payload.push({ studentId, month: record.month, amount: record.amount, recordedBy: username });
                }
            }
        }
        if (payload.length === 0) { toast("warning", "No new payments to save."); return; }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/fees/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast("success", `${payload.length} payment(s) saved successfully!`);
                // Update local records with "committed" flag by re-fetching
                setTimeout(() => window.location.reload(), 1500);
            } else toast("error", "Failed to save payments. Please try again.");
        } catch (e) { toast("error", "Network error. Please try again."); } finally { setSubmitting(false); }
    };

    // Monthly totals
    const monthlyTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        MONTHS.forEach(m => {
            const monthFull = `${m} ${selectedYear}`;
            let total = 0;
            filteredStudents.forEach(s => {
                if (feeData[s.studentId]?.[monthFull]) total += feeData[s.studentId][monthFull].amount || 0;
            });
            totals[m] = total;
        });
        return totals;
    }, [feeData, filteredStudents, selectedYear]);

    const totalCollected = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
    const paidCount = filteredStudents.filter(s => {
        return MONTHS.some(m => !!feeData[s.studentId]?.[`${m} ${selectedYear}`]);
    }).length;

    return (
        <div className="flex flex-col gap-4">
            {/* Fee Modal */}
            {modal && (
                <FeeModal
                    studentName={modal.studentName}
                    monthFull={modal.monthFull}
                    onConfirm={handleModalConfirm}
                    onCancel={() => setModal(null)}
                />
            )}

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h1 className="text-base font-bold flex items-center gap-2 text-gray-800">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        Fee Collection Register — {selectedYear}
                    </h1>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                        <option>2024</option><option>2025</option><option>2026</option>
                    </select>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                            <option>2024</option><option>2025</option><option>2026</option><option>2027</option>
                        </select>
                        <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="ALL">All Centers</option><option>KOKUVIL</option><option>MALLAKAM</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-3 py-2 w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <button onClick={handleSave} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap text-sm transition-colors">
                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            <span className="hidden sm:inline">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-emerald-700">Rs. {totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-medium">Total Collected</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-700">{paidCount}</p>
                    <p className="text-xs text-blue-600 font-medium">Students Paid</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-orange-600">{filteredStudents.length - paidCount}</p>
                    <p className="text-xs text-orange-500 font-medium">Pending</p>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-380px)] relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    )}
                    <table className="w-full border-collapse bg-white text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                            <tr>
                                <th className="p-2 border border-gray-100 text-[10px] text-gray-400 uppercase w-10 text-center sticky left-0 z-20 bg-gray-50">#</th>
                                <th className="p-2 border border-gray-100 text-[10px] text-gray-400 uppercase text-left w-52 sticky left-10 z-20 bg-gray-50">Student</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="p-2 border border-gray-100 text-[10px] text-gray-500 uppercase w-24 text-center">{m.substring(0, 3)}</th>
                                ))}
                                <th className="p-2 border border-gray-100 text-[10px] text-emerald-600 uppercase w-20 text-center bg-emerald-50 sticky right-0 z-20">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr><td colSpan={MONTHS.length + 3} className="p-10 text-center text-gray-400">No students found.</td></tr>
                            ) : (
                                filteredStudents.map((s, idx) => {
                                    const studentTotal = MONTHS.reduce((acc, m) => {
                                        const r = feeData[s.studentId]?.[`${m} ${selectedYear}`];
                                        return acc + (r ? r.amount : 0);
                                    }, 0);
                                    return (
                                        <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-2 border border-gray-100 text-center text-xs text-gray-400 bg-gray-50 sticky left-0 z-10">{idx + 1}</td>
                                            <td className="p-2 border border-gray-100 bg-white sticky left-10 z-10">
                                                <div className="font-semibold text-gray-800 text-xs whitespace-nowrap overflow-hidden text-ellipsis w-44">{s.fullName}</div>
                                                <div className="text-[9px] text-gray-400 font-mono">{s.studentId}</div>
                                            </td>
                                            {MONTHS.map(m => {
                                                const monthFull = `${m} ${selectedYear}`;
                                                const record = feeData[s.studentId]?.[monthFull];
                                                const isPaid = !!record;
                                                return (
                                                    <td key={m}
                                                        onClick={() => handleCellClick(s, monthFull)}
                                                        title={isPaid ? `Rs. ${record?.amount}` : `Click to record payment for ${monthFull}`}
                                                        className={clsx(
                                                            "p-0 border border-gray-100 text-center cursor-pointer transition-all relative h-10",
                                                            isPaid ? "bg-emerald-50 hover:bg-emerald-100" : "bg-white hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            {isPaid ? (
                                                                <>
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 rounded-full border border-emerald-200">PAID</span>
                                                                    <span className="text-[8px] text-gray-400 mt-0.5">Rs.{record?.amount}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-200 text-lg opacity-0 hover:opacity-100">+</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 border border-gray-100 text-center text-xs font-bold text-emerald-700 bg-emerald-50 sticky right-0 z-10">
                                                {studentTotal > 0 ? `Rs.${studentTotal}` : "-"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {/* Monthly totals row */}
                        <tfoot className="sticky bottom-0 bg-gray-100 border-t-2 border-gray-200 z-10">
                            <tr>
                                <td colSpan={2} className="p-2 border border-gray-100 text-xs font-bold text-gray-600 sticky left-0 bg-gray-100 z-20">Monthly Total</td>
                                {MONTHS.map(m => (
                                    <td key={m} className="p-2 border border-gray-100 text-center text-[9px] font-bold text-emerald-700">
                                        {monthlyTotals[m] > 0 ? `${monthlyTotals[m].toLocaleString()}` : ""}
                                    </td>
                                ))}
                                <td className="p-2 border border-gray-100 text-center text-xs font-bold text-emerald-800 bg-emerald-100 sticky right-0">
                                    Rs.{totalCollected.toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ParentFeesView({ username }: { username: string }) {
    const [feeRecords, setFeeRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const studentId = localStorage.getItem("userId") || username;
                const res = await fetch(`http://localhost:8080/api/fees/student/${studentId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setFeeRecords(await res.json());
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();
    }, [username]);

    const totalPaid = feeRecords.filter(r => r.status === "PAID").reduce((a, r) => a + (r.amount || 0), 0);
    const paidMonths = feeRecords.filter(r => r.status === "PAID").length;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-6 text-white mb-6 shadow-xl">
                <h2 className="text-xl font-bold mb-1">கட்டண விவரம் (Fee Details)</h2>
                <p className="text-emerald-200 text-sm mb-4">Your payment history</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-300">Rs. {totalPaid.toLocaleString()}</p>
                        <p className="text-xs text-emerald-200">Total Paid</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-amber-300">{paidMonths}</p>
                        <p className="text-xs text-amber-200">Months Paid</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div>
            ) : feeRecords.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                    <p>No fee records found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800">Payment History</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {feeRecords.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{r.month}</p>
                                    {r.notes && <p className="text-xs text-gray-400">{r.notes}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">Rs. {r.amount?.toLocaleString()}</p>
                                    <span className={clsx(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                        r.status === "PAID"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                    )}>
                                        {r.status === "PAID" ? "✓ Paid" : "⚠ Pending"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FeesPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("STAFF");
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedUsername = localStorage.getItem("username");
        if (storedRole) setUserRole(storedRole as any);
        if (storedUsername) setUsername(storedUsername);
    }, []);

    return (
        <AdminLayout userRole={userRole}>
            {userRole === "PARENT" ? (
                <ParentFeesView username={username} />
            ) : (
                <StaffFeesView username={username} />
            )}
        </AdminLayout>
    );
}
