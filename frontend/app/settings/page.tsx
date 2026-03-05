"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { 
    Shield, Eye, EyeOff, Lock, User, Loader2, 
    CheckCircle2, Mail, Key, ShieldCheck, Settings,
    ChevronRight, LogOut, Bell, Smartphone
} from "lucide-react";
import { useToast } from "@/components/Toast";
import clsx from "clsx";

function getPasswordStrength(pw: string) {
    if (!pw) return { label: "", color: "text-gray-400", bg: "bg-gray-100", w: "w-0" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    
    if (score <= 1) return { label: "Weak", color: "text-red-500", bg: "bg-red-500", w: "w-1/4" };
    if (score === 2) return { label: "Moderate", color: "text-amber-500", bg: "bg-amber-500", w: "w-2/4" };
    if (score === 3) return { label: "Robust", color: "text-blue-500", bg: "bg-blue-500", w: "w-3/4" };
    return { label: "Military Grade", color: "text-emerald-600", bg: "bg-emerald-500", w: "w-full" };
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("STAFF");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(newPassword);

    useEffect(() => {
        const storedU = localStorage.getItem("username") || localStorage.getItem("name") || "User";
        const storedR = localStorage.getItem("userRole") as any;
        setUsername(storedU);
        if (storedR) setUserRole(storedR);
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return toast("error", "Verification failed. Passwords mismatch.");
        
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            if (res.ok) {
                toast("success", "Security credentials updated successfully.");
                setOldPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                toast("error", "Current password verification failed.");
            }
        } catch { toast("error", "Network synchronization error."); } finally { setLoading(false); }
    };

    return (
        <AdminLayout userRole={userRole}>
            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                {/* Profile Identity Card */}
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><Settings className="h-40 w-40 rotate-45" /></div>
                    
                    <div className="h-32 w-32 rounded-[2.5rem] bg-emerald-950 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white shrink-0 relative">
                        {username.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg"><ShieldCheck className="h-5 w-5 text-white" /></div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                            <h1 className="text-4xl font-black text-gray-900">{username}</h1>
                            <span className={clsx(
                                "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                userRole === "SUPER_ADMIN" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                userRole === "STAFF" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            )}>{userRole}</span>
                        </div>
                        <p className="text-gray-400 font-medium max-w-md">Authorized personnel of Aharam TMS. Last synchronized profile update on {new Date().toLocaleDateString()}.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Security Console */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Key className="h-6 w-6" /></div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 leading-none">Security Console</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Credentials Management</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Existing Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPw.old ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPw(v => ({...v, old: !v.old}))} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors"><Eye className="h-5 w-5"/></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Passcode</label>
                                        <div className="relative">
                                            <input 
                                                type={showPw.new ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required 
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold transition-all"
                                            />
                                            <button type="button" onClick={() => setShowPw(v => ({...v, new: !v.new}))} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors"><Eye className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Alignment</label>
                                        <div className="relative">
                                            <input 
                                                type={showPw.confirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-bold transition-all"
                                            />
                                            <button type="button" onClick={() => setShowPw(v => ({...v, confirm: !v.confirm}))} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-600 transition-colors"><Eye className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                </div>

                                {newPassword && (
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className={clsx("text-[10px] font-black uppercase tracking-widest", strength.color)}>Status: {strength.label}</span>
                                            <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                                                <div className={clsx("h-full transition-all duration-500", strength.bg, strength.w)} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">Recommendation: Integrate mixed-case alpha, numeric sequences, and specialized glyphs (#@$%) for maximum shield integrity.</p>
                                    </div>
                                )}

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Shield className="h-5 w-5" />}
                                    Synchronize Credentials
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Device Linkage</h3>
                            
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><Smartphone className="h-5 w-5" /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-gray-900 leading-tight">Biometric Mobile Access</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Authorized Handset</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors"><Bell className="h-5 w-5" /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-gray-900 leading-tight">Notification Schema</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Push & SMS Alarms</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <button className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
                                    <LogOut className="h-4 w-4" /> Terminate All Sessions
                                </button>
                            </div>
                        </div>

                        <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white space-y-4">
                            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-300" /></div>
                            <h4 className="text-lg font-black leading-tight">Premium Architecture Active</h4>
                            <p className="text-xs text-emerald-100/60 font-medium leading-relaxed">Your account is secured with multi-layer encryption and real-time monitoring. For security assistance, contact System HQ.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
