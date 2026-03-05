"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, Loader2, AlertCircle, Phone, Mail, CheckCircle, Search } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

interface Staff {
    id: number;
    fullName: string;
    email: string;
    role: string;
    active: boolean;
}

export default function StaffPage() {
    const { toast } = useToast();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        name: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/admin/staff/send-verification-code", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ email: formData.email })
            });
            if (res.ok) {
                setSuccessMsg("Verification code sent to your email!");
                setStep(2);
            } else {
                setError(await res.text() || "Failed to send code");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/admin/staff/verify-email-code", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ email: formData.email, otp: formData.otp })
            });
            if (res.ok) {
                setSuccessMsg("Email verified successfully!");
                setStep(3);
            } else {
                setError(await res.text() || "Invalid verification code");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setSubmitLoading(false);
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
                    username: formData.name, // the backend uses 'username' mapped to fullName
                    email: formData.email,
                    role: "staff"
                })
            });

            if (res.ok) {
                const msg = await res.text();
                toast("success", msg);
                setShowModal(false);
                setStep(1);
                setFormData({ email: "", otp: "", name: "" });
                fetchStaff();
            } else {
                setError(await res.text() || "Registration failed");
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

    const resetModal = () => {
        setShowModal(false);
        setStep(1);
        setFormData({ email: "", otp: "", name: "" });
        setError(null);
        setSuccessMsg(null);
    };

    return (
        <AdminLayout userRole="SUPER_ADMIN">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-emerald-600" />
                        Staff Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage staff access and accounts.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-900 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-800 transition-all shadow-lg hover:shadow-emerald-900/20 flex items-center font-medium"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add New Staff
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
                                    {(staff.fullName || staff.email || "?").substring(0, 2)}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 truncate w-full">{staff.fullName || staff.email}</h3>
                            <p className="text-sm text-gray-400 truncate w-full">{staff.email}</p>
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
                            <h2 className="text-lg font-bold">Add New Staff Member</h2>
                            <button onClick={resetModal} className="text-emerald-200 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="px-6 pt-6 pb-2">
                            <div className="flex items-center justify-between">
                                <div className={clsx("h-2 rounded-full flex-1 mx-1", step >= 1 ? "bg-emerald-500" : "bg-gray-200")} />
                                <div className={clsx("h-2 rounded-full flex-1 mx-1", step >= 2 ? "bg-emerald-500" : "bg-gray-200")} />
                                <div className={clsx("h-2 rounded-full flex-1 mx-1", step >= 3 ? "bg-emerald-500" : "bg-gray-200")} />
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-2 font-medium">
                                Step {step} of 3
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center border border-red-100">
                                    <AlertCircle className="h-4 w-4 mr-2" /> {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center border border-emerald-100">
                                    <CheckCircle className="h-4 w-4 mr-2" /> {successMsg}
                                </div>
                            )}

                            {step === 1 && (
                                <form onSubmit={handleSendCode} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="staff@example.com"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">We will send a 6-digit verification code to this email to confirm their identity.</p>
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        <button type="button" onClick={resetModal} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                                        <button type="submit" disabled={submitLoading || !formData.email} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center font-bold shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:hover:translate-y-0">
                                            {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Code"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
                                        <p className="text-sm text-gray-500">Code sent to:</p>
                                        <p className="font-bold text-gray-900">{formData.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                            className="w-full px-4 py-2.5 text-center tracking-[0.5em] font-mono text-xl border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="------"
                                            required
                                        />
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        <button type="button" onClick={() => { setStep(1); setError(null); setSuccessMsg(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Back</button>
                                        <button type="submit" disabled={submitLoading || formData.otp.length !== 6} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center font-bold shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:hover:translate-y-0">
                                            {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Code"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleRegister} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <UserPlus className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100">
                                        <p><strong>Note:</strong> A temporary password will be automatically generated and emailed to the user. They will be required to change it upon first login.</p>
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        <button type="button" onClick={resetModal} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                                        <button type="submit" disabled={submitLoading || !formData.name} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center font-bold shadow-lg shadow-emerald-200 transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:hover:translate-y-0">
                                            {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
