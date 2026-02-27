"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Lock, User, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import clsx from "clsx";

function getPasswordStrength(pw: string): { label: string; color: string; barColor: string; width: string } {
    if (!pw) return { label: "", color: "text-gray-400", barColor: "bg-gray-200", width: "w-0" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "text-red-500", barColor: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "text-orange-500", barColor: "bg-orange-400", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "text-blue-500", barColor: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "text-emerald-600", barColor: "bg-emerald-500", width: "w-full" };
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [userRole, setUserRole] = useState<"ADMIN" | "STAFF" | "PARENT">("ADMIN");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);

    const strength = getPasswordStrength(newPassword);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username") || localStorage.getItem("name") || "User";
        const storedRole = localStorage.getItem("userRole") as any;
        const pwdChange = localStorage.getItem("requirePasswordChange");
        setUsername(storedUsername);
        if (storedRole) setUserRole(storedRole);
        if (pwdChange === "true") setRequirePasswordChange(true);
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            toast("warning", "Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast("error", "New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast("warning", "New password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (res.ok) {
                toast("success", "Password changed successfully!");
                localStorage.removeItem("requirePasswordChange");
                setRequirePasswordChange(false);
                setOldPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                const errText = await res.text();
                toast("error", errText || "Incorrect current password.");
            }
        } catch {
            toast("error", "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const roleColors: Record<string, string> = {
        ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
        STAFF: "bg-blue-100 text-blue-700 border-blue-200",
        PARENT: "bg-amber-100 text-amber-700 border-amber-200",
    };

    const roleTamil: Record<string, string> = {
        ADMIN: "நிர்வாகி",
        STAFF: "ஆசிரியர்",
        PARENT: "பெற்றோர்",
    };

    return (
        <AdminLayout userRole={userRole}>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Profile</h2>
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-emerald-50">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{username}</h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", roleColors[userRole] || roleColors.ADMIN)}>
                                    {userRole}
                                </span>
                                <span className="text-xs text-gray-400">— {roleTamil[userRole] || "நிர்வாகி"}</span>
                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                    <CheckCircle className="h-3 w-3" /> Active Account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Warning */}
                {requirePasswordChange && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
                        <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-800 font-bold text-sm">Security Action Required</p>
                            <p className="text-red-600 text-xs mt-1">You are required to change your password before continuing.</p>
                        </div>
                    </div>
                )}

                {/* Change Password Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Lock className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Change Password</h2>
                            <p className="text-xs text-gray-400">Update your account password</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showOld ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    required
                                    placeholder="Enter your current password"
                                    className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-gray-50/50 transition-all"
                                />
                                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-gray-50/50 transition-all"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={clsx("h-full rounded-full transition-all duration-500", strength.barColor, strength.width)} />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className={clsx("text-xs font-bold", strength.color)}>{strength.label}</p>
                                        <p className="text-[10px] text-gray-400">Use 8+ chars, uppercase, number & symbol</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    className={clsx(
                                        "w-full pr-10 px-4 py-3 border rounded-xl focus:ring-2 outline-none text-sm bg-gray-50/50 transition-all",
                                        confirmPassword && confirmPassword !== newPassword
                                            ? "border-red-300 focus:ring-red-500 bg-red-50/30"
                                            : "border-gray-200 focus:ring-emerald-500"
                                    )}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match</p>
                            )}
                            {confirmPassword && confirmPassword === newPassword && newPassword && (
                                <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin h-4 w-4" /> Changing...</>
                            ) : (
                                <><Lock className="h-4 w-4" /> Update Password</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Account Info</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><User className="h-4 w-4" />Username</span>
                            <span className="text-sm font-bold text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{username}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Shield className="h-4 w-4" />Role</span>
                            <span className={clsx("text-xs font-bold px-3 py-1 rounded-full border", roleColors[userRole] || roleColors.ADMIN)}>{userRole}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Status</span>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
