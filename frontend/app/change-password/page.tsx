"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/error-utils";
import { isStrongPassword } from "@/lib/validation";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const requirePassChange = localStorage.getItem("requirePasswordChange");

        if (!token) {
            router.push("/login");
        } else if (requirePassChange !== "true") {
            router.push("/dashboard");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.oldPassword) {
            setError("Current password is required.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }
        if (!isStrongPassword(formData.newPassword)) {
            setError("Password must be at least 8 characters and include upper, lower, number, and special character.");
            return;
        }

        setLoading(true);
        setError(null);

        const username = localStorage.getItem("username");

        try {
            await api.post("/auth/change-password", {
                username: username?.trim(),
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            localStorage.removeItem("requirePasswordChange");
            setTimeout(() => {
                const role = localStorage.getItem("userRole");
                if (role === "STUDENT") {
                    window.location.href = "/student-dashboard";
                } else {
                    window.location.href = "/dashboard";
                }
            }, 2000);
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to change password. Please check your current password."));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[480px] w-full p-10 sm:p-12 bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-50 text-center">
                    <div className="mx-auto w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <Lock className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Password Updated</h2>
                    <p className="text-gray-500 font-medium mt-2">Your password has been successfully changed.</p>
                    <p className="text-emerald-600 font-black mt-6 bg-emerald-50 py-3 rounded-xl">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[480px] w-full p-10 sm:p-12 bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-50">
                <div className="text-center mb-8">
                    <Image src="/images/college-logo-4k.png" alt="Logo" width={90} height={90} className="mx-auto border-4 border-emerald-50 rounded-full shadow-sm mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        First Time Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                        For security reasons, you must change your default password before accessing the system.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Current Password (Temporary)</label>
                            <input
                                type="password"
                                required
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all hover:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all hover:bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all hover:bg-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !formData.oldPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword || !isStrongPassword(formData.newPassword)}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 tracking-wide"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Change Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
