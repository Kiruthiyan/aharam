"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function StudentRegistration() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        studentId: "",
        fullName: "",
        fatherName: "",
        motherName: "",
        guardianName: "",
        schoolName: "",
        subjects: "",
        address: "",
        email: "",
        parentPhoneNumber: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Reset status on change
        if (success || error) {
            setSuccess(null);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const res = await fetch("http://localhost:8080/api/students/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": "Bearer " + token // TODO: Add auth token
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(`Success! Student registered. Default Password is "${formData.fullName}"`);
                // Reset form
                setFormData({ studentId: "", fullName: "", fatherName: "", motherName: "", guardianName: "", schoolName: "", subjects: "", address: "", email: "", parentPhoneNumber: "" });
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
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">மாணவர் பதிவு (Student Registration)</h1>
                    <p className="text-sm text-gray-500">புதிய மாணவரை இணைப்பதற்கான படிவம்.</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
                        <CheckCircle className="h-5 w-5 mr-3" />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
                        <AlertCircle className="h-5 w-5 mr-3" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-emerald-800">மாணவர் விபரங்கள் (Personal Details)</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">மாணவர் இலக்கம் (Student ID) *</label>
                                <input name="studentId" value={formData.studentId} onChange={handleChange} required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all uppercase" placeholder="Eg: AHC-1001" />
                                <p className="text-xs text-gray-400 mt-1">Must be unique (Format: AHC-XXXX)</p>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">முழுப் பெயர் (Full Name) *</label>
                            <input name="fullName" value={formData.fullName} onChange={handleChange} required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="Enter Full Name" />
                        </div>

                        {/* Row 3 - Parents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">தகப்பனார் பெயர் (Father Name) *</label>
                                <input name="fatherName" value={formData.fatherName} onChange={handleChange} required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">தாயார் பெயர் (Mother Name) *</label>
                                <input name="motherName" value={formData.motherName} onChange={handleChange} required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">பாதுகாவலர் பெயர் (Guardian Name)</label>
                                <input name="guardianName" value={formData.guardianName} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">பெற்றோர் தொலைபேசி (Parent Phone) *</label>
                                <input name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} required type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="+94 7..." />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Academic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">பாடசாலை (School Name)</label>
                                <input name="schoolName" value={formData.schoolName} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">பாடங்கள் (Subjects)</label>
                                <input name="subjects" value={formData.subjects} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="Maths, Science..." />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">முகவரி (Address)</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">மின்னஞ்சல் (Email)</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <button type="button" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                ரத்து செய்க (Cancel)
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                பதிவு செய்க (Register)
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
