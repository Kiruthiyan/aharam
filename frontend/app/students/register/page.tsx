"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, AlertCircle, Info, User, BookOpen, Users, ArrowLeft, Plus, GraduationCap, Briefcase, Mail, Phone, MapPin, Landmark } from "lucide-react";
import clsx from "clsx";

const SUBJECT_OPTIONS = [
    "Physics", "Chemistry", "Combined Mathematics", "Biology", 
    "Agricultural Science", "ICT", "Accounting", "Business Studies", 
    "Economics", "History", "Logic", "Tamil", "English"
];

export default function StudentRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");

    // Form Data
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
        subjects: [] as string[],
        address: "",
        email: "",
        parentPhoneNumber: "",
    });

    // Auto-generate ID prefix hint
    const [idHint, setIdHint] = useState("KT2026...");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setRole(storedRole as any);
        if (storedRole === "SUPER_ADMIN" || storedRole === "STUDENT") {
            window.location.href = "/dashboard";
            return;
        }
        
        const c = formData.center === "KOKUVIL" ? "K" : "M";
        const m = formData.medium === "TAMIL" ? "T" : "E";
        setIdHint(`${c}${m}${formData.examBatch}xxx`);
    }, [formData.center, formData.medium, formData.examBatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (success || error) {
            setSuccess(null);
            setError(null);
        }
    };

    const toggleSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject) 
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const handleSubmit = async (e: React.FormEvent, redirect: boolean = true) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);

        const payload = {
            ...formData,
            subjects: formData.subjects.join(", ")
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/students/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newStudent = await res.json();
                const loginId = newStudent.studentId;
                const tempPassword = formData.fullName.toLowerCase();
                
                setSuccess(
                    `Success! Student registered.\n` +
                    `Student ID: ${newStudent.studentId}\n` +
                    `Login ID: ${loginId}\n` +
                    `Password: ${tempPassword}`
                );
                
                if (redirect) {
                    setTimeout(() => router.push("/students"), 3500);
                } else {
                    setFormData(prev => ({
                        ...prev,
                        studentId: "",
                        fullName: "",
                        fatherName: "",
                        fatherOccupation: "",
                        motherName: "",
                        motherOccupation: "",
                        guardianName: "",
                        schoolName: "",
                        subjects: [],
                        address: "",
                        email: "",
                        parentPhoneNumber: ""
                    }));
                    setTimeout(() => setSuccess(null), 3000);
                }
            } else {
                const msg = await res.text();
                setError(msg || "Failed to register student");
            }
        } catch (err) {
            setError("Network Error: Could not connect to backend");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout userRole={role}>
            <div className="max-w-5xl mx-auto pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">New Student Registration</h1>
                        </div>
                        <p className="text-gray-500 ml-9">Enroll a new student with complete parent and academic details.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-emerald-800 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-emerald-600" />
                        <span className="font-medium whitespace-pre-line leading-relaxed">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-800 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

                    {/* Section 1: Classification */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm transition-transform group-hover:scale-105">
                                <Landmark className="h-5 w-5" />
                            </div>
                            <h3 className="font-black tracking-tight text-gray-900 text-lg">Academic Classification</h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Center</label>
                                    <select name="center" value={formData.center} onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50">
                                        <option value="KOKUVIL">Kokuvil Center</option>
                                        <option value="MALLAKAM">Mallakam Center</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Medium</label>
                                    <select name="medium" value={formData.medium} onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50">
                                        <option value="TAMIL">Tamil Medium</option>
                                        <option value="ENGLISH">English Medium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Exam Batch (Year)</label>
                                    <select name="examBatch" value={formData.examBatch} onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-700 cursor-pointer hover:bg-gray-50">
                                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Student Basics */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm transition-transform group-hover:scale-105">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="font-black tracking-tight text-gray-900 text-lg">Student & Primary Info</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Internal ID (Reference)</label>
                                    <div className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-400 font-bold font-mono tracking-widest cursor-not-allowed flex justify-between items-center shadow-inner">
                                        {idHint}
                                        <span className="text-[10px] tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 text-center">AUTO GEN</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-700 uppercase mb-3 flex items-center gap-2">
                                        Full Name <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium font-bold text-gray-900" placeholder="E.g. S. Kiruthiyan" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-gray-400" /> Student Email
                                    </label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium font-bold text-gray-900" placeholder="student@example.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Landmark className="h-3.5 w-3.5 text-gray-400" /> Current School
                                    </label>
                                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium font-bold text-gray-900" placeholder="School Name" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Family Details */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm transition-transform group-hover:scale-105">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-black tracking-tight text-gray-900 text-lg">Family & Guardian Details</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            {/* Father */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-[1.5rem] bg-gray-50/50 border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-700 uppercase mb-3">Father's Name <span className="text-red-500">*</span></label>
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white font-bold text-gray-900" placeholder="Name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-gray-400" /> Occupation
                                    </label>
                                    <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white font-bold text-gray-900" placeholder="Occupation" />
                                </div>
                            </div>

                            {/* Mother */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-[1.5rem] bg-gray-50/50 border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-700 uppercase mb-3">Mother's Name <span className="text-red-500">*</span></label>
                                    <input name="motherName" value={formData.motherName} onChange={handleChange} required type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white font-bold text-gray-900" placeholder="Name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-gray-400" /> Occupation
                                    </label>
                                    <input name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white font-bold text-gray-900" placeholder="Occupation" />
                                </div>
                            </div>

                            {/* Contact & Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-700 uppercase mb-3 flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-emerald-600" /> Primary Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} required type="tel" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-900" placeholder="+94 7X XXX XXXX" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400" /> Home Address
                                    </label>
                                    <input name="address" value={formData.address} onChange={handleChange} type="text" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300 font-bold text-gray-900" placeholder="Street, City" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Subjects Grid */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm transition-transform group-hover:scale-105">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <h3 className="font-black tracking-tight text-gray-900 text-lg">Subject Enrollment</h3>
                        </div>
                        <div className="p-8">
                            <label className="block text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Select all subjects for this student:</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {SUBJECT_OPTIONS.map(subject => (
                                    <button
                                        key={subject}
                                        type="button"
                                        onClick={() => toggleSubject(subject)}
                                        className={clsx(
                                            "flex items-center justify-between px-5 py-4 rounded-[1rem] border text-sm font-black transition-all group",
                                            formData.subjects.includes(subject)
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/10 shadow-sm"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 hover:shadow-sm"
                                        )}
                                    >
                                        <span>{subject}</span>
                                        <div className={clsx(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                            formData.subjects.includes(subject)
                                                ? "bg-emerald-600 border-white text-white shadow-sm scale-110"
                                                : "bg-gray-50 border-gray-200 group-hover:border-emerald-400 text-transparent"
                                        )}>
                                            <Plus className={clsx("h-4 w-4", formData.subjects.includes(subject) && "rotate-45")} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-4 pt-6 sticky bottom-6 z-10 w-full">
                        {success && (
                            <p className="text-emerald-600 font-bold text-sm tracking-wide mr-auto animate-pulse">✓ Saved successfuly</p>
                        )}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={loading}
                            className="bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-5 w-5" />
                            Register & Next
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 focus:ring-4 focus:ring-emerald-500/30 outline-none border-2 border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                            Register Complete
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
