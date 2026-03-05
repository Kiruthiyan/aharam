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
    Home,
    Database,
} from "lucide-react";
import clsx from "clsx";

interface AdminLayoutProps {
    children: React.ReactNode;
    userRole?: "SUPER_ADMIN" | "STAFF" | "STUDENT";
}

const roleBadge: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: "Admin", color: "bg-purple-50 text-purple-700 border-purple-100" },
    STAFF: { label: "Staff", color: "bg-blue-50 text-blue-700 border-blue-100" },
    STUDENT: { label: "Student", color: "bg-amber-50 text-amber-700 border-amber-100" },
};

export default function AdminLayout({ children, userRole = "SUPER_ADMIN" }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [username, setUsername] = useState("User");
    const [role, setRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">(userRole);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.replace("/login"); return; }
        const storedName = localStorage.getItem("name");
        const storedUser = localStorage.getItem("username");
        const storedRole = localStorage.getItem("userRole") as "SUPER_ADMIN" | "STAFF" | "STUDENT" | null;
        if (storedName) setUsername(storedName);
        else if (storedUser) setUsername(storedUser);
        if (storedRole) setRole(storedRole);
    }, [router]);

    const handleLogout = () => {
        ["token", "userRole", "username", "name", "userId", "requirePasswordChange"].forEach(key =>
            localStorage.removeItem(key)
        );
        router.replace("/login");
    };

    const adminNavigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN"] },
        { name: "Attendance", href: "/attendance", icon: Calendar, roles: ["SUPER_ADMIN"] },
        { name: "Fees", href: "/fees", icon: CreditCard, roles: ["SUPER_ADMIN"] },
        { name: "Staff", href: "/staff", icon: Shield, roles: ["SUPER_ADMIN"] },
        { name: "Reports", href: "/reports", icon: BookOpen, roles: ["SUPER_ADMIN"] },
        { name: "Data & History", href: "/data-history", icon: Database, roles: ["SUPER_ADMIN"] },
        { name: "Activity Logs", href: "/activity-logs", icon: FileText, roles: ["SUPER_ADMIN"] },
        { name: "Notifications", href: "/notifications", icon: Bell, roles: ["SUPER_ADMIN"] },
        { name: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
    ];

    const nonAdminNavigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["STAFF", "STUDENT"] },
        { name: "Students", href: "/students", icon: Users, roles: ["STAFF"] },
        { name: "Registration", href: "/students/register", icon: GraduationCap, roles: ["STAFF"] },
        { name: "Attendance", href: "/attendance", icon: Calendar, roles: ["STAFF", "STUDENT"] },
        { name: "Academic", href: "/marks", icon: BookOpen, roles: ["STAFF", "STUDENT"] },
        { name: "Fees", href: "/fees", icon: CreditCard, roles: ["STAFF", "STUDENT"] },
        { name: "Data & History", href: "/data-history", icon: Database, roles: ["STAFF"] },
        { name: "Notifications", href: "/notifications", icon: Bell, roles: ["STAFF", "STUDENT"] },
        { name: "Profile", href: "/settings", icon: Settings, roles: ["STAFF", "STUDENT"] },
    ];

    const navigation = (role === "SUPER_ADMIN" ? adminNavigation : nonAdminNavigation).filter(item =>
        item.roles.includes(role)
    );

    // Mobile bottom tab bar: up to 5 most important nav items
    const mobileTabItems = navigation.slice(0, 5);

    const badge = roleBadge[role] || roleBadge["SUPER_ADMIN"];
    const sidebarWidth = collapsed ? "w-[72px]" : "w-64";
    const contentMargin = collapsed ? "md:ml-[72px]" : "md:ml-64";

    // Get current page name for the breadcrumb
    const currentPage = navigation.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ── Mobile Overlay ────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR (always fixed) ────────────────────────────── */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
                "bg-emerald-950 shadow-2xl border-r border-emerald-900/50",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                sidebarWidth
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-emerald-900/40">
                    <Link href="/" className={clsx("flex items-center gap-3 min-w-0 overflow-hidden", collapsed && "justify-center w-full")}>
                        <div className="shrink-0">
                            <Image
                                src="/images/college-logo-4k.png"
                                alt="Logo"
                                width={34}
                                height={34}
                                className="rounded-full border-2 border-emerald-400/30 bg-white object-contain shadow-md"
                            />
                        </div>
                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="text-sm font-black text-white tracking-widest uppercase truncate">Aharam</p>
                                <p className="text-[9px] text-emerald-400 font-bold tracking-[0.18em] uppercase truncate">Tuition System</p>
                            </div>
                        )}
                    </Link>
                    {/* Close on mobile */}
                    <button className="md:hidden text-emerald-400 hover:text-white p-1 shrink-0" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                    {/* Collapse toggle on desktop */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex absolute -right-3.5 top-8 bg-white text-emerald-900 rounded-full p-1.5 shadow-xl border border-gray-100 hover:bg-emerald-50 hover:scale-110 active:scale-95 z-50 transition-all"
                            title={collapsed ? "Expand" : "Collapse"}
                        >
                            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5 scrollbar-hide">
                    {!collapsed && (
                        <p className="text-[9px] font-black text-emerald-600/50 uppercase tracking-[0.22em] mb-3 px-3 pt-1">
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
                                    "group flex items-center px-3 py-2.5 rounded-xl transition-all duration-150",
                                    collapsed ? "justify-center" : "gap-3",
                                    isActive
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "text-emerald-100/50 hover:bg-emerald-900/60 hover:text-emerald-100"
                                )}
                            >
                                <div className={clsx(
                                    "p-1.5 rounded-lg shrink-0 transition-all",
                                    isActive ? "bg-emerald-500/20 text-emerald-400" : "text-emerald-400/40 group-hover:text-emerald-300 group-hover:bg-emerald-800/60"
                                )}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                {!collapsed && (
                                    <span className={clsx(
                                        "text-xs font-bold tracking-wide truncate",
                                        isActive && "text-emerald-300"
                                    )}>
                                        {item.name}
                                    </span>
                                )}
                                {!collapsed && isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Logout */}
                <div className={clsx("shrink-0 border-t border-emerald-900/40 p-3", collapsed ? "flex justify-center" : "")}>
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-emerald-900/40">
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center text-sm font-black text-emerald-300 shrink-0">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-white truncate">{username}</p>
                                <p className={clsx("text-[9px] font-bold uppercase tracking-widest truncate",
                                    role === "SUPER_ADMIN" ? "text-purple-400" :
                                        role === "STAFF" ? "text-blue-400" : "text-amber-400"
                                )}>{badge.label}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className={clsx(
                            "w-full flex items-center px-3 py-2.5 text-xs font-bold rounded-xl text-emerald-200/50 hover:bg-red-500/10 hover:text-red-400 transition-all",
                            collapsed ? "justify-center" : "gap-3"
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!collapsed && "Logout"}
                    </button>
                </div>
            </aside>

            {/* ── MAIN AREA ─────────────────────────────────────────── */}
            <div className={clsx("flex flex-col min-h-screen transition-all duration-300", contentMargin)}>
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Hamburger — mobile only */}
                        <button
                            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Page Breadcrumb */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider hidden sm:flex">
                                <Home className="h-3 w-3 shrink-0" />
                                <span>/</span>
                                <span>{currentPage?.name ?? "Dashboard"}</span>
                            </div>
                            <h1 className="text-sm font-black text-gray-900 truncate">
                                {currentPage?.name ?? "Dashboard"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Date — hidden on xs */}
                        <p className="hidden lg:block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>

                        {/* Role badge */}
                        <div className={clsx(
                            "hidden sm:flex items-center px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider",
                            badge.color
                        )}>
                            {badge.label}
                        </div>

                        {/* Bell */}
                        <Link href="/notifications" className="relative p-2 rounded-xl text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
                        </Link>

                        {/* Settings shortcut */}
                        <Link href="/settings" className="p-2 rounded-xl text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
                            <Settings className="h-5 w-5" />
                        </Link>

                        {/* User avatar */}
                        <div className="h-8 w-8 rounded-xl bg-emerald-950 border border-emerald-400/20 flex items-center justify-center text-sm font-black text-emerald-300 shadow-sm cursor-default select-none">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 scrollbar-hide">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>

                {/* ── Mobile Bottom Tab Bar ─────────────────────────── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-around h-16 px-2">
                        {mobileTabItems.map(item => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[56px]",
                                        isActive
                                            ? "text-emerald-700 bg-emerald-50"
                                            : "text-gray-400 hover:text-emerald-600"
                                    )}
                                >
                                    <item.icon className={clsx("h-5 w-5 transition-transform", isActive && "scale-110")} />
                                    <span className={clsx("text-[9px] font-black uppercase tracking-wider truncate", isActive ? "text-emerald-700" : "text-gray-400")}>
                                        {item.name.split(" ")[0]}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
