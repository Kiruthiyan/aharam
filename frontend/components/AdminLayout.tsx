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
    FileText,
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutProps {
    children: React.ReactNode;
    userRole?: "SUPER_ADMIN" | "STAFF" | "STUDENT";
}

const roleBadge: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: "Admin", color: "bg-purple-500/20 text-purple-200 border-purple-500/30" },
    STAFF: { label: "Staff", color: "bg-blue-500/20 text-blue-200 border-blue-500/30" },
    STUDENT: { label: "Student", color: "bg-amber-500/20 text-amber-200 border-amber-500/30" },
};

export default function AdminLayout({ children, userRole = "SUPER_ADMIN" }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [username, setUsername] = useState("Admin");
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">(userRole);
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
        const storedRole = localStorage.getItem("userRole") as "SUPER_ADMIN" | "STAFF" | "STUDENT" | null;
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

    // FINAL Admin structure: authority-focused only (no students/registration/academic pages)
    const adminNavigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN"] },
        { name: "Attendance", href: "/attendance", icon: Calendar, roles: ["SUPER_ADMIN"] },
        { name: "Fees", href: "/fees", icon: CreditCard, roles: ["SUPER_ADMIN"] },
        { name: "Staff", href: "/staff", icon: Shield, roles: ["SUPER_ADMIN"] },
        { name: "Reports", href: "/reports", icon: BookOpen, roles: ["SUPER_ADMIN"] },
        { name: "Activity Logs", href: "/activity-logs", icon: FileText, roles: ["SUPER_ADMIN"] },
        { name: "Notifications", href: "/notifications", icon: Bell, roles: ["SUPER_ADMIN"] },
        { name: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
    ];

    // Staff/Student navigation (operational)
    const nonAdminNavigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["STAFF", "STUDENT"] },
        { name: "Students", href: "/students", icon: Users, roles: ["STAFF"] },
        { name: "Registration", href: "/students/register", icon: GraduationCap, roles: ["STAFF"] },
        { name: "Attendance", href: "/attendance", icon: Calendar, roles: ["STAFF", "STUDENT"] },
        { name: "Academic", href: "/marks", icon: BookOpen, roles: ["STAFF", "STUDENT"] },
        { name: "Fees", href: "/fees", icon: CreditCard, roles: ["STAFF", "STUDENT"] },
        { name: "Notifications", href: "/notifications", icon: Bell, roles: ["STAFF", "STUDENT"] },
        { name: "Profile", href: "/settings", icon: Settings, roles: ["STAFF", "STUDENT"] },
    ];

    const navigation = (role === "SUPER_ADMIN" ? adminNavigation : nonAdminNavigation).filter(item => item.roles.includes(role));
    const badge = roleBadge[role] || roleBadge["SUPER_ADMIN"];

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
                "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out md:static md:inset-0 shadow-2xl border-r border-emerald-900/50",
                "bg-emerald-950",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                collapsed ? "w-20" : "w-72"
            )}>
                {/* Logo & Toggle */}
                <div className="flex items-center justify-between h-20 px-6 relative shrink-0">
                    <Link href="/" className={clsx("flex items-center gap-4 overflow-hidden", collapsed && "justify-center w-full")}>
                        <div className="relative shrink-0">
                            <Image
                                src="/images/college-logo-4k.png"
                                alt="Logo"
                                width={collapsed ? 36 : 40}
                                height={collapsed ? 36 : 40}
                                className="rounded-full border-2 border-emerald-50 shadow-lg bg-white object-contain"
                            />
                        </div>
                        {!collapsed && (
                            <div>
                                <span className="text-lg font-black text-white tracking-widest uppercase">Aharam</span>
                                <p className="text-[9px] text-emerald-400 font-bold tracking-[0.2em] uppercase whitespace-nowrap">Tuition System</p>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 bg-white text-emerald-900 rounded-full p-1.5 shadow-xl border border-gray-100 hover:bg-emerald-50 hover:scale-110 active:scale-95 z-50 transition-all"
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                    </button>

                    <button className="md:hidden text-emerald-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-4 px-3">
                            Main Menu
                        </p>
                    )}
                    {navigation.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ""}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "group flex items-center px-3 py-3 rounded-2xl transition-all duration-200",
                                    collapsed ? "justify-center" : "gap-4",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-emerald-100/60 hover:bg-emerald-900/50 hover:text-emerald-100"
                                )}
                            >
                                <div className={clsx(
                                    "p-2 rounded-xl shrink-0 transition-all duration-300",
                                    isActive ? "bg-emerald-500/20 text-emerald-400" : "text-emerald-400/50 group-hover:text-emerald-300 group-hover:bg-emerald-800/50"
                                )}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                {!collapsed && (
                                    <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-6 bg-emerald-950 shrink-0 border-t border-emerald-900/30">
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-200/60 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200",
                            collapsed ? "justify-center" : "gap-4"
                        )}
                        title={collapsed ? "Logout" : ""}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!collapsed && "Secure Logout"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-xl shadow-sm h-16 flex items-center justify-between px-6 lg:px-8 border-b border-gray-100 sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2.5 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-95"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                                Welcome, {username}
                            </h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 hidden sm:block">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 rounded-xl text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                        </button>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                        <div className={clsx(
                            "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider",
                            badge.color.replace("text-", "text-").replace("bg-", "bg-").replace("border-", "border-"),
                            "bg-emerald-50 text-emerald-800 border-emerald-200"
                        )}>
                            {badge.label}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
