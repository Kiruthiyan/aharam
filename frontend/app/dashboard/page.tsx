"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard,
    Bell
} from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'முகப்பு (Overview)', href: '#', icon: LayoutDashboard, current: true },
        { name: 'மாணவர்கள் (Students)', href: '#', icon: Users, current: false },
        { name: 'பாடங்கள் (Academics)', href: '#', icon: BookOpen, current: false },
        { name: 'வரவு (Attendance)', href: '#', icon: Calendar, current: false },
        { name: 'கட்டணம் (Fees)', href: '#', icon: CreditCard, current: false },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 shadow-2xl flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="flex items-center justify-center h-20 border-b border-emerald-800 bg-emerald-950/30">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full border-2 border-emerald-400" />
                        <span className="text-xl font-bold tracking-wide">அகரம்</span>
                    </Link>
                    <button
                        className="md:hidden absolute right-4 text-emerald-200"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                item.current
                                    ? "bg-emerald-800 text-white shadow-lg border border-emerald-700/50"
                                    : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                            )}
                        >
                            <item.icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", item.current ? "text-emerald-400" : "text-emerald-300")} />
                            {item.name}
                        </a>
                    ))}
                </div>

                {/* User Profile / Bottom */}
                <div className="p-4 border-t border-emerald-800 bg-emerald-950/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-100 font-bold border border-emerald-500">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Admin User</p>
                            <p className="text-xs text-emerald-400">Super Admin</p>
                        </div>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-emerald-200 bg-emerald-900/50 rounded-lg hover:bg-red-900/20 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        வெளியேற (Logout)
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-100 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 ml-2 md:ml-0">வணக்கம், Admin 👋</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                        </button>
                        <button className="p-2 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <Settings className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: "மொத்த மாணவர்கள்", value: "540", icon: Users, color: "bg-blue-500" },
                            { label: "இன்றைய வரவு", value: "485", icon: Calendar, color: "bg-emerald-500" },
                            { label: "ஆசிரியர்கள்", value: "24", icon: BookOpen, color: "bg-purple-500" },
                            { label: "மாத வருமானம்", value: "Rs. 2.4L", icon: CreditCard, color: "bg-orange-500" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex items-center">
                                <div className={clsx("p-4 rounded-xl text-white mr-4 shadow-lg", stat.color)}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity / Content Mockup */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">சமீபத்திய அறிவிப்புகள் (Recent Notices)</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 mr-3"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">பரீட்சை முடிவுகள் வெளியிடப்பட்டுள்ளன</p>
                                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[300px] border-dashed border-2 border-emerald-100">
                            <div className="text-center">
                                <div className="bg-emerald-50 p-4 rounded-full inline-block mb-3">
                                    <Users className="h-8 w-8 text-emerald-400" />
                                </div>
                                <p className="text-gray-500">மாணவர் வருகை வரைபடம்</p>
                                <p className="text-xs text-gray-400 mt-1">(Analytics Chart Placeholder)</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
