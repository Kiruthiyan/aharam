"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Save, Loader2, CheckCircle, AlertCircle, User, BookOpen,
    Users, ArrowLeft, Plus, GraduationCap, Briefcase, Mail,
    Phone, MapPin, Landmark, Copy, Check
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

// ── Subject Data ───────────────────────────────────────────────────────────────

const SUBJECTS: Record<string, Record<string, { core: string[]; elective?: string[] }>> = {
    "GRADE_6_9": {
        "TAMIL": {
            core: ["தமிழ்", "ஆங்கிலம்", "கணிதம்", "அறிவியல்", "சுகாதாரம்", "தகவல் தொழில்நுட்பம்", "தொழில்நுட்பம்", "புவியியல்", "வரலாறு", "குடியுரிமை", "மதம்"],
        },
        "ENGLISH": {
            core: ["Tamil", "English", "Mathematics", "Science", "Health", "ICT", "Technology", "Geography", "History", "Civics", "Religion"],
        }
    },
    "OL_10_11": {
        "TAMIL": {
            core: ["தமிழ்", "ஆங்கில மொழி", "கணிதம்", "அறிவியல்", "மதம் மற்றும் ஒழுக்கக் கல்வி"],
            elective: ["இரண்டாம் தேசிய மொழி", "தகவல் தொழில்நுட்பம்", "வரலாறு", "குடியியல் கல்வி", "உடற்கல்வி", "புவியியல்", "தொழில்நுட்பம்", "அழகியல் கல்வி", "தொழில் முயற்சி & நிதி அறிவு"],
        },
        "ENGLISH": {
            core: ["Tamil", "English Language", "Mathematics", "Science", "Religion & Value Education"],
            elective: ["Second National Language", "ICT", "History", "Civic Education", "Health & Physical Education", "Geography", "Technology", "Aesthetic Education", "Entrepreneurship & Financial Literacy"],
        }
    },
    "AL": {
        "TAMIL": {
            core: ["கணிதம்", "இயற்பியல்", "வேதியியல்", "உயிரியல்", "இணைந்த கணிதம்", "தகவல் தொழில்நுட்பம்", "கணக்கியல்", "வணிகக் கல்வி", "பொருளாதாரம்", "வரலாறு", "தமிழ்", "ஆங்கிலம்"],
        },
        "ENGLISH": {
            core: ["Mathematics", "Physics", "Chemistry", "Biology", "Combined Mathematics", "ICT", "Accounting", "Business Studies", "Economics", "History", "Tamil", "English"],
        }
    }
};

const GRADE_LABELS: Record<string, string> = {
    "GRADE_6_9": "Grade 6–9 (Foundation)",
    "OL_10_11": "Grade 10–11 (O/L)",
    "AL": "Grade 12–13 (A/L)",
};

export default function StudentRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ message: string; studentId: string; password: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        studentId: "",
        fullName: "",
        fatherName: "",
        fatherOccupation: "",
        motherName: "",
        motherOccupation: "",
        guardianName: "",
        schoolName: "",
        center: "KOKUVIL",
        medium: "TAMIL",
        examBatch: "2026",
        gradeLevel: "OL_10_11",
        subjects: [] as string[],
        address: "",
        email: "",
        parentPhoneNumber: "",
    });

    const [idHint, setIdHint] = useState("KT2026...");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole as any);
        if (storedRole === "SUPER_ADMIN" || storedRole === "STUDENT") {
            window.location.href = "/dashboard";
            return;
        }
    }, []);

    useEffect(() => {
        const c = formData.center === "KOKUVIL" ? "K" : "M";
        const m = formData.medium === "TAMIL" ? "T" : "E";
        setIdHint(`${c}${m}${formData.examBatch}xxx`);
        // Clear subjects when grade level or medium changes
        setFormData(prev => ({ ...prev, subjects: [] }));
    }, [formData.center, formData.medium, formData.examBatch, formData.gradeLevel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const toggleSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const currentSubjects = SUBJECTS[formData.gradeLevel]?.[formData.medium] || { core: [] };

    const handleSubmit = async (redirect: boolean = true) => {
        if (!formData.fullName || !formData.fatherName || !formData.motherName || !formData.parentPhoneNumber) {
            setError("Please fill in all required fields (marked with *).");
            setStep(2);
            return;
        }

        setLoading(true);
        setError(null);

        const payload = { ...formData, subjects: formData.subjects.join(", ") };

        try {
            const res: any = await api.post("/students/register", payload);
            const newStudent = res.data || res;
            const tempPassword = formData.fullName.toLowerCase();
            setSuccess({ message: "Student registered successfully!", studentId: newStudent.studentId, password: tempPassword });

            if (!redirect) {
                setFormData(prev => ({
                    ...prev,
                    studentId: "", fullName: "", fatherName: "", fatherOccupation: "",
                    motherName: "", motherOccupation: "", guardianName: "", schoolName: "",
                    subjects: [], address: "", email: "", parentPhoneNumber: ""
                }));
                setStep(1);
                setTimeout(() => setSuccess(null), 6000);
            } else {
                setTimeout(() => router.push("/students"), 4000);
            }
        } catch (err: any) {
            setError(err.message || "Failed to register student.");
        } finally {
            setLoading(false);
        }
    };

    const copyCredentials = () => {
        if (!success) return;
        navigator.clipboard.writeText(`Student ID: ${success.studentId}\nPassword: ${success.password}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const steps = ["Classification", "Student Info", "Family Details", "Subjects"];

    const inputCls = "w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-900 bg-gray-50/50 focus:bg-white text-sm";
    const labelCls = "block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2";
    const sectionHeadCls = "px-5 sm:px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 to-transparent flex items-center gap-3";

    return (
        <AdminLayout userRole={role}>
            <div className="max-w-4xl mx-auto pb-24">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">New Student Registration</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Enroll a student with complete academic & family details</p>
                    </div>
                </div>

                {/* Step Progress */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex items-center gap-1 sm:gap-2">
                        {steps.map((s, i) => (
                            <button key={i} onClick={() => setStep(i + 1)}
                                className={clsx("flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all", step === i + 1 ? "bg-emerald-50" : "hover:bg-gray-50")}>
                                <div className={clsx("h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all",
                                    step > i + 1 ? "bg-emerald-600 text-white" : step === i + 1 ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20" : "bg-gray-100 text-gray-400")}>
                                    {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                                </div>
                                <span className={clsx("text-[9px] font-black uppercase tracking-wider hidden sm:block", step === i + 1 ? "text-emerald-700" : "text-gray-400")}>
                                    {s}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Success */}
                {success && (
                    <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                            <p className="font-black text-emerald-800">{success.message}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100 space-y-2 mt-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID / Login</p>
                                    <p className="font-black text-gray-900 font-mono tracking-widest text-lg">{success.studentId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Default Password</p>
                                    <p className="font-black text-gray-900">{success.password}</p>
                                </div>
                                <button onClick={copyCredentials}
                                    className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-amber-600 font-bold">⚠ Share credentials with student/parent securely. Password = student name (lowercase).</p>
                        </div>
                        <p className="text-xs text-emerald-600 mt-3 font-medium">Redirecting to student list in 4 seconds…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-sm font-bold text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">

                    {/* STEP 1: CLASSIFICATION */}
                    {step === 1 && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className={sectionHeadCls}>
                                <div className="h-9 w-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                                    <Landmark className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Academic Classification</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Center, medium, grade level and batch year</p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Center</label>
                                    <select name="center" value={formData.center} onChange={handleChange} className={inputCls}>
                                        <option value="KOKUVIL">Kokuvil Center</option>
                                        <option value="MALLAKAM">Mallakam Center</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Medium of Instruction</label>
                                    <select name="medium" value={formData.medium} onChange={handleChange} className={inputCls}>
                                        <option value="TAMIL">Tamil Medium · தமிழ் வழி</option>
                                        <option value="ENGLISH">English Medium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Grade Level</label>
                                    <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className={inputCls}>
                                        {Object.entries(GRADE_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Exam Batch Year</label>
                                    <select name="examBatch" value={formData.examBatch} onChange={handleChange} className={inputCls}>
                                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auto-Generated Student ID Preview</p>
                                        <p className="font-black font-mono text-emerald-700 tracking-widest mt-1">{idHint}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">AUTO GEN</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STUDENT INFO */}
                    {step === 2 && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className={sectionHeadCls}>
                                <div className="h-9 w-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Student Information</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Personal and contact details</p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} required type="text"
                                        className={inputCls} placeholder="E.g. S. Kiruthiyan" />
                                    {formData.fullName && (
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                            Default password will be: <strong className="text-emerald-700">{formData.fullName.toLowerCase()}</strong>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelCls}><Mail className="h-3 w-3 inline mr-1" />Student Email</label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email"
                                        className={inputCls} placeholder="student@example.com" />
                                </div>
                                <div>
                                    <label className={labelCls}><Landmark className="h-3 w-3 inline mr-1" />Current School</label>
                                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} type="text"
                                        className={inputCls} placeholder="School Name" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: FAMILY DETAILS */}
                    {step === 3 && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className={sectionHeadCls}>
                                <div className="h-9 w-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Family & Guardian Details</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Parents and contact information</p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-8 space-y-5">
                                {/* Father */}
                                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Father</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Father's Name <span className="text-red-500">*</span></label>
                                            <input name="fatherName" value={formData.fatherName} onChange={handleChange} required
                                                type="text" className={inputCls} placeholder="Full Name" />
                                        </div>
                                        <div>
                                            <label className={labelCls}><Briefcase className="h-3 w-3 inline mr-1" />Occupation</label>
                                            <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange}
                                                type="text" className={inputCls} placeholder="Occupation" />
                                        </div>
                                    </div>
                                </div>

                                {/* Mother */}
                                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Mother</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Mother's Name <span className="text-red-500">*</span></label>
                                            <input name="motherName" value={formData.motherName} onChange={handleChange} required
                                                type="text" className={inputCls} placeholder="Full Name" />
                                        </div>
                                        <div>
                                            <label className={labelCls}><Briefcase className="h-3 w-3 inline mr-1" />Occupation</label>
                                            <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange}
                                                type="text" className={inputCls} placeholder="Occupation" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls}><Phone className="h-3 w-3 inline mr-1 text-emerald-600" />Primary Phone <span className="text-red-500">*</span></label>
                                        <input name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange}
                                            required type="tel" className={inputCls} placeholder="+94 7X XXX XXXX" />
                                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5">📱 Used for WhatsApp notifications</p>
                                    </div>
                                    <div>
                                        <label className={labelCls}><MapPin className="h-3 w-3 inline mr-1" />Home Address</label>
                                        <input name="address" value={formData.address} onChange={handleChange}
                                            type="text" className={inputCls} placeholder="Street, City" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SUBJECTS */}
                    {step === 4 && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className={sectionHeadCls}>
                                <div className="h-9 w-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Subject Enrollment</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {GRADE_LABELS[formData.gradeLevel]} · {formData.medium === "TAMIL" ? "Tamil Medium" : "English Medium"}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-8 space-y-6">
                                {/* Core Subjects */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                                            {formData.gradeLevel === "OL_10_11" ? "Compulsory Core Subjects" : "Core Subjects"}
                                        </p>
                                        <button type="button" onClick={() => {
                                            const allCore = currentSubjects.core;
                                            const allSelected = allCore.every(s => formData.subjects.includes(s));
                                            setFormData(prev => ({
                                                ...prev,
                                                subjects: allSelected
                                                    ? prev.subjects.filter(s => !allCore.includes(s))
                                                    : [...new Set([...prev.subjects, ...allCore])]
                                            }));
                                        }} className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-wider">
                                            {currentSubjects.core.every(s => formData.subjects.includes(s)) ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        {currentSubjects.core.map(subject => (
                                            <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                                                className={clsx(
                                                    "flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-left",
                                                    formData.subjects.includes(subject)
                                                        ? "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/10"
                                                        : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/40"
                                                )}>
                                                <span className="truncate">{subject}</span>
                                                <div className={clsx("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all",
                                                    formData.subjects.includes(subject)
                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                        : "border-gray-300"
                                                )}>
                                                    {formData.subjects.includes(subject) && <Check className="h-3 w-3" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Elective Subjects (O/L only) */}
                                {currentSubjects.elective && (
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
                                            Elective Stream Subjects (Optional)
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                            {currentSubjects.elective.map(subject => (
                                                <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                                                    className={clsx(
                                                        "flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-left",
                                                        formData.subjects.includes(subject)
                                                            ? "bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/10"
                                                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/40"
                                                    )}>
                                                    <span className="truncate">{subject}</span>
                                                    <div className={clsx("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all",
                                                        formData.subjects.includes(subject)
                                                            ? "bg-blue-600 border-blue-600 text-white"
                                                            : "border-gray-300"
                                                    )}>
                                                        {formData.subjects.includes(subject) && <Check className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest w-full mb-1">
                                            {formData.subjects.length} Subject{formData.subjects.length !== 1 ? "s" : ""} Selected
                                        </p>
                                        {formData.subjects.map(s => (
                                            <span key={s} className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        ← Back
                    </button>

                    <div className="flex items-center gap-1.5">
                        {steps.map((_, i) => (
                            <div key={i} className={clsx("h-1.5 rounded-full transition-all", step === i + 1 ? "w-6 bg-emerald-600" : step > i + 1 ? "w-3 bg-emerald-400" : "w-3 bg-gray-200")} />
                        ))}
                    </div>

                    {step < 4 ? (
                        <button type="button" onClick={() => setStep(s => Math.min(4, s + 1))}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-lg shadow-emerald-900/10">
                            Next →
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleSubmit(false)} disabled={loading}
                                className="px-4 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 text-sm font-black hover:bg-emerald-50 transition-all disabled:opacity-50">
                                <Plus className="h-4 w-4 inline mr-1" />Next
                            </button>
                            <button type="button" onClick={() => handleSubmit(true)} disabled={loading}
                                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50 flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                                Register
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
