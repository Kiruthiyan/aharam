"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    CreditCard,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutProps {
    children: React.ReactNode;
    userRole?: "ADMIN" | "STAFF" | "PARENT"; // Configurable for testing
}

export default function AdminLayout({ children, userRole = "ADMIN" }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [username, setUsername] = useState("Admin");
    const pathname = usePathname();

    useEffect(() => {
        const storedName = localStorage.getItem("name");
        const storedUser = localStorage.getItem("username");
        if (storedName) setUsername(storedName);
        else if (storedUser) setUsername(storedUser);

        // Auto-collapse on small screens if needed, but keeping simple for now
    }, []);

    // Define navigation based on full requirements
    const allNavigation = [
        { name: 'முகப்பு (Overview)', href: '/dashboard', icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: 'மாணவர்கள் (Students)', href: '/students', icon: Users, roles: ["ADMIN", "STAFF"] },
        { name: 'பதிவு (Registration)', href: '/students/register', icon: GraduationCap, roles: ["ADMIN", "STAFF"] },
        { name: 'வரவு (Attendance)', href: '/attendance', icon: Calendar, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: 'பரிக்ஷை (Academic)', href: '/marks', icon: BookOpen, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: 'கட்டணம் (Fees)', href: '/fees', icon: CreditCard, roles: ["ADMIN", "STAFF", "PARENT"] },
        // Admin Only
        { name: 'நிர்வாகிகள் (Staff)', href: '/staff', icon: Users, roles: ["ADMIN"] },
        { name: 'அறிக்கைகள் (Reports)', href: '/reports', icon: BookOpen, roles: ["ADMIN"] },
    ];

    const navigation = allNavigation.filter(item => item.roles.includes(userRole));

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
                "fixed inset-y-0 left-0 z-50 bg-emerald-900 text-white transform transition-all duration-300 ease-in-out md:static md:inset-0 shadow-2xl flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                collapsed ? "w-20" : "w-72"
            )}>
                {/* Logo & Toggle */}
                <div className="flex items-center justify-between h-20 border-b border-emerald-800 bg-emerald-950/30 px-4 relative">
                    <Link href="/" className={clsx("flex items-center gap-3 overflow-hidden", collapsed && "justify-center w-full")}>
                        <Image src="/logo.jpg" alt="Logo" width={collapsed ? 32 : 40} height={collapsed ? 32 : 40} className="rounded-full border-2 border-emerald-400 shrink-0" />
                        {!collapsed && <span className="text-xl font-bold tracking-wide transition-opacity duration-200 whitespace-nowrap">அகரம்</span>}
                    </Link>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-emerald-900 rounded-full p-1 shadow-md border border-emerald-100 hover:bg-emerald-50 z-50"
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                    </button>

                    <button
                        className="md:hidden text-emerald-200"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-2">
                    {!collapsed && (
                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 px-6 transition-opacity duration-200">
                            மெனு (Menu)
                        </div>
                    )}

                    <div className="px-3"> {/* Container padding */}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={collapsed ? item.name : ""}
                                    className={clsx(
                                        "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1",
                                        collapsed ? "justify-center" : "",
                                        isActive
                                            ? "bg-emerald-800 text-white shadow-lg border border-emerald-700/50"
                                            : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                                    )}
                                >
                                    <item.icon className={clsx("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-emerald-400" : "text-emerald-300", !collapsed && "mr-3")} />
                                    {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* User Profile / Bottom */}
                <div className="p-4 border-t border-emerald-800 bg-emerald-950/30">
                    <div className={clsx("flex items-center gap-3 mb-4", collapsed ? "justify-center" : "px-2")}>
                        <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-100 font-bold border border-emerald-500 shadow-inner shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden transition-all duration-200">
                                <p className="text-sm font-medium text-white truncate w-32">{username}</p>
                                <p className="text-xs text-emerald-400 truncate">ADMIN</p>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/login"
                        className={clsx(
                            "flex items-center w-full px-4 py-2 text-sm font-medium text-emerald-200 bg-emerald-900/50 rounded-lg hover:bg-red-900/20 hover:text-red-300 transition-colors",
                            collapsed ? "justify-center" : ""
                        )}
                        title={collapsed ? "Logout" : ""}
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("userRole");
                            localStorage.removeItem("username");
                        }}
                    >
                        <LogOut className={clsx("h-4 w-4", !collapsed && "mr-3")} />
                        {!collapsed && "வெளியேற (Logout)"}
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
                        <h1 className="text-2xl font-bold text-emerald-950 ml-2 md:ml-0">
                            வணக்கம், {username} 👋
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                        </button>
                        <Link href="/settings" className="p-2 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <Settings className="h-6 w-6" />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
