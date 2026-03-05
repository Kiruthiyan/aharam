"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import {
    BookOpen, Plus, Loader2, Save, Award,
    ChevronRight, ArrowRight, CheckCircle2,
    AlertCircle, Calendar, Activity, X,
    BarChart3, Users, TrendingUp, Trophy
} from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";
import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Exam {
    id: number;
    name: string;
    batch: string;
    subject: string;
    maxMarks: number;
    examDate: string;
    status: "UPCOMING" | "COMPLETED" | "ARCHIVED";
}

interface Student {
    studentId: string;
    fullName: string;
    gender?: string;
    examBatch?: number;
    phone?: string;
}

interface Mark {
    id: number;
    student: { studentId: string; fullName: string };
    exam: { id: number; name: string; subject: string; maxMarks: number };
    marksObtained: number;
    grade: string;
    remarks?: string;
}

// ── Create Exam Modal ─────────────────────────────────────────────────────────

function CreateExamModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const { toast } = useToast();
    const [form, setForm] = useState({
        name: "",
        batch: "2026",
        subject: "Mathematics",
        maxMarks: "100",
        examDate: new Date().toISOString().split("T")[0],
        status: "UPCOMING"
    });
    const [saving, setSaving] = useState(false);

    const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Tamil", "English", "History"];
    const BATCHES = ["2024", "2025", "2026", "2027"];

    const handleCreate = async () => {
        if (!form.name || !form.examDate) return toast("error", "Please fill all required fields.");
        setSaving(true);
        try {
            const staffId = localStorage.getItem("userId") || "1";
            await api.post(`/marks/exams/create?staffId=${staffId}`, { ...form, maxMarks: parseFloat(form.maxMarks) });
            toast("success", "Examination scheduled successfully.");
            onCreated();
            onClose();
        } catch (err: any) { toast("error", err.message || "Failed to create exam."); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden scale-in-center">
                {/* Header */}
                <div className="bg-emerald-900 p-5 sm:px-8 sm:py-8 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Schedule Examination</h2>
                        <p className="text-emerald-300 text-xs sm:text-sm font-medium mt-1">Create a new assessment for your batch</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-white/10 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Exam Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Term 1 Final Exam"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner placeholder:text-gray-300"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Batch *</label>
                            <select value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm cursor-pointer">
                                {BATCHES.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Subject *</label>
                            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm cursor-pointer">
                                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Max Marks *</label>
                            <input
                                type="number"
                                value={form.maxMarks}
                                onChange={e => setForm({ ...form, maxMarks: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Exam Date *</label>
                            <input
                                type="date"
                                value={form.examDate}
                                onChange={e => setForm({ ...form, examDate: e.target.value })}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="flex-1 border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-black hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600 transition-all tracking-wide">Cancel</button>
                        <button onClick={handleCreate} disabled={saving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 tracking-wide">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                            Create Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Staff Academic View ───────────────────────────────────────────────────────

function StaffAcademicView() {
    const { toast } = useToast();
    const [view, setView] = useState<"EXAMS" | "ENTRY">("EXAMS");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Helpers
    const openWhatsApp = (phone: string, text: string) => {
        if (!phone) return;
        const clean = phone.replace(/\D/g, "");
        const number = clean.startsWith("0") ? "94" + clean.slice(1) : clean;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
    };

    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [marksGrid, setMarksGrid] = useState<Record<string, { score: string; remarks: string }>>({});

    const [batch, setBatch] = useState("2026");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchExams(); }, [batch]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res: any = await api.get(`/marks/exams/batch/${batch}`);
            setExams(res.data || res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const openMarkEntry = async (exam: Exam) => {
        setSelectedExam(exam);
        setMarksGrid({});
        setLoading(true);
        try {
            const res: any = await api.get("/students");
            const all: Student[] = res.data || res;
            setStudents(all.filter(s => s.examBatch?.toString() === exam.batch));
        } catch { toast("error", "Failed to load students."); } finally { setLoading(false); }
        setView("ENTRY");
    };

    const handleMarkChange = (sid: string, field: "score" | "remarks", value: string) => {
        setMarksGrid(prev => ({
            ...prev,
            [sid]: { ...(prev[sid] || { score: "", remarks: "" }), [field]: value }
        }));
    };

    const calculateGrade = (score: string, max: number) => {
        const s = parseFloat(score);
        if (isNaN(s) || score === "") return "—";
        const p = (s / max) * 100;
        if (p >= 90) return "A";
        if (p >= 75) return "B";
        if (p >= 65) return "C";
        if (p >= 50) return "S";
        return "F";
    };

    const gradeColor = (grade: string) => clsx(
        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border",
        grade === "A" && "bg-emerald-50 text-emerald-700 border-emerald-100",
        grade === "B" && "bg-blue-50 text-blue-700 border-blue-100",
        grade === "C" && "bg-cyan-50 text-cyan-700 border-cyan-100",
        grade === "S" && "bg-amber-50 text-amber-700 border-amber-100",
        grade === "F" && "bg-red-50 text-red-600 border-red-100",
        grade === "—" && "bg-gray-50 text-gray-400 border-gray-100",
    );

    const submitMarks = async () => {
        if (!selectedExam) return;
        const entries = Object.entries(marksGrid)
            .filter(([_, d]) => d.score !== "" && !isNaN(parseFloat(d.score)))
            .map(([sid, d]) => ({ studentId: sid, score: parseFloat(d.score), remarks: d.remarks || "" }));

        if (entries.length === 0) { toast("error", "No marks entered."); return; }

        setSubmitting(true);
        try {
            const userId = localStorage.getItem("userId") || "1";
            await api.post("/marks/bulk-save", { examId: selectedExam.id, staffId: userId, entries });

            toast("success", `${entries.length} marks saved successfully.`);

            // Open WhatsApp auto-message fallback for each entered score delay sending mildly to allow browser popups
            entries.forEach((entry, i) => {
                const student = students.find(s => s.studentId === entry.studentId);
                if (student?.phone) {
                    const grade = calculateGrade(entry.score.toString(), selectedExam.maxMarks);
                    setTimeout(() => {
                        openWhatsApp(student.phone!, `📊 *Result Published*\n\n${student.fullName}'s result for ${selectedExam.subject} is out.\n\nScore: ${entry.score}/${selectedExam.maxMarks}\nGrade: ${grade}\n\n— Aharam Academy`);
                    }, i * 600); // Stagger popups so browser doesn't block them
                }
            });

            setView("EXAMS");
        } catch (err: any) { toast("error", err.message || "Failed to save marks."); } finally { setSubmitting(false); }
    };

    const enteredCount = Object.values(marksGrid).filter(d => d.score !== "").length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {showCreateModal && (
                <CreateExamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={fetchExams}
                />
            )}

            {/* Page Header */}
            <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">Academic Module</h1>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Marks entry &amp; examination management</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                    <select
                        disabled={view === "ENTRY"}
                        value={batch} onChange={e => setBatch(e.target.value)}
                        className="bg-white border text-gray-700 border-gray-200 px-5 py-3 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {["2024", "2025", "2026", "2027"].map(b => <option key={b}>Batch {b}</option>)}
                    </select>
                    {view === "EXAMS" && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-sm transition-all shadow-emerald-900/10 hover:shadow-md active:scale-95"
                        >
                            <Plus className="h-4 w-4" /> New Exam
                        </button>
                    )}
                    {view === "ENTRY" && (
                        <button onClick={() => setView("EXAMS")} className="px-6 py-3 border border-gray-200 bg-white rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all flex items-center gap-2 active:scale-95">
                            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Exams
                        </button>
                    )}
                </div>
            </div>

            {/* ── EXAMS LIST ─────────────────────────────────────────────── */}
            {view === "EXAMS" && (
                <>
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="bg-white py-24 rounded-[2rem] border-2 border-dashed border-gray-200/50 text-center">
                            <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <Activity className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">No Exams Scheduled</h3>
                            <p className="text-sm text-gray-400 mt-2 mb-6 max-w-sm mx-auto font-medium">Click "New Exam" to create the first assessment for this batch's academic term.</p>
                            <button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black inline-flex items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all hover:-translate-y-0.5 tracking-wide">
                                <Plus className="h-5 w-5" /> Schedule First Exam
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 transition-colors flex items-center justify-center border border-gray-100 group-hover:border-emerald-100 shadow-sm">
                                            <BookOpen className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <span className={clsx(
                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            exam.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : exam.status === "ARCHIVED" ? "bg-gray-50 text-gray-400 border-gray-100"
                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                        )}>
                                            {exam.status}
                                        </span>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-xl font-black text-gray-900 mb-1">{exam.name}</h4>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">{exam.subject}</p>
                                        <p className="text-sm text-gray-500 font-medium">Max: <span className="text-gray-900 font-bold">{exam.maxMarks}</span> marks</p>
                                    </div>

                                    <div className="mt-8 pt-5 border-t border-gray-100/50 flex items-center justify-between group-hover:border-emerald-50 transition-colors">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {new Date(exam.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                        </div>
                                        <button
                                            onClick={() => openMarkEntry(exam)}
                                            className="h-10 w-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 shadow-md group-hover:shadow-lg transition-all"
                                            title="Enter Marks"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── MARKS ENTRY ────────────────────────────────────────────── */}
            {view === "ENTRY" && selectedExam && (
                <div className="space-y-6">
                    {/* Entry Header */}
                    <div className="bg-emerald-900 text-white px-8 py-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                            <BookOpen className="h-48 w-48 text-emerald-100" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black tracking-tight">{selectedExam.name}</h2>
                            <p className="text-emerald-300 text-sm font-black uppercase tracking-widest mt-2 flex flex-wrap gap-2 items-center">
                                <span className="bg-emerald-800/80 px-3 py-1 rounded-lg">{selectedExam.subject}</span>
                                <span>·</span>
                                <span>Batch {selectedExam.batch}</span>
                                <span>·</span>
                                <span className="text-white bg-emerald-700 px-3 py-1 rounded-lg">Max {selectedExam.maxMarks} Marks</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-black/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10 flex flex-col items-center min-w-[120px]">
                                <span className="text-2xl font-black text-white leading-none mb-1">{enteredCount} <span className="text-base text-emerald-400">/ {students.length}</span></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Entered</span>
                            </div>
                            <button
                                onClick={submitMarks}
                                disabled={submitting || enteredCount === 0}
                                className="bg-white text-emerald-900 px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-50 shadow-lg shadow-black/20 hover:shadow-xl transition-all disabled:opacity-50 tracking-wide active:scale-95"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Session
                            </button>
                        </div>
                    </div>

                    {/* Marks Table */}
                    {loading ? (
                        <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
                    ) : students.length === 0 ? (
                        <div className="bg-white py-24 rounded-[2rem] border-2 border-dashed border-gray-200/50 text-center">
                            <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <Users className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">No Students Enrolled</h3>
                            <p className="text-sm text-gray-400 mt-2 font-medium">No active students found for Batch {selectedExam.batch}.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden pb-10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            {["#", "Student", "Gender", "Marks", "Grade", "Remarks"].map((h, i) => (
                                                <th key={h} className={clsx(
                                                    "px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest",
                                                    i === 3 && "text-center", h === "Remarks" && "w-1/3"
                                                )}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {students.map((s, idx) => {
                                            const entry = marksGrid[s.studentId] || { score: "", remarks: "" };
                                            const grade = calculateGrade(entry.score, selectedExam.maxMarks);
                                            const scoreNum = parseFloat(entry.score);
                                            const overMax = !isNaN(scoreNum) && scoreNum > selectedExam.maxMarks;
                                            return (
                                                <tr key={s.studentId} className="hover:bg-emerald-50/30 transition-colors group">
                                                    <td className="px-8 py-5 text-sm font-black text-gray-300 group-hover:text-emerald-300">{idx + 1}</td>
                                                    <td className="px-8 py-5">
                                                        <p className="font-black text-gray-900 text-base">{s.fullName}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5">{s.studentId}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">{s.gender || "—"}</td>
                                                    <td className="px-8 py-5">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={selectedExam.maxMarks}
                                                            value={entry.score}
                                                            onChange={e => handleMarkChange(s.studentId, "score", e.target.value)}
                                                            className={clsx(
                                                                "w-28 mx-auto block bg-white border-2 px-4 py-3 rounded-2xl text-center font-black text-base outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner transition-all",
                                                                overMax ? "border-red-300 bg-red-50 text-red-600 focus:ring-red-500/10 focus:border-red-500" : "border-gray-200"
                                                            )}
                                                            placeholder="—"
                                                        />
                                                        {overMax && <p className="text-[10px] text-red-500 font-bold mt-2 text-center bg-red-50 py-1 rounded w-fit mx-auto px-2">Max {selectedExam.maxMarks}</p>}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className={clsx(gradeColor(grade), "h-12 w-12 text-base shadow-sm")}>{grade}</div>
                                                    </td>
                                                    <td className="px-8 py-5 pr-12">
                                                        <input
                                                            type="text"
                                                            value={entry.remarks}
                                                            onChange={e => handleMarkChange(s.studentId, "remarks", e.target.value)}
                                                            className="w-full bg-gray-50/50 border border-gray-100 focus:bg-white px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300"
                                                            placeholder="Add specific observations..."
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Admin Academic View ───────────────────────────────────────────────────────

function AdminAcademicView() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Overview</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">Center-wide performance analytics for all batches</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Active Exams", value: "—", sub: "Scheduled", icon: BookOpen, color: "bg-blue-50 text-blue-600 border border-blue-100" },
                    { title: "Pass Rate", value: "—", sub: "Overall", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
                    { title: "Top Performers", value: "—", sub: "This Term", icon: Trophy, color: "bg-amber-50 text-amber-600 border border-amber-100" },
                ].map(c => (
                    <div key={c.title} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group">
                        <div className={clsx("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform", c.color)}>
                            <c.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{c.value}</p>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{c.title} <span className="text-gray-300 ml-1">{c.sub}</span></p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-16 rounded-[2rem] border-2 border-dashed border-gray-200/50 text-center">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <BarChart3 className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Analytics Dashboard Coming Soon</h3>
                <p className="text-sm text-gray-400 font-medium mt-2 max-w-sm mx-auto">Performance charts and center-wide comparisons will appear as exam marks are submitted.</p>
            </div>
        </div>
    );
}

// ── Student Academic View ─────────────────────────────────────────────────────

function StudentAcademicView({ username }: { username: string }) {
    const [marks, setMarks] = useState<Mark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res: any = await api.get(`/marks/student/${username}`);
                setMarks(res.data || res);
            } catch { } finally { setLoading(false); }
        };
        if (username) load();
    }, [username]);

    const stats = useMemo(() => {
        if (!marks.length) return { avg: 0, passRate: 0, total: 0 };
        const avgSum = marks.reduce((a, m) => a + (m.marksObtained / m.exam.maxMarks * 100), 0);
        return {
            avg: Math.round(avgSum / marks.length),
            passRate: Math.round((marks.filter(m => m.grade !== "F").length / marks.length) * 100),
            total: marks.length
        };
    }, [marks]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-5 transform rotate-6 scale-110"><Trophy className="h-64 w-64" /></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                <Trophy className="h-6 w-6 text-emerald-100" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">My Academic Record</h2>
                        </div>
                        <p className="text-emerald-100/80 text-sm font-medium pl-1">Review your results and track your progress</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-black/20 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 min-w-[120px] shadow-inner">
                            <p className="text-4xl font-black tracking-tight">{stats.avg}%</p>
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-2">Avg Score</p>
                        </div>
                        <div className="text-center bg-black/20 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 min-w-[120px] shadow-inner">
                            <p className="text-4xl font-black tracking-tight">{stats.passRate}%</p>
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-2">Pass Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="py-24 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
            ) : marks.length === 0 ? (
                <div className="bg-white py-24 rounded-[2rem] border-2 border-dashed border-gray-200/50 text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">No Results Available</h3>
                    <p className="text-sm text-gray-400 mt-2 font-medium max-w-sm mx-auto">Results will appear here once your teacher assesses and submits your marks for recent exams.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden pb-4">
                    <div className="p-8 border-b border-gray-100">
                        <h3 className="font-black text-gray-900 tracking-tight text-lg">Examination Results</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    {["Examination", "Subject", "Score", "Percentage", "Grade", "Remarks"].map((h, i) => (
                                        <th key={h} className={clsx("px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest", i === 3 && "w-1/4")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {marks.map(m => {
                                    const pct = Math.round((m.marksObtained / m.exam.maxMarks) * 100);
                                    return (
                                        <tr key={m.id} className="hover:bg-emerald-50/30 transition-colors group">
                                            <td className="px-8 py-6 font-black text-gray-900 text-base">{m.exam.name}</td>
                                            <td className="px-8 py-6 text-xs font-black text-emerald-600 uppercase tracking-wide">{m.exam.subject}</td>
                                            <td className="px-8 py-6 text-lg font-black text-gray-900 tracking-tight">{m.marksObtained}<span className="text-gray-300 mx-1">/</span><span className="text-gray-400 font-bold text-xs">{m.exam.maxMarks}</span></td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <div style={{ width: `${pct}%` }} className={clsx("h-full rounded-full transition-all duration-1000", pct >= 65 ? "bg-emerald-500" : "bg-red-400")} />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-600 w-8 flex-shrink-0">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "inline-flex h-10 w-10 items-center justify-center rounded-xl font-black border text-sm shadow-sm",
                                                    m.grade === "F" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                )}>{m.grade}</span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-gray-400">{m.remarks || "—"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page Export ───────────────────────────────────────────────────────────────

export default function MarksPage() {
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [sub, setSub] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedSub = localStorage.getItem("username") || localStorage.getItem("userId") || "";
        if (storedRole) setRole(storedRole as any);
        setSub(storedSub);
    }, []);

    return (
        <AdminLayout userRole={role}>
            <div className="p-2 sm:p-4">
                {role === "STUDENT" ? <StudentAcademicView username={sub} />
                    : role === "SUPER_ADMIN" ? <AdminAcademicView />
                        : <StaffAcademicView />}
            </div>
        </AdminLayout>
    );
}
