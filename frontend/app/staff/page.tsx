"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, Loader2, AlertCircle, Phone, Mail } from "lucide-react";

interface Staff {
    id: number;
    username: string; // Email
    role: string;
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "", // Email
        password: "", // Temp Password
        fullName: "", // For display, though backend might not store it yet in User
        phone: ""
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/admin/staff");
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (err) {
            console.error("Failed to fetch staff", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8080/api/admin/staff/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    role: ["staff"] // DTO expects Set<String> usually, logic might vary depending on SignupRequest
                })
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ username: "", password: "", fullName: "", phone: "" });
                fetchStaff();
            } else {
                const msg = await res.text();
                setError(msg || "Registration failed");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm("Are you sure you want to remove this staff admin?")) return;
        try {
            await fetch(`http://localhost:8080/api/admin/staff/${id}`, { method: "DELETE" });
            fetchStaff();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout userRole="SUPER_ADMIN">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">நிர்வாகிகள் (Staff Management)</h1>
                    <p className="text-sm text-gray-500">ஆசிரியர்கள் மற்றும் நிர்வாகிகளை நிர்வகிக்கவும்.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg flex items-center font-medium"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    புதியவர் சேர்க்க (Add New)
                </button>
            </div>

            {/* Staff List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffList.map((staff) => (
                        <div key={staff.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                <Shield className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{staff.username}</h3>
                            <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full mt-1">STAFF_ADMIN</p>

                            <div className="w-full mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                <button
                                    onClick={() => handleRemove(staff.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> நீக்க (Remove)
                                </button>
                                <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                        </div>
                    ))}
                    {staffList.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No Staff Admins found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-emerald-50">
                            <h2 className="text-lg font-bold text-emerald-900">புதிய நிர்வாகியை சேர்த்தல் (Add Staff)</h2>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" /> {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">முழு பெயர் (Full Name)</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Staff Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">மின்னஞ்சல் (Email/Username)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="email@aharam.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">தொலைபேசி (Phone)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="+94 ..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">தற்காலிக கடவுச்சொல் (Temp Password)</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    ரத்து (Cancel)
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center font-medium"
                                >
                                    {submitLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "சேர்க்க (Create)"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
