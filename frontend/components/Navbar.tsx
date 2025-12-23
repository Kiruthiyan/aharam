"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out font-sans",
                scrolled
                    ? "bg-white/90 backdrop-blur-md shadow-lg py-2"
                    : "bg-transparent py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-emerald-500/50 shadow-sm group-hover:border-emerald-600 transition-colors">
                            <Image
                                src="/logo.jpg"
                                alt="Aharam Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={clsx("text-xl font-bold transition-colors", scrolled ? "text-emerald-900" : "text-emerald-950")}>
                                அகரம்
                            </span>
                            <span className={clsx("text-xs font-semibold tracking-wide uppercase", scrolled ? "text-emerald-700" : "text-emerald-800")}>
                                உயர்நிலைக் கல்லூரி
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex space-x-6">
                            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">முகப்பு</Link>
                            <Link href="/courses" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">பாடநெறிகள்</Link>
                            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">தொடர்புகளுக்கு</Link>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <LogIn className="mr-2 h-4 w-4" />
                            நுழைவு (Login)
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
