"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock, ArrowLeft, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8080/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                // Store Auth Data
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.roles[0]); // Assumes single role
                localStorage.setItem("username", data.username);
                localStorage.setItem("userId", data.id);

                // Redirect based on Role (Currently all go to dashboard, but components render differently)
                router.push("/dashboard");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Network Error: Could not connect to server.");
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
                        <Image src="/logo.jpg" alt="Logo" width={150} height={150} className="rounded-full shadow-2xl border-4 border-emerald-500/30 mx-auto" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">அகரம் உயர்நிலைக் கல்லூரி</h2>
                    <p className="text-emerald-100 text-lg max-w-md mx-auto">
                        பெற்றோர் மற்றும் ஆசிரியர்களுக்கான டிஜிட்டல் தளம். உங்கள் பிள்ளைகளின் கல்வி முன்னேற்றத்தை உடனுக்குடன் அறிந்துகொள்ளுங்கள்.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <div className="absolute top-8 left-8">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        முகப்பு (Back to Home)
                    </Link>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="mb-10 lg:hidden text-center">
                        <Image src="/logo.jpg" alt="Logo" width={100} height={100} className="rounded-full mx-auto shadow-lg mb-4" />
                        <h2 className="text-2xl font-bold text-emerald-900">அகரம் கல்லூரி</h2>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        கணக்கு நுழைவு (Login)
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        உங்கள் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    பயனர் பெயர் (User ID)
                                </label>
                                <div className="mt-2 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 transition-colors outline-none"
                                        placeholder="Enter your ID"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    கடவுச்சொல் (Password)
                                </label>
                                <div className="mt-2 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 transition-colors outline-none"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        என்னை நினைவில் கொள்
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                                        கடவுச்சொல்லை மறந்தீர்களா?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.01]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            உள்நுழைகிறது...
                                        </>
                                    ) : (
                                        "உள்நுழைய (Sign in)"
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
