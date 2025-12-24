"use client";

import AdminLayout from "@/components/AdminLayout";
import { Lock, Settings as SettingsIcon } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function SettingsPage() {
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");
    const [username, setUsername] = useState("");

    // Password Form States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) setUserRole(storedRole as any);
        const storedUser = localStorage.getItem("username");
        if (storedUser) setUsername(storedUser);
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                localStorage.setItem("requirePasswordChange", "false");
            } else {
                setError(data.message || 'Error Changing Password');
            }
        } catch (err) {
            setError('Server Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="h-8 w-8 text-emerald-600" />
                        அமைப்புகள் (Settings)
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your account and preferences</p>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-gray-500" />
                            கடவுச்சொல் மாற்றம் (Change Password)
                        </h2>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
                                <span className="font-bold mr-2">Error:</span> {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center">
                                <span className="font-bold mr-2">Success:</span> {success}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">பழைய கடவுச்சொல் (Old Password)</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">புதிய கடவுச்சொல் (New Password)</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">உறுதிப்படுத்த (Confirm)</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
