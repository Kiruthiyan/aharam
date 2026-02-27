"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import { Calendar, Save, Search, ChevronLeft, ChevronRight, Check, X, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

interface Student {
    studentId: string;
    fullName: string;
    examBatch?: number;
    center?: string;
    medium?: string;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

function StaffAttendanceView({ username }: { username: string }) {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, Record<number, "PRESENT" | "ABSENT">>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const date = new Date();
    const [selectedYear, setSelectedYear] = useState(date.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(date.getMonth());
    const [selectedBatch, setSelectedBatch] = useState("2026");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const daysInMonth = useMemo(() => getDaysInMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };
                const resStudents = await fetch("http://localhost:8080/api/students", { headers });
                const studentsData: Student[] = await resStudents.json();
                setStudents(studentsData);

                const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
                const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${daysInMonth}`;
                const resAtt = await fetch(`http://localhost:8080/api/attendance/batch/${selectedBatch}?start=${startDate}&end=${endDate}`, { headers });

                if (resAtt.ok) {
                    const data: any[] = await resAtt.json();
                    const grid: Record<string, Record<number, "PRESENT" | "ABSENT">> = {};
                    data.forEach(r => {
                        const day = parseInt(r.date.split("-")[2]);
                        const sId = r.student?.studentId || r.studentId;
                        if (!grid[sId]) grid[sId] = {};
                        grid[sId][day] = r.status;
                    });
                    setAttendanceData(grid);
                } else {
                    setAttendanceData({});
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedBatch, selectedYear, selectedMonth, daysInMonth]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBatch = (s.examBatch?.toString() || "") === selectedBatch;
            const matchesCenter = selectedCenter === "ALL" || s.center === selectedCenter;
            return matchesSearch && matchesBatch && matchesCenter;
        }).sort((a, b) => a.studentId.localeCompare(b.studentId));
    }, [students, searchTerm, selectedBatch, selectedCenter]);

    const toggleStatus = (studentId: string, day: number) => {
        setAttendanceData(prev => {
            const currentStatus = prev[studentId]?.[day];
            const next = currentStatus === "PRESENT" ? "ABSENT" : "PRESENT";
            return { ...prev, [studentId]: { ...(prev[studentId] || {}), [day]: next } };
        });
    };

    const handleSave = async () => {
        const payload: any[] = [];
        const yearStr = selectedYear;
        const monthStr = String(selectedMonth + 1).padStart(2, "0");
        for (const studentId in attendanceData) {
            for (const dayStr in attendanceData[studentId]) {
                const day = parseInt(dayStr);
                const status = attendanceData[studentId][day];
                payload.push({ studentId, date: `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`, status, recordedBy: username });
            }
        }
        if (payload.length === 0) { toast("warning", "No attendance to save."); return; }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/attendance/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) toast("success", `Attendance saved for ${payload.length} records!`);
            else toast("error", "Failed to save attendance.");
        } catch (e) {
            toast("error", "Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Summary Stats
    const summaryStats = useMemo(() => {
        let totalPresent = 0, totalAbsent = 0, totalEmpty = 0;
        filteredStudents.forEach(s => {
            daysArray.forEach(day => {
                const st = attendanceData[s.studentId]?.[day];
                if (st === "PRESENT") totalPresent++;
                else if (st === "ABSENT") totalAbsent++;
                else totalEmpty++;
            });
        });
        return { totalPresent, totalAbsent, totalEmpty };
    }, [filteredStudents, attendanceData, daysArray]);

    return (
        <div className="flex flex-col gap-4">
            {/* Controls Bar — Fully responsive, no more `hidden md:flex` */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h1 className="text-base font-bold flex items-center gap-2 text-gray-800">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        Attendance Register — {monthName} {selectedYear}
                    </h1>
                    {/* Month Nav */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 1); setSelectedYear(d.getFullYear()); setSelectedMonth(d.getMonth()); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        <span className="font-bold text-sm w-28 text-center">{monthName} {selectedYear}</span>
                        <button onClick={() => { const d = new Date(selectedYear, selectedMonth + 1); setSelectedYear(d.getFullYear()); setSelectedMonth(d.getMonth()); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-between">
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

            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-emerald-700">{summaryStats.totalPresent}</p>
                    <p className="text-xs text-emerald-600 font-medium">Present</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-red-600">{summaryStats.totalAbsent}</p>
                    <p className="text-xs text-red-500 font-medium">Absent</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-600">{summaryStats.totalEmpty}</p>
                    <p className="text-xs text-gray-500 font-medium">Not Marked</p>
                </div>
            </div>

            {/* Mobile Card View */}
            {isMobile ? (
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No students found.</div>
                    ) : (
                        filteredStudents.map((s, idx) => {
                            const present = daysArray.filter(d => attendanceData[s.studentId]?.[d] === "PRESENT").length;
                            const absent = daysArray.filter(d => attendanceData[s.studentId]?.[d] === "ABSENT").length;
                            const marked = present + absent;
                            const pct = marked > 0 ? Math.round((present / marked) * 100) : 0;
                            return (
                                <div key={s.studentId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                                            {s.fullName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{s.fullName}</p>
                                            <p className="text-xs text-gray-400 font-mono">{s.studentId}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-sm font-bold text-emerald-700">{pct}%</p>
                                            <p className="text-[10px] text-gray-400">{present}/{marked}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {daysArray.map(day => {
                                            const status = attendanceData[s.studentId]?.[day];
                                            const d = new Date(selectedYear, selectedMonth, day);
                                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => toggleStatus(s.studentId, day)}
                                                    className={clsx(
                                                        "h-7 w-7 rounded-md text-[10px] font-bold transition-all",
                                                        status === "PRESENT" && "bg-emerald-500 text-white",
                                                        status === "ABSENT" && "bg-red-400 text-white",
                                                        !status && isWeekend && "bg-gray-100 text-gray-300",
                                                        !status && !isWeekend && "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    )}
                                                >{day}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Desktop Excel Grid */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-auto max-h-[calc(100vh-340px)] relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
                        )}
                        <table className="w-full border-collapse bg-white text-sm">
                            <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                                <tr>
                                    <th className="p-2 border border-gray-100 text-[10px] text-gray-400 uppercase w-10 text-center sticky left-0 z-20 bg-gray-50">#</th>
                                    <th className="p-2 border border-gray-100 text-[10px] text-gray-400 uppercase text-left w-52 sticky left-10 z-20 bg-gray-50">Student</th>
                                    {daysArray.map(day => {
                                        const d = new Date(selectedYear, selectedMonth, day);
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <th key={day} className={clsx(
                                                "p-1 border border-gray-100 text-[10px] font-bold text-center w-8 min-w-[32px]",
                                                isWeekend ? "text-red-400 bg-red-50" : "text-gray-500"
                                            )}>
                                                {day}<br />{d.toLocaleDateString("en-US", { weekday: "narrow" })}
                                            </th>
                                        );
                                    })}
                                    <th className="p-2 border border-gray-100 text-[10px] text-emerald-600 uppercase w-12 text-center bg-emerald-50 sticky right-0 z-20">P%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr><td colSpan={daysInMonth + 3} className="p-10 text-center text-gray-400">No students found.</td></tr>
                                ) : (
                                    filteredStudents.map((s, idx) => {
                                        const present = daysArray.filter(d => attendanceData[s.studentId]?.[d] === "PRESENT").length;
                                        const marked = daysArray.filter(d => !!attendanceData[s.studentId]?.[d]).length;
                                        const pct = marked > 0 ? Math.round((present / marked) * 100) : 0;
                                        return (
                                            <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-2 border border-gray-100 text-center text-xs text-gray-400 bg-gray-50 sticky left-0 z-10">{idx + 1}</td>
                                                <td className="p-2 border border-gray-100 bg-white sticky left-10 z-10">
                                                    <div className="font-semibold text-gray-800 text-xs whitespace-nowrap overflow-hidden text-ellipsis w-44">{s.fullName}</div>
                                                    <div className="text-[9px] text-gray-400 font-mono">{s.studentId}</div>
                                                </td>
                                                {daysArray.map(day => {
                                                    const status = attendanceData[s.studentId]?.[day];
                                                    const d = new Date(selectedYear, selectedMonth, day);
                                                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                    return (
                                                        <td key={day}
                                                            onClick={() => toggleStatus(s.studentId, day)}
                                                            className={clsx(
                                                                "p-0 border border-gray-100 text-center cursor-pointer transition-colors",
                                                                isWeekend ? "bg-gray-50" : "bg-white",
                                                                status === "PRESENT" && "!bg-emerald-100",
                                                                status === "ABSENT" && "!bg-red-100",
                                                                !status && "hover:bg-gray-100"
                                                            )}
                                                        >
                                                            <div className="h-8 flex items-center justify-center">
                                                                {status === "PRESENT" && <Check className="h-3 w-3 text-emerald-600" />}
                                                                {status === "ABSENT" && <X className="h-3 w-3 text-red-500" />}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td className={clsx(
                                                    "p-2 border border-gray-100 text-center text-xs font-bold sticky right-0 z-10",
                                                    pct >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                                                )}>
                                                    {pct}%
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function ParentAttendanceView({ username }: { username: string }) {
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const studentId = localStorage.getItem("userId") || username;
                const res = await fetch(`http://localhost:8080/api/attendance/student/${studentId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setAttendanceData(await res.json());
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchData();
    }, [username]);

    const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" });
    const monthData = attendanceData.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
    const statusMap: Record<string, string> = {};
    monthData.forEach(r => { statusMap[r.date?.split("T")[0] || r.date] = r.status; });

    const presentCount = monthData.filter(r => r.status === "PRESENT").length;
    const absentCount = monthData.filter(r => r.status === "ABSENT").length;
    const pct = (presentCount + absentCount) > 0 ? Math.round((presentCount / (presentCount + absentCount)) * 100) : 0;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-6 text-white mb-6 shadow-xl">
                <h2 className="text-xl font-bold mb-2">வரவு பதிவு (My Attendance)</h2>
                <div className="flex items-center gap-4 mt-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold">{pct}%</p>
                        <p className="text-emerald-200 text-xs">This Month</p>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-emerald-300">{presentCount}</p>
                            <p className="text-xs text-emerald-200">Present</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-red-300">{absentCount}</p>
                            <p className="text-xs text-red-200">Absent</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Month Nav */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 1); setSelectedYear(d.getFullYear()); setSelectedMonth(d.getMonth()); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                <h3 className="font-bold text-gray-900">{monthName} {selectedYear}</h3>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth + 1); setSelectedYear(d.getFullYear()); setSelectedMonth(d.getMonth()); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>

            {/* Calendar */}
            {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div> : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="grid grid-cols-7 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {/* Leading blank cells */}
                        {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }, (_, i) => (
                            <div key={`blank-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const status = statusMap[dateStr];
                            const isToday = new Date().toISOString().split("T")[0] === dateStr;
                            return (
                                <div key={day} className={clsx(
                                    "aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-bold",
                                    status === "PRESENT" && "bg-emerald-500 text-white",
                                    status === "ABSENT" && "bg-red-400 text-white",
                                    !status && "bg-gray-50 text-gray-400",
                                    isToday && !status && "ring-2 ring-emerald-500"
                                )}>
                                    {day}
                                    {status === "PRESENT" && <Check className="h-2 w-2 mt-0.5" />}
                                    {status === "ABSENT" && <X className="h-2 w-2 mt-0.5" />}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4 mt-4 justify-center text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="h-3 w-3 bg-emerald-500 rounded" /> Present</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 bg-red-400 rounded" /> Absent</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 bg-gray-100 rounded border border-gray-200" /> Not Marked</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AttendancePage() {
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
                <ParentAttendanceView username={username} />
            ) : (
                <StaffAttendanceView username={username} />
            )}
        </AdminLayout>
    );
}
