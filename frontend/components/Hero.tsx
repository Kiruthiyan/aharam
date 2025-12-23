"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Hero() {
    return (
        <div className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">

            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-3xl opacity-60"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-20">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            2025 ஆம் ஆண்டிற்கான அனுமதிக்கள் ஆரம்பம்
                        </div>

                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl leading-tight">
                            <span className="block">தரமான கல்விக்கு</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                                ஓர் அரிய தளம்
                            </span>
                        </h1>

                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-auto">
                            அகரம் உயர்நிலைக் கல்லூரி - நவீன வசதிகளுடன் கூடிய வகுப்பறைகள், அனுபவம் வாய்ந்த ஆசிரியர்கள், மற்றும் சிறந்த கற்றல் சூழல்.
                        </p>

                        <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link
                                    href="/courses"
                                    className="flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                                >
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    பாடங்களை பார்க்க
                                </Link>

                                <Link
                                    href="/contact"
                                    className="flex items-center justify-center px-8 py-3.5 border border-emerald-200 text-base font-medium rounded-xl text-emerald-700 bg-white hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    தொடர்புகொள்ள
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-center lg:justify-start gap-8">
                            <div>
                                <p className="text-3xl font-bold text-gray-900">500+</p>
                                <p className="text-sm text-gray-500">மாணவர்கள்</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">25+</p>
                                <p className="text-sm text-gray-500">ஆசிரியர்கள்</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">100%</p>
                                <p className="text-sm text-gray-500">வெற்றி</p>
                            </div>
                        </div>
                    </div>

                    {/* Image/Visual Content */}
                    <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                        <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden bg-white ring-1 ring-gray-900/5 transition-transform duration-500 hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                            {/* Fallback to logo if no hero image */}
                            <div className="aspect-[4/5] relative bg-emerald-50 flex flex-col items-center justify-center p-10">
                                <Image
                                    src="/logo.jpg"
                                    alt="Student Learning"
                                    width={300}
                                    height={300}
                                    className="rounded-full shadow-2xl border-4 border-white mb-6"
                                />
                                <div className="text-center z-20 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-emerald-100">
                                    <h3 className="text-emerald-900 font-bold text-xl mb-1">அகரம்</h3>
                                    <p className="text-emerald-600 text-sm">உங்களின் வெற்றிக்கான ஆரம்பம்</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
