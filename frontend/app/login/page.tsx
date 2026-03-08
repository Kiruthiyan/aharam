"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/error-utils";

export default function LoginPage() {
    const router = useRouter();
    const { t, lang } = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        loginId: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.loginId.trim()) {
            setError("Login ID is required.");
            return;
        }
        if (!formData.password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response: any = await api.post("/auth/login", {
                loginId: formData.loginId.trim(),
                password: formData.password,
            });
            const data = response.data || response;

            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("username", data.username);
            localStorage.setItem("name", data.displayName);
            localStorage.setItem("userId", data.id);

            if (data.requirePasswordChange) {
                localStorage.setItem("requirePasswordChange", "true");
                window.location.href = "/change-password";
            } else {
                if (data.role === "STUDENT") {
                    window.location.href = "/student-dashboard";
                } else {
                    window.location.href = "/dashboard";
                }
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, t("loginErrorNetwork")));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* Left Panel - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 relative overflow-hidden items-center justify-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-900 z-0 opacity-90"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-center p-12">
                    <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                        <Image src="/images/college-logo-4k.png" alt="Aharam Logo" width={150} height={150} className="rounded-full shadow-2xl border-4 border-emerald-500/30 bg-white mx-auto" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">{t("collegeName")}</h2>
                    <p className="text-emerald-100 text-lg max-w-md mx-auto">
                        {lang === "ta"
                            ? "பெற்றோர், ஆசிரியர்கள் மற்றும் நிர்வாகிகளுக்கான டிஜிட்டல் தளம். உங்கள் பிள்ளைகளின் கல்வி முன்னேற்றத்தை உடனுக்குடன் அறிந்துகொள்ளுங்கள்."
                            : "A secure digital platform for parents, teachers, and admins to follow each student’s progress in real time."}
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <div className="absolute top-8 left-8">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("loginBackToHome")}
                    </Link>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="mb-10 lg:hidden text-center">
                        <Image src="/images/college-logo-4k.png" alt="Aharam Logo" width={100} height={100} className="rounded-full mx-auto shadow-lg mb-4 bg-white" />
                        <h2 className="text-2xl font-bold text-emerald-900">{t("collegeName")}</h2>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {t("loginTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t("loginSubtitle")}
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white sm:p-10 sm:rounded-[2rem] sm:shadow-[0_8px_40px_rgba(0,0,0,0.04)] sm:border sm:border-gray-50">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            {/* Login ID */}
                            <div>
                                <label htmlFor="loginId" className="block text-sm font-bold text-gray-700 mb-2">
                                    {t("loginIdLabel")}
                                </label>
                                <div className="relative rounded-2xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="loginId"
                                        name="loginId"
                                        type="text"
                                        required
                                        className="focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block w-full pl-12 sm:text-sm border-gray-200 rounded-2xl py-4 transition-all outline-none bg-gray-50 font-medium hover:bg-white"
                                        placeholder={t("loginIdPlaceholder")}
                                        value={formData.loginId}
                                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                                    {t("loginPasswordLabel")}
                                </label>
                                <div className="relative rounded-2xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block w-full pl-12 sm:text-sm border-gray-200 rounded-2xl py-4 transition-all outline-none bg-gray-50 font-medium hover:bg-white"
                                        placeholder={t("loginPasswordPlaceholder")}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                        {t("loginRememberMe")}
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                        {t("loginForgotPassword")}
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.loginId.trim() || !formData.password}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 tracking-wide"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            {t("loginLoading")}
                                        </>
                                    ) : (
                                        t("loginButton")
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
