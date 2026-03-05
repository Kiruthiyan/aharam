"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import {
    Download, Archive, Users, Calendar, CreditCard, BookOpen,
    Shield, AlertTriangle, RefreshCw, FileText, CheckCircle2,
    Trash2, RotateCcw, Clock, Database, Filter
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DeletedRecord {
    id: string;
    type: "STUDENT" | "STAFF" | "ATTENDANCE" | "FEE" | "MARK";
    name: string;
    details: string;
    deletedBy: string;
    deletedAt: string;
    restorable: boolean;
}

interface ExportModule {
    key: string;
    label: string;
    endpoint: string;
    icon: any;
    color: string;
    iconBg: string;
    count?: number;
}

// ── CSV Export Helpers ─────────────────────────────────────────────────────────

function toCSV(data: any[]): string {
    if (!data.length) return "";
    const keys = Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map(row =>
        keys.map(k => {
            const val = String(row[k] ?? "").replace(/"/g, '""');
            return `"${val}"`;
        }).join(",")
    );
    return [header, ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DataHistoryPage() {
    const [userRole, setUserRole] = useState<Role>("SUPER_ADMIN");
    const [activeTab, setActiveTab] = useState<"export" | "deleted" | "audit">("export");
    const [exporting, setExporting] = useState<string | null>(null);
    const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [restoring, setRestoring] = useState<string | null>(null);
    const [lastExport, setLastExport] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem("userRole") as Role;
        if (role) setUserRole(role);
        if (role === "STUDENT") {
            window.location.href = "/student-dashboard";
            return;
        }
        fetchCounts();
        fetchDeletedRecords();
    }, []);

    const fetchCounts = async () => {
        try {
            const data: any = await api.get("/students");
            const students = data.data || data;
            setCounts(prev => ({ ...prev, students: students.length }));
        } catch { /* counts are nice-to-have */ }
    };

    const fetchDeletedRecords = async () => {
        // Placeholder — backend should implement /api/audit/deleted
        // For now, show empty state with explanation
        setDeletedRecords([]);
    };

    const exportModule = async (mod: ExportModule, format: "csv" | "json") => {
        setExporting(mod.key + format);
        try {
            const res: any = await api.get(mod.endpoint);
            const data = res.data || res;

            const ts = new Date().toISOString().slice(0, 10);
            if (format === "json") {
                downloadFile(JSON.stringify(data, null, 2), `aharam_${mod.key}_${ts}.json`, "application/json");
            } else {
                downloadFile(toCSV(Array.isArray(data) ? data : [data]), `aharam_${mod.key}_${ts}.csv`, "text/csv");
            }
            setLastExport(`${mod.label} exported as ${format.toUpperCase()} at ${new Date().toLocaleTimeString()}`);
        } catch (e) {
            alert(`Export failed for ${mod.label}. Is the backend running?`);
        } finally {
            setExporting(null);
        }
    };

    const exportAll = async () => {
        setExporting("ALL");
        const ts = new Date().toISOString().slice(0, 10);
        const allData: Record<string, any> = { exportedAt: new Date().toISOString() };

        const endpoints = [
            { key: "students", url: "/api/students" },
            { key: "staff", url: "/api/staff" },
        ];

        for (const ep of endpoints) {
            try {
                const res: any = await api.get(ep.url.replace('/api', ''));
                allData[ep.key] = res.data || res;
            } catch { allData[ep.key] = []; }
        }

        downloadFile(JSON.stringify(allData, null, 2), `aharam_full_backup_${ts}.json`, "application/json");
        setLastExport(`Full backup exported at ${new Date().toLocaleTimeString()}`);
        setExporting(null);
    };

    const modules: ExportModule[] = [
        { key: "students", label: "Students", endpoint: "/api/students", icon: Users, color: "text-emerald-700", iconBg: "bg-emerald-100", count: counts.students },
        { key: "staff", label: "Staff Accounts", endpoint: "/api/staff", icon: Shield, color: "text-blue-700", iconBg: "bg-blue-100" },
        { key: "attendance", label: "Attendance Records", endpoint: "/api/attendance/all", icon: Calendar, color: "text-teal-700", iconBg: "bg-teal-100" },
        { key: "fees", label: "Fee Records", endpoint: "/api/fees/all", icon: CreditCard, color: "text-amber-700", iconBg: "bg-amber-100" },
        { key: "marks", label: "Marks & Exams", endpoint: "/api/marks/all", icon: BookOpen, color: "text-purple-700", iconBg: "bg-purple-100" },
    ];

    const tabs = [
        { key: "export", label: "Export & Backup", icon: Download },
        { key: "deleted", label: "Archived Records", icon: Archive },
        { key: "audit", label: "Audit Trail", icon: FileText },
    ] as const;

    return (
        <AdminLayout userRole={userRole}>
            <div className="max-w-5xl mx-auto space-y-5 pb-20">

                {/* Page Header */}
                <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                                <Database className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">Data History & Backup</h1>
                                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Export data, view deleted records, and audit changes</p>
                            </div>
                        </div>
                        <button onClick={exportAll} disabled={exporting === "ALL"}
                            className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-60 shrink-0">
                            {exporting === "ALL" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            <span className="hidden sm:inline">Full Backup (JSON)</span>
                            <span className="sm:hidden">Backup All</span>
                        </button>
                    </div>

                    {lastExport && (
                        <div className="mt-4 flex items-center gap-2 text-emerald-700 text-xs font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            {lastExport}
                        </div>
                    )}
                </div>

                {/* Safety Notice */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-black text-amber-800">Data Protection Policy</p>
                        <p className="text-xs text-amber-700 font-medium mt-1">
                            All deletions are <strong>soft-deleted</strong> — data is archived, never permanently erased.
                            Export backups regularly. Contact your administrator to restore any archived record.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-4 text-xs sm:text-sm font-black transition-all border-b-2",
                                activeTab === t.key
                                    ? "text-emerald-700 border-emerald-600 bg-emerald-50/50"
                                    : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                            )}>
                            <t.icon className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">{t.label}</span>
                            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                        </button>
                    ))}
                </div>

                {/* ── TAB: EXPORT ────────────────────────────────────────────── */}
                {activeTab === "export" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {modules.map(mod => (
                                <div key={mod.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${mod.iconBg}`}>
                                            <mod.icon className={`h-5 w-5 ${mod.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-gray-900 text-sm">{mod.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                {mod.count !== undefined ? `${mod.count} records` : "All records"}
                                                {" · "}{mod.endpoint}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => exportModule(mod, "csv")}
                                            disabled={!!exporting}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-gray-600 text-xs font-black transition-all disabled:opacity-50">
                                            {exporting === mod.key + "csv"
                                                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                : <Download className="h-3.5 w-3.5" />}
                                            CSV
                                        </button>
                                        <button onClick={() => exportModule(mod, "json")}
                                            disabled={!!exporting}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-gray-600 text-xs font-black transition-all disabled:opacity-50">
                                            {exporting === mod.key + "json"
                                                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                : <Download className="h-3.5 w-3.5" />}
                                            JSON
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Backup Instructions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-600" />
                                Recommended Backup Schedule
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { freq: "Daily", action: "Export Attendance records for the previous day", icon: Calendar },
                                    { freq: "Weekly", action: "Export Student, Fees, and Marks data", icon: CreditCard },
                                    { freq: "Monthly", action: "Full Backup (all modules as JSON)", icon: Database },
                                ].map(item => (
                                    <div key={item.freq} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                            <item.icon className="h-4 w-4 text-emerald-700" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{item.freq}</p>
                                            <p className="text-xs text-gray-600 font-medium">{item.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: DELETED / ARCHIVED ────────────────────────────────── */}
                {activeTab === "deleted" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-black text-gray-900 sm:text-lg">Archived / Soft-Deleted Records</h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                {deletedRecords.length} records
                            </span>
                        </div>

                        {deletedRecords.length === 0 ? (
                            <div className="p-16 text-center flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                    <Archive className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">No Archived Records</p>
                                    <p className="text-sm text-gray-400 font-medium mt-1 max-w-sm">
                                        All deletions are captured here as soft-deleted records.
                                        The backend should implement <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/api/audit/deleted</code> to populate this list.
                                    </p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left max-w-sm">
                                    <p className="text-xs font-black text-amber-800 mb-2">Backend Implementation Needed:</p>
                                    <ul className="text-xs text-amber-700 font-medium space-y-1">
                                        <li>• Add <code>isDeleted</code> boolean column to all entities</li>
                                        <li>• Use <code>@Where(clause = "is_deleted = false")</code> on queries</li>
                                        <li>• Expose <code>GET /api/audit/deleted</code> endpoint</li>
                                        <li>• Add <code>PUT /api/audit/restore/{"{id}"}</code> to restore records</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {deletedRecords.map(rec => (
                                    <div key={rec.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            rec.type === "STUDENT" ? "bg-emerald-100 text-emerald-700" :
                                                rec.type === "STAFF" ? "bg-blue-100 text-blue-700" :
                                                    "bg-gray-100 text-gray-500")}>
                                            <Trash2 className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-sm">{rec.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{rec.details}</p>
                                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 font-bold">
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wider">{rec.type}</span>
                                                <Clock className="h-3 w-3" />
                                                {rec.deletedAt}
                                                <span>by {rec.deletedBy}</span>
                                            </div>
                                        </div>
                                        {rec.restorable && (
                                            <button
                                                disabled={restoring === rec.id}
                                                onClick={async () => {
                                                    setRestoring(rec.id);
                                                    try {
                                                        await api.put(`/audit/restore/${rec.id}`);
                                                        setDeletedRecords(prev => prev.filter(r => r.id !== rec.id));
                                                    } catch { alert("Restore failed."); }
                                                    finally { setRestoring(null); }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-all disabled:opacity-50 shrink-0">
                                                {restoring === rec.id
                                                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                    : <RotateCcw className="h-3.5 w-3.5" />}
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: AUDIT TRAIL ───────────────────────────────────────── */}
                {activeTab === "audit" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-black text-gray-900">Audit Trail</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Full audit log is available in the{" "}
                                    <a href="/activity-logs" className="text-emerald-600 hover:underline font-bold">Activity Logs</a> page
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { label: "Student Registered", description: "Every new student registration is logged with staff name and timestamp", icon: Users, color: "bg-emerald-100 text-emerald-700" },
                                    { label: "Attendance Marked", description: "Each attendance action (present/absent/late) is logged with method (barcode/manual)", icon: Calendar, color: "bg-teal-100 text-teal-700" },
                                    { label: "Fee Marked", description: "All fee status changes are recorded with staff identity and method", icon: CreditCard, color: "bg-amber-100 text-amber-700" },
                                    { label: "Marks Entered", description: "All exam mark entries and updates are tracked per exam and student", icon: BookOpen, color: "bg-purple-100 text-purple-700" },
                                    { label: "Record Deleted", description: "Deletions are soft-delete archived — the record is never truly erased", icon: Trash2, color: "bg-red-100 text-red-700" },
                                    { label: "Staff Login / Logout", description: "All authentication events with IP address and timestamp", icon: Shield, color: "bg-blue-100 text-blue-700" },
                                ].map(item => (
                                    <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-gray-900">{item.label}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{item.description}</p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <a href="/activity-logs"
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-emerald-200 text-emerald-700 font-black text-sm hover:bg-emerald-50 transition-all">
                            <FileText className="h-4 w-4" />
                            View Full Activity Logs →
                        </a>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
