"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn, Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
    const { lang, setLang, t } = useI18n();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { href: "/", label: t("navHome") },
        { href: "/courses", label: t("navCourses") },
        { href: "/contact", label: t("navContact") },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled
                ? "bg-white/95 backdrop-blur-xl shadow-lg py-2"
                : "bg-transparent py-4"
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-400/60 shadow-md bg-white">
                            <Image src="/images/college-logo-4k.png" alt="Aharam Logo" fill className="object-contain" />
                        </div>
                        <div className="leading-tight">
                            <p className={`text-lg font-extrabold tracking-tight transition-colors ${
                                scrolled ? "text-emerald-900" : "text-white"
                            }`}>
                                {lang === "en" ? "Aharam" : "அகரம்"}
                            </p>
                            <p className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                                scrolled ? "text-emerald-600" : "text-emerald-300"
                            }`}>
                                {lang === "en" ? "High Standard College" : "உயர் நிலைக் கல்லூரி"}
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-semibold transition-colors ${
                                    scrolled
                                        ? "text-slate-700 hover:text-emerald-600"
                                        : "text-white hover:text-emerald-300"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Language Toggle + Login + Hamburger */}
                    <div className="flex items-center gap-3">

                        {/* Language Button */}
                        <button
                            onClick={() => setLang(lang === "en" ? "ta" : "en")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                                scrolled
                                    ? "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                    : "border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                            }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {lang === "en" ? "தமிழ்" : "English"}
                        </button>

                        {/* Login Button */}
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <LogIn className="w-4 h-4" />
                            {t("navLogin")}
                        </Link>

                        {/* Hamburger */}
                        <button
                            className={`md:hidden p-2 rounded-xl transition ${
                                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
                            }`}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className={`md:hidden mt-3 pb-4 border-t flex flex-col gap-3 pt-4 ${
                        scrolled ? "border-slate-100" : "border-white/10"
                    }`}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`text-sm font-semibold transition-colors ${
                                    scrolled ? "text-slate-700 hover:text-emerald-600" : "text-white hover:text-emerald-300"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md w-fit mt-1"
                        >
                            <LogIn className="w-4 h-4" />
                            {t("navLogin")}
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
