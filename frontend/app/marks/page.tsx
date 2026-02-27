"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Search, Trophy, Loader2, Save } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

// --- Types ---
interface Mark {
    id: number;
    student: { studentId: string; fullName: string, examBatch?: number };
    examName: string;
    subject: string;
    score: number;
    maxScore: number;
    grade: string;
    date: string;
}

interface Student {
    studentId: string;
    fullName: string;
    center?: string;
    medium?: string;
    examBatch?: number;
}

// Fixed Subjects as per user request
const SUBJECTS = ["Tamil", "English", "Maths", "Science", "History"];

// --- Parent / Student View (Unchanged) ---
function ParentMarksView({ username }: { username: string }) {
    const [marks, setMarks] = useState<Mark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:8080/api/marks/student/${username}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMarks(data);
                }
            } catch (err) {
                console.error("Failed to fetch marks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, [username]);

    const groupedMarks = marks.reduce((acc, mark) => {
        if (!acc[mark.examName]) acc[mark.examName] = [];
        acc[mark.examName].push(mark);
        return acc;
    }, {} as Record<string, Mark[]>);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl shadow-xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                        வினாத்தாள் முடிவுகள் (Results)
                    </h1>
                    <p className="text-blue-200 mt-2">ID: <span className="font-mono bg-blue-800 px-2 py-0.5 rounded">{username}</span></p>
                </div>
            </div>

            {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></div> :
                Object.keys(groupedMarks).length === 0 ? <div className="text-center py-10 text-gray-500">No records found.</div> :
                    Object.entries(groupedMarks).map(([examName, examMarks]) => (
                        <div key={examName} className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-blue-50/50 border-b border-blue-100 font-bold text-blue-900">{examName}</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left p-4">
                                    <thead>
                                        <tr className="text-xs uppercase text-gray-400 bg-gray-50">
                                            <th className="p-3">Subject</th>
                                            <th className="p-3">Score</th>
                                            <th className="p-3">Grade</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examMarks.map(m => (
                                            <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{m.subject}</td>
                                                <td className="p-3">{m.score} / {m.maxScore}</td>
                                                <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{m.grade}</span></td>
                                                <td className="p-3">
                                                    {m.grade === 'F' ? <span className="text-red-500 text-xs font-bold">Fail</span> : <span className="text-emerald-600 text-xs font-bold">Pass</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
            }
        </div>
    );
}

// --- Staff View (Excel Grid) ---
function StaffMarksView() {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingMarks, setFetchingMarks] = useState(false);

    // Filters
    const [selectedBatch, setSelectedBatch] = useState("2026");
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [selectedMedium, setSelectedMedium] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // Entry State
    const [examName, setExamName] = useState("Term 1");
    const [maxScore, setMaxScore] = useState("100");

    // Data Grid: { studentId: { subject: score } }
    const [marksGrid, setMarksGrid] = useState<Record<string, Record<string, string>>>({});

    // Fetch Students & Marks
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setFetchingMarks(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Authorization": `Bearer ${token}` };

                // 1. Fetch Students
                const resStudents = await fetch("http://localhost:8080/api/students", { headers });
                const studentsData: Student[] = await resStudents.json();
                setStudents(studentsData);

                // 2. Fetch Existing Marks for Batch & Exam
                // Note: requires backend endpoint or we filter client side from all marks (less efficient but works for now if endpoint fails)
                // Using the specific endpoint created: /api/marks/batch/{examName}/{batch}
                const resMarks = await fetch(`http://localhost:8080/api/marks/batch/${examName}/${selectedBatch}`, { headers });

                if (resMarks.ok) {
                    const marksData: Mark[] = await resMarks.json();

                    // Transform to Grid
                    const grid: Record<string, Record<string, string>> = {};
                    marksData.forEach(m => {
                        if (!grid[m.student.studentId]) grid[m.student.studentId] = {};
                        grid[m.student.studentId][m.subject] = m.score.toString();
                    });
                    setMarksGrid(grid);
                } else {
                    // Fallback: Clear grid if fetch fails (or new exam)
                    setMarksGrid({});
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                setFetchingMarks(false);
            }
        };
        loadData();
    }, [selectedBatch, examName]); // Reload when batch or exam changes

    // Filter Students for View
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
            const studentBatch = s.examBatch ? s.examBatch.toString() : "";
            const matchesBatch = studentBatch === selectedBatch;
            const matchesCenter = selectedCenter === "ALL" || s.center === selectedCenter;
            const matchesMedium = selectedMedium === "ALL" || s.medium === selectedMedium;
            return matchesSearch && matchesBatch && matchesCenter && matchesMedium;
        }).sort((a, b) => a.studentId.localeCompare(b.studentId));
    }, [students, searchTerm, selectedBatch, selectedCenter, selectedMedium]);

    // Calculate Row Stats (Total, Avg, Rank logic could be complex, simple rank by total for now)
    const processedStudents = useMemo(() => {
        return filteredStudents.map(s => {
            const studentMarks = marksGrid[s.studentId] || {};
            let total = 0;
            let count = 0;
            SUBJECTS.forEach(sub => {
                const val = parseFloat(studentMarks[sub] || "0");
                if (!isNaN(val)) {
                    total += val;
                    if (studentMarks[sub] !== undefined) count++; // Only count if entered
                }
            });
            const avg = count > 0 ? (total / count).toFixed(1) : "0";
            return {
                ...s,
                total,
                avg: parseFloat(avg)
            };
        }).sort((a, b) => b.total - a.total); // Sort by total for Rank
    }, [filteredStudents, marksGrid]);

    // Assign Ranks based on sorted order
    const studentsWithRank = useMemo(() => {
        return processedStudents.map((s, index) => ({ ...s, rank: index + 1 }));
    }, [processedStudents]);


    const handleScoreChange = (studentId: string, subject: string, val: string) => {
        setMarksGrid(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [subject]: val
            }
        }));
    };

    const handleSave = async () => {
        // Flatten grid to list of Marks
        const payload = [];
        for (const studentId in marksGrid) {
            for (const subject in marksGrid[studentId]) {
                const score = parseFloat(marksGrid[studentId][subject]);
                if (!isNaN(score)) {
                    payload.push({
                        studentId,
                        examName,
                        subject,
                        score,
                        maxScore: parseFloat(maxScore)
                    });
                }
            }
        }

        if (payload.length === 0) { toast("warning", "No marks entered to save."); return; }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/marks/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) toast("success", `${payload.length} mark(s) saved successfully!`);
            else toast("error", "Failed to save marks. Please try again.");
        } catch (e) { console.error(e); toast("error", "Network error. Please try again."); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header & Controls — Responsive, no hidden md:flex */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div className="flex-1">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Trophy className="h-6 w-6 text-emerald-600" />
                        Marks Entry Grid
                    </h1>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Exam</span>
                            <select value={examName} onChange={e => setExamName(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-bold">
                                <option>Term 1</option> <option>Term 2</option> <option>Term 3</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Batch</span>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-bold">
                                <option>2026</option> <option>2027</option> <option>2028</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <button onClick={handleSave} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Save All
                    </button>
                </div>
            </div>

            {/* Excel Grid Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-340px)] bg-gray-50 relative">
                    {loading || fetchingMarks ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>
                    ) : null}

                    <table className="w-full border-collapse bg-white shadow-sm">
                        <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
                            <tr>
                                <th className="p-3 border border-gray-200 text-xs text-gray-500 uppercase w-12 text-center bg-gray-100 sticky left-0 z-20">#</th>
                                <th className="p-3 border border-gray-200 text-xs text-gray-500 uppercase text-left w-64 bg-gray-100 sticky left-12 z-20">Student Name</th>
                                {SUBJECTS.map(sub => (
                                    <th key={sub} className="p-3 border border-gray-200 text-xs text-gray-500 uppercase w-24 text-center">{sub}</th>
                                ))}
                                <th className="p-3 border border-gray-200 text-xs text-emerald-600 uppercase w-20 bg-emerald-50 text-center font-bold">Total</th>
                                <th className="p-3 border border-gray-200 text-xs text-blue-600 uppercase w-20 bg-blue-50 text-center font-bold">Avg</th>
                                <th className="p-3 border border-gray-200 text-xs text-purple-600 uppercase w-20 bg-purple-50 text-center font-bold">Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsWithRank.length === 0 ? (
                                <tr><td colSpan={SUBJECTS.length + 5} className="p-10 text-center text-gray-400">No students found for this filter.</td></tr>
                            ) : (
                                studentsWithRank.map((s) => (
                                    <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-2 border border-gray-100 text-center text-xs text-gray-400 bg-gray-50 sticky left-0 z-10">{s.rank}</td>
                                        <td className="p-2 border border-gray-100 bg-white sticky left-12 z-10">
                                            <div className="font-bold text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis w-48" title={s.fullName}>{s.fullName}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">{s.studentId}</div>
                                        </td>
                                        {SUBJECTS.map(sub => (
                                            <td key={sub} className="p-1 border border-gray-100">
                                                <input
                                                    type="number"
                                                    className={clsx(
                                                        "w-full h-full px-2 py-2 text-center text-sm font-bold outline-none focus:bg-emerald-50 focus:text-emerald-700 transition-colors",
                                                        marksGrid[s.studentId]?.[sub] ? "text-gray-900" : "text-gray-300"
                                                    )}
                                                    placeholder="-"
                                                    value={marksGrid[s.studentId]?.[sub] || ""}
                                                    onChange={(e) => handleScoreChange(s.studentId, sub, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        <td className="p-2 border border-gray-100 text-center font-bold text-emerald-600 bg-emerald-50/30">{s.total}</td>
                                        <td className="p-2 border border-gray-100 text-center font-bold text-blue-600 bg-blue-50/30">{s.avg}</td>
                                        <td className="p-2 border border-gray-100 text-center font-bold text-purple-600 bg-purple-50/30 text-lg">
                                            {s.rank <= 3 ? <span className="bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200">#{s.rank}</span> : `#{s.rank}`}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function MarksPage() {
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
            {userRole === "PARENT" ? (
                <ParentMarksView username={username} />
            ) : (
                <StaffMarksView />
            )}
        </AdminLayout>
    );
}
