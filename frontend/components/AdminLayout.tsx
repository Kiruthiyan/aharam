"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Shield,
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutProps {
    children: React.ReactNode;
    userRole?: "ADMIN" | "STAFF" | "PARENT";
}

const roleBadge: Record<string, { label: string; tamilLabel: string; color: string }> = {
    ADMIN: { label: "Admin", tamilLabel: "நிர்வாகி", color: "bg-purple-500/20 text-purple-200 border-purple-500/30" },
    STAFF: { label: "Staff", tamilLabel: "ஆசிரியர்", color: "bg-blue-500/20 text-blue-200 border-blue-500/30" },
    PARENT: { label: "Parent", tamilLabel: "பெற்றோர்", color: "bg-amber-500/20 text-amber-200 border-amber-500/30" },
};

export default function AdminLayout({ children, userRole = "ADMIN" }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [username, setUsername] = useState("Admin");
    const [role, setRole] = useState<"ADMIN" | "STAFF" | "PARENT">(userRole);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Auth guard: redirect to login if no token
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        const storedName = localStorage.getItem("name");
        const storedUser = localStorage.getItem("username");
        const storedRole = localStorage.getItem("userRole") as "ADMIN" | "STAFF" | "PARENT" | null;
        if (storedName) setUsername(storedName);
        else if (storedUser) setUsername(storedUser);
        if (storedRole) setRole(storedRole);
    }, [router]);

    const handleLogout = () => {
        // Clear ALL auth-related localStorage keys
        ["token", "userRole", "username", "name", "userId", "requirePasswordChange"].forEach(key =>
            localStorage.removeItem(key)
        );
        router.replace("/login");
    };

    const allNavigation = [
        { name: "முகப்பு (Overview)", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: "மாணவர்கள் (Students)", href: "/students", icon: Users, roles: ["ADMIN", "STAFF"] },
        { name: "பதிவு (Registration)", href: "/students/register", icon: GraduationCap, roles: ["ADMIN", "STAFF"] },
        { name: "வரவு (Attendance)", href: "/attendance", icon: Calendar, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: "பரிக்ஷை (Academic)", href: "/marks", icon: BookOpen, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: "கட்டணம் (Fees)", href: "/fees", icon: CreditCard, roles: ["ADMIN", "STAFF", "PARENT"] },
        { name: "நிர்வாகிகள் (Staff)", href: "/staff", icon: Shield, roles: ["ADMIN"] },
        { name: "அறிக்கைகள் (Reports)", href: "/reports", icon: BookOpen, roles: ["ADMIN"] },
    ];

    const navigation = allNavigation.filter(item => item.roles.includes(role));
    const badge = roleBadge[role] || roleBadge["ADMIN"];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out md:static md:inset-0 shadow-2xl",
                "bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                collapsed ? "w-20" : "w-72"
            )}>
                {/* Logo & Toggle */}
                <div className="flex items-center justify-between h-20 border-b border-emerald-800/50 px-4 relative shrink-0">
                    <Link href="/" className={clsx("flex items-center gap-3 overflow-hidden", collapsed && "justify-center w-full")}>
                        <div className="relative shrink-0">
                            <Image
                                src="/logo.jpg"
                                alt="Logo"
                                width={collapsed ? 36 : 44}
                                height={collapsed ? 36 : 44}
                                className="rounded-full border-2 border-emerald-400/60 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-emerald-950" />
                        </div>
                        {!collapsed && (
                            <div>
                                <span className="text-lg font-bold text-white tracking-wide whitespace-nowrap">அகரம்</span>
                                <p className="text-[10px] text-emerald-400 whitespace-nowrap">Tuition Management</p>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-emerald-900 rounded-full p-1 shadow-lg border border-emerald-100 hover:bg-emerald-50 z-50 transition-colors"
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                    </button>

                    <button className="md:hidden text-emerald-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mb-3 px-3">
                            மெனு
                        </p>
                    )}
                    {navigation.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ""}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    collapsed ? "justify-center" : "gap-3",
                                    isActive
                                        ? "bg-white/10 text-white shadow-inner border border-white/10"
                                        : "text-emerald-200 hover:bg-white/8 hover:text-white"
                                )}
                            >
                                <div className={clsx(
                                    "p-1.5 rounded-lg shrink-0 transition-colors",
                                    isActive ? "bg-emerald-500/30 text-emerald-300" : "text-emerald-400 group-hover:text-emerald-300"
                                )}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                {!collapsed && (
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                )}
                                {!collapsed && isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-emerald-800/50 bg-emerald-950/40 shrink-0">
                    <div className={clsx("flex items-center gap-3 mb-3", collapsed ? "justify-center" : "px-1")}>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-emerald-500/40 shadow-inner shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{username}</p>
                                <span className={clsx(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5",
                                    badge.color
                                )}>
                                    {badge.tamilLabel}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "w-full flex items-center px-3 py-2 text-sm font-medium text-emerald-300 rounded-lg hover:bg-red-500/15 hover:text-red-300 transition-all duration-200",
                            collapsed ? "justify-center" : "gap-3"
                        )}
                        title={collapsed ? "Logout" : ""}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!collapsed && "வெளியேற (Logout)"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-100 sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-none">
                                வணக்கம், {username} 👋
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                                {new Date().toLocaleDateString("ta-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white" />
                        </button>
                        <Link href="/settings" className="p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                            <Settings className="h-5 w-5" />
                        </Link>
                        <div className={clsx(
                            "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold",
                            badge.color.replace("text-", "text-").replace("bg-", "bg-").replace("border-", "border-"),
                            "bg-emerald-50 text-emerald-800 border-emerald-200"
                        )}>
                            {badge.label}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
