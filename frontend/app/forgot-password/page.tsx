"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

function PasswordStrengthBar({ password }: { password: string }) {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (score <= 1) return { label: "Weak", color: "text-red-500", bar: "bg-red-500", w: "w-1/4" };
        if (score === 2) return { label: "Fair", color: "text-orange-500", bar: "bg-orange-400", w: "w-2/4" };
        if (score === 3) return { label: "Good", color: "text-blue-500", bar: "bg-blue-500", w: "w-3/4" };
        return { label: "Strong", color: "text-emerald-600", bar: "bg-emerald-500", w: "w-full" };
    };
    const s = getStrength();
    return (
        <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={clsx("h-full rounded-full transition-all duration-500", s.bar, s.w)} />
            </div>
            <p className={clsx("text-xs font-bold mt-1", s.color)}>{s.label}</p>
        </div>
    );
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await api.post("/auth/forgot-password", { email });
            setStep(2);
        } catch (err: any) { setError(err.message || "Failed to send OTP."); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await api.post("/auth/verify-otp", { email, otp });
            setStep(3);
        } catch (err: any) { setError(err.message || "Invalid or expired OTP."); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true); setError(null);
        try {
            await api.post("/auth/reset-password", { email, otp, newPassword });
            setStep(4);
        } catch (err: any) { setError(err.message || "Failed to reset password."); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-2xl mb-4">
                        <KeyRound className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
                    <p className="text-gray-500 text-sm mt-1">We'll send a 6-digit verification code to your email.</p>
                </div>

                {/* Progress Bar */}
                {step < 4 && (
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={clsx("h-1.5 flex-1 rounded-full transition-all duration-500", step > s ? "bg-emerald-500" : step === s ? "bg-emerald-400" : "bg-gray-200")} />
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 mb-5">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-gray-50"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Enter the email address registered with your account.</p>
                            </div>
                            <button type="submit" disabled={loading || !email}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Mail className="h-4 w-4" /> Send Verification Code</>}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <p className="text-sm text-gray-500">Code sent to:</p>
                                <p className="font-bold text-gray-900">{email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit Code</label>
                                <input
                                    type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-2xl border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                                    placeholder="——————"
                                />
                            </div>
                            <button type="submit" disabled={loading || otp.length !== 6}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><ShieldCheck className="h-4 w-4" /> Verify Code</>}
                            </button>
                            <button type="button" onClick={() => { setStep(1); setError(null); setOtp(""); }}
                                className="w-full text-sm text-gray-500 hover:text-emerald-600 transition-colors text-center">
                                ← Back to email entry
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showPw ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-gray-50"
                                        placeholder="Enter new password"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {newPassword && <PasswordStrengthBar password={newPassword} />}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={clsx("w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 outline-none text-sm bg-gray-50 transition-all", confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-emerald-500")}
                                        placeholder="Confirm new password"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword === newPassword && (
                                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1"><CheckCircle className="h-3 w-3" /> Passwords match</p>
                                )}
                            </div>
                            <button type="submit" disabled={loading || !newPassword || newPassword !== confirmPassword}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Lock className="h-4 w-4" /> Reset Password</>}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center space-y-5">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full mx-auto">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
                            <p className="text-sm text-gray-500">Your password has been changed successfully. You can now log in with your new credentials.</p>
                            <button onClick={() => router.push("/login")}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all">
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>

                {step < 4 && (
                    <div className="text-center mt-6">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
