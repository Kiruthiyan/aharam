"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, AlertCircle, Info, User, BookOpen, Users, ArrowLeft, Plus } from "lucide-react";
import clsx from "clsx";

export default function StudentRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        studentId: "",
        fullName: "",
        fatherName: "",
        motherName: "",
        guardianName: "",
        schoolName: "",
        center: "KOKUVIL",
        medium: "TAMIL",
        examBatch: "2026",
        subjects: "",
        address: "",
        email: "",
        parentPhoneNumber: "",
    });

    // Auto-generate ID prefix hint
    const [idHint, setIdHint] = useState("KT2026...");

    useEffect(() => {
        // Construct prefix: C (K/M) + M (T/E) + Year
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

    const handleSubmit = async (e: React.FormEvent, redirect: boolean = true) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);

        // Basic ID Validation
        const c = formData.center === "KOKUVIL" ? "K" : "M";
        const m = formData.medium === "TAMIL" ? "T" : "E";
        const prefix = `${c}${m}${formData.examBatch}`;

        if (!formData.studentId.startsWith(prefix)) {
            if (!confirm(`Warning: Student ID "${formData.studentId}" does not match the selected hierarchy (${prefix}...). Continue?`)) {
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/students/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(`Success! Student ${formData.fullName} registered.`);

                if (redirect) {
                    // Redirect to list after short delay
                    setTimeout(() => router.push("/students"), 1500);
                } else {
                    // Reset form for next entry (preserve batch settings)
                    setFormData(prev => ({
                        ...prev,
                        studentId: "",
                        fullName: "",
                        fatherName: "",
                        motherName: "",
                        guardianName: "",
                        schoolName: "",
                        subjects: "",
                        address: "",
                        email: "",
                        parentPhoneNumber: ""
                    }));
                    // Clear success message after a bit so user can register next
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
        <AdminLayout userRole="STAFF_ADMIN">
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
                        <p className="text-gray-500 ml-9">Enter details to enroll a new student into the system.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="h-5 w-5 mr-3 text-emerald-600" />
                        <span className="font-medium">{success}</span>
                        {success.includes("registered") && <span className="ml-2 text-sm text-emerald-600">(Redirecting...)</span>}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-800 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form className="space-y-6">

                    {/* Section 1: Academic Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-gray-800">Academic Classification</h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Center</label>
                                    <select name="center" value={formData.center} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-all">
                                        <option value="KOKUVIL">Kokuvil Center</option>
                                        <option value="MALLAKAM">Mallakam Center</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Medium</label>
                                    <select name="medium" value={formData.medium} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-all">
                                        <option value="TAMIL">Tamil Medium</option>
                                        <option value="ENGLISH">English Medium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exam Batch (Year)</label>
                                    <select name="examBatch" value={formData.examBatch} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-all">
                                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Student Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <User className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-gray-800">Student Details</h3>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                                    <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-mono flex items-center justify-between cursor-not-allowed">
                                        <span>{idHint} (Auto-Generated)</span>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">AUTO</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5 ml-1">ID will be generated automatically on save.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="E.g. Shanmuganathan Kiruthiyan" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                                    <input name="schoolName" value={formData.schoolName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Current School" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                    <input name="subjects" value={formData.subjects} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Maths, Science" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Guardian Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Users className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-gray-800">Guardian Information</h3>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name <span className="text-red-500">*</span></label>
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name <span className="text-red-500">*</span></label>
                                    <input name="motherName" value={formData.motherName} onChange={handleChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                    <input name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="+94 7..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <input name="address" value={formData.address} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="City / Village" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 sticky bottom-4">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                            Save Student & Close
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={loading}
                            className="bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold transition-all flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Save & Add Another
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
