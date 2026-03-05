"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import {
    Shield, Eye, EyeOff, Lock, Loader2,
    CheckCircle2, Key, ShieldCheck, Settings,
    ChevronRight, LogOut, Bell, Smartphone,
    User, Mail, BookOpen, Calendar, CreditCard,
    AlertTriangle, Users, GraduationCap, Info
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";

function PasswordStrengthBar({ password }: { password: string }) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
        { label: "Fair", color: "bg-amber-500", textColor: "text-amber-500" },
        { label: "Good", color: "bg-blue-500", textColor: "text-blue-500" },
        { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600" },
    ];
    const level = levels[Math.max(0, score - 1)];
    return (
        <div className="mt-3 space-y-1.5">
            <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={clsx("flex-1 rounded-full transition-all duration-500", i <= score ? level.color : "bg-gray-100")} />
                ))}
            </div>
            <p className={clsx("text-[10px] font-black uppercase tracking-widest", level.textColor)}>
                {level.label} Password
            </p>
        </div>
    );
}

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

    useEffect(() => {
        const storedU = localStorage.getItem("username") || localStorage.getItem("name") || "User";
        const storedEmail = localStorage.getItem("email") || "";
        const storedR = localStorage.getItem("userRole") as any;
        setUsername(storedU);
        setEmail(storedEmail);
        if (storedR) setUserRole(storedR);
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return toast("error", "Passwords do not match.");
        if (newPassword.length < 8) return toast("error", "Password must be at least 8 characters.");
        setLoading(true);
        try {
            await api.post("/auth/change-password", { oldPassword, newPassword });
            toast("success", "Password updated successfully.");
            setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err: any) {
            toast("error", err.message || "Failed to update password.");
        } finally { setLoading(false); }
    };

    const handleLogout = () => {
        ["token", "userRole", "username", "name", "userId", "requirePasswordChange"].forEach(k => localStorage.removeItem(k));
        router.replace("/login");
    };

    const roleName = userRole === "SUPER_ADMIN" ? "Administrator" : userRole === "STAFF" ? "Staff" : "Student";
    const roleBadgeColor = userRole === "SUPER_ADMIN"
        ? "bg-purple-50 text-purple-700 border-purple-100"
        : userRole === "STAFF"
            ? "bg-blue-50 text-blue-700 border-blue-100"
            : "bg-amber-50 text-amber-700 border-amber-100";

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Alerts", icon: Bell },
    ] as const;

    return (
        <AdminLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Profile Header Card */}
                <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute -top-10 -right-10 h-48 w-48 bg-emerald-400/5 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 h-36 w-36 bg-teal-300/5 rounded-full" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-20 w-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl font-black text-white shadow-xl">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-7 w-7 bg-emerald-400 rounded-xl border-2 border-emerald-950 flex items-center justify-center shadow">
                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                        {/* Info */}
                        <div className="text-center sm:text-left flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                <h1 className="text-2xl font-black text-white tracking-tight">{username}</h1>
                                <span className={clsx("px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border", roleBadgeColor)}>
                                    {roleName}
                                </span>
                            </div>
                            {email && <p className="text-emerald-300/70 text-sm font-medium">{email}</p>}
                            <p className="text-emerald-300/50 text-[10px] font-bold uppercase tracking-wider mt-1">
                                Aharam Tuition Management System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Nav */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                activeTab === tab.id
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/10"
                                    : "text-gray-400 hover:text-emerald-700 hover:bg-emerald-50"
                            )}
                        >
                            <tab.icon className="h-4 w-4 shrink-0" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── PROFILE TAB ─────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="space-y-4">
                        {/* Account Info */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <h2 className="text-base font-black text-gray-900 tracking-tight">Account Information</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Username / ID</label>
                                    <div className="px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-bold text-gray-700">
                                        {username}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Role</label>
                                    <div className="px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-bold text-gray-700">
                                        {roleName}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-blue-700">
                                    To update your profile details, contact the system administrator.
                                </p>
                            </div>
                        </div>

                        {/* Role-specific: Admin — System Quick Actions */}
                        {userRole === "SUPER_ADMIN" && (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Settings className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight">Admin Controls</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: "Manage Staff", sub: "Add, edit, or deactivate staff", href: "/staff", icon: Users, color: "text-blue-600 bg-blue-50" },
                                        { label: "Activity Logs", sub: "View system audit trail", href: "/activity-logs", icon: Key, color: "text-purple-600 bg-purple-50" },
                                        { label: "Fee Reports", sub: "Financial overview", href: "/fees", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
                                        { label: "Notifications", sub: "Send announcements", href: "/notifications", icon: Bell, color: "text-amber-600 bg-amber-50" },
                                    ].map(item => (
                                        <Link key={item.href} href={item.href}
                                            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                                            <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", item.color)}>
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-900 group-hover:text-emerald-800">{item.label}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{item.sub}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Role-specific: Staff — Quick Links */}
                        {userRole === "STAFF" && (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight">Quick Access</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Students", href: "/students", icon: Users },
                                        { label: "Attendance", href: "/attendance", icon: Calendar },
                                        { label: "Academic", href: "/marks", icon: BookOpen },
                                        { label: "Fees", href: "/fees", icon: CreditCard },
                                    ].map(item => (
                                        <Link key={item.href} href={item.href}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
                                            <item.icon className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-800">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Role-specific: Student — My Records */}
                        {userRole === "STUDENT" && (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight">My Records</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "My Results", href: "/marks", icon: BookOpen },
                                        { label: "Attendance", href: "/attendance", icon: Calendar },
                                        { label: "Fee Status", href: "/fees", icon: CreditCard },
                                        { label: "Notices", href: "/notifications", icon: Bell },
                                    ].map(item => (
                                        <Link key={item.href} href={item.href}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all group">
                                            <item.icon className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-amber-800">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Danger Zone — Logout */}
                        <div className="bg-white rounded-[2rem] border border-red-50 shadow-sm p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Session</h3>
                            <button onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 hover:border-red-200 transition-all text-sm">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SECURITY TAB ─────────────────────────────────────── */}
                {activeTab === "security" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight">Change Password</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Credential Management</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPw.old ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={e => setOldPassword(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold transition-all focus:bg-white"
                                            placeholder="Enter current password"
                                        />
                                        <button type="button" onClick={() => setShowPw(v => ({ ...v, old: !v.old }))}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors">
                                            {showPw.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw.new ? "text" : "password"}
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold transition-all focus:bg-white"
                                                placeholder="Min. 8 characters"
                                            />
                                            <button type="button" onClick={() => setShowPw(v => ({ ...v, new: !v.new }))}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors">
                                                {showPw.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <PasswordStrengthBar password={newPassword} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw.confirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                required
                                                className={clsx(
                                                    "w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 outline-none text-sm font-bold transition-all focus:bg-white",
                                                    confirmPassword && confirmPassword !== newPassword
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                                        : "border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/10"
                                                )}
                                                placeholder="Re-enter new password"
                                            />
                                            <button type="button" onClick={() => setShowPw(v => ({ ...v, confirm: !v.confirm }))}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors">
                                                {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {confirmPassword && confirmPassword !== newPassword && (
                                            <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Passwords don't match
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] text-sm tracking-wide"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-4 w-4" />}
                                    Update Password
                                </button>
                            </form>
                        </div>

                        {/* Session Info */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-black text-gray-900">Active Session</h3>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-emerald-900">Current Device</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">Logged in · This browser session</p>
                                </div>
                            </div>
                            <button onClick={handleLogout}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-xs uppercase tracking-widest">
                                <LogOut className="h-4 w-4" /> Terminate Session
                            </button>
                        </div>

                        {/* Security Tips */}
                        <div className="bg-emerald-950 rounded-[2rem] p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                </div>
                                <h4 className="font-black text-sm">Security Tips</h4>
                            </div>
                            <ul className="space-y-2 text-xs text-emerald-100/70 font-medium">
                                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Use a password with 8+ characters, numbers and symbols.</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Never share your login credentials with anyone.</li>
                                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Always log out when using shared devices.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* ── NOTIFICATIONS TAB ────────────────────────────────── */}
                {activeTab === "notifications" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-gray-900 tracking-tight">Notification Preferences</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Alert Configuration</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Attendance Alerts", sub: "Notify when a student is absent", default: true },
                                    { label: "Fee Reminders", sub: "Monthly payment due notifications", default: true },
                                    ...(userRole === "SUPER_ADMIN" ? [
                                        { label: "Staff Activity", sub: "Staff login and action logs", default: false },
                                        { label: "System Alerts", sub: "Critical system events", default: true },
                                    ] : []),
                                    ...(userRole === "STUDENT" ? [
                                        { label: "Exam Results", sub: "When new marks are submitted", default: true },
                                        { label: "Holiday Notices", sub: "Center closure announcements", default: true },
                                    ] : []),
                                ].map((pref, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all">
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{pref.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{pref.sub}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" defaultChecked={pref.default} className="sr-only peer" />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-checked:bg-emerald-500 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <Link href="/notifications"
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-emerald-100 text-emerald-700 font-black hover:bg-emerald-50 transition-all text-xs uppercase tracking-widest">
                                    <Bell className="h-4 w-4" /> View All Notifications
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
