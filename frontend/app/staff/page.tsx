"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, Loader2, AlertCircle, Phone, Mail, CheckCircle, Search } from "lucide-react";
import clsx from "clsx";

interface Staff {
    id: number;
    username: string; // Email
    role: string;
    // Note: Backend 'User' entity doesn't store fullName/phone yet, 
    // so we show Username/Role. Ideally, we'd add these to User entity or a Profile entity.
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "", // Email
        password: "", // Temp Password
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/admin/staff", {
                headers: { "Authorization": `Bearer ${token}` }
            });
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
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/admin/staff/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    role: "staff"
                })
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ username: "", password: "" });
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
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:8080/api/admin/staff/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchStaff();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout userRole="ADMIN">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-emerald-600" />
                        நிர்வாகிகள் (Staff Management)
                    </h1>
                    <p className="text-gray-500 mt-1">Manage staff access and accounts.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-900 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition-all shadow-lg hover:shadow-emerald-900/20 flex items-center font-medium"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    புதியவர் சேர்க்க (Add New)
                </button>
            </div>

            {/* Staff List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffList.map((staff) => (
                        <div key={staff.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
                            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold text-emerald-700 uppercase">
                                    {staff.username.substring(0, 2)}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 truncate w-full">{staff.username}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-2">
                                <Shield className="h-3 w-3 mr-1" /> STAFF
                            </span>

                            <div className="w-full mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                <button
                                    onClick={() => handleRemove(staff.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center px-2 py-1 rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </button>
                                <span className="text-xs text-emerald-600 font-bold flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Active
                                </span>
                            </div>
                        </div>
                    ))}
                    {staffList.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                            <Shield className="h-12 w-12 mb-4 text-gray-300" />
                            <p>No Staff Admins found.</p>
                            <button onClick={() => setShowModal(true)} className="mt-2 text-emerald-600 hover:underline">Create one now</button>
                        </div>
                    )}
                </div>
            )}

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 bg-emerald-900 text-white flex justify-between items-center">
                            <h2 className="text-lg font-bold">புதிய நிர்வாகியை சேர்த்தல் (Add Staff)</h2>
                            <button onClick={() => setShowModal(false)} className="text-emerald-200 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center border border-red-100">
                                    <AlertCircle className="h-4 w-4 mr-2" /> {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">பயனர்பெயர் (Username/Email)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">கடவுச்சொல் (Password)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Enter secure password"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center font-bold shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-1px]"
                                >
                                    {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
