"use client";

import { useEffect, useState } from "react";
import {
    Archive,
    CheckCircle2,
    Database,
    Download,
    FileText,
    RefreshCw,
    Shield,
    Trash2,
    Users,
} from "lucide-react";
import clsx from "clsx";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

type ArchivedStudent = {
    studentId: string;
    fullName: string;
    center: string | null;
    examBatch: number | null;
    status: string | null;
    deletedAt: string | null;
};

type StudentPagePayload = {
    content: ArchivedStudent[];
    totalElements: number;
};

const unwrapData = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const toCSV = (rows: Record<string, unknown>[]): string => {
    if (!rows.length) return "";
    const keys = Object.keys(rows[0]);
    const header = keys.join(",");
    const lines = rows.map((row) =>
        keys
            .map((k) => {
                const value = String(row[k] ?? "").replace(/"/g, '""');
                return `"${value}"`;
            })
            .join(",")
    );
    return [header, ...lines].join("\n");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export default function DataHistoryPage() {
    const [userRole, setUserRole] = useState<Role>("SUPER_ADMIN");
    const [activeTab, setActiveTab] = useState<"export" | "deleted" | "audit">("export");
    const [exporting, setExporting] = useState<string | null>(null);
    const [lastExport, setLastExport] = useState<string | null>(null);
    const [studentsCount, setStudentsCount] = useState(0);
    const [archivedStudents, setArchivedStudents] = useState<ArchivedStudent[]>([]);
    const [loadingArchived, setLoadingArchived] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole") as Role | null;
        if (role) {
            setUserRole(role);
        }
        if (role === "STUDENT") {
            window.location.href = "/student-dashboard";
            return;
        }
        fetchCounts();
        fetchArchivedStudents();
    }, []);

    const fetchCounts = async () => {
        try {
            const res = await api.get("/students/query", { params: { page: 0, size: 1 } });
            const data = unwrapData<StudentPagePayload>(res);
            setStudentsCount(data.totalElements || 0);
        } catch {
            setStudentsCount(0);
        }
    };

    const fetchArchivedStudents = async () => {
        setLoadingArchived(true);
        try {
            const res = await api.get("/students/archived", { params: { page: 0, size: 100 } });
            const data = unwrapData<StudentPagePayload>(res);
            setArchivedStudents(data.content || []);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to load archived students."));
            setArchivedStudents([]);
        } finally {
            setLoadingArchived(false);
        }
    };

    const exportJson = async (label: string, endpoint: string, params?: Record<string, unknown>) => {
        setExporting(label);
        try {
            const res = await api.get(endpoint, { params });
            const data = unwrapData<unknown>(res);
            const timestamp = new Date().toISOString().slice(0, 10);
            downloadFile(
                JSON.stringify(data, null, 2),
                `aharam_${label}_${timestamp}.json`,
                "application/json"
            );
            setLastExport(`${label} exported at ${new Date().toLocaleTimeString()}`);
        } catch (err) {
            toast.error(getApiErrorMessage(err, `Failed to export ${label}.`));
        } finally {
            setExporting(null);
        }
    };

    const exportCsv = async () => {
        setExporting("students_csv");
        try {
            const res = await api.get("/students/query", { params: { page: 0, size: 500 } });
            const data = unwrapData<StudentPagePayload>(res);
            const rows = (data.content || []).map((item) => ({
                studentId: item.studentId,
                fullName: item.fullName,
                center: item.center,
                examBatch: item.examBatch,
                status: item.status,
                deletedAt: item.deletedAt,
            }));
            downloadFile(toCSV(rows), `aharam_students_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
            setLastExport(`Students CSV exported at ${new Date().toLocaleTimeString()}`);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to export students CSV."));
        } finally {
            setExporting(null);
        }
    };

    const tabs = [
        { key: "export", label: "Export", icon: Download },
        { key: "deleted", label: "Archived", icon: Archive },
        { key: "audit", label: "Audit", icon: FileText },
    ] as const;

    return (
        <AdminLayout userRole={userRole}>
            <div className="mx-auto max-w-5xl space-y-5 pb-20">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Database className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900">Data History</h1>
                                <p className="text-xs text-gray-500">Live export and archived record monitoring</p>
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                exportJson("full_backup", "/students/query", {
                                    page: 0,
                                    size: 500,
                                    includeDeleted: true,
                                })
                            }
                            disabled={exporting === "full_backup"}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                        >
                            {exporting === "full_backup" ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Full Backup
                        </button>
                    </div>
                    {lastExport && (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {lastExport}
                        </p>
                    )}
                </div>

                <div className="flex overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={clsx(
                                "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-black",
                                activeTab === tab.key
                                    ? "border-b-2 border-emerald-600 bg-emerald-50 text-emerald-700"
                                    : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "export" && (
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <p className="text-sm font-bold text-gray-900">Students: {studentsCount}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    onClick={exportCsv}
                                    disabled={exporting === "students_csv"}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Export Students CSV
                                </button>
                                <button
                                    onClick={() => exportJson("students", "/students/query", { page: 0, size: 500 })}
                                    disabled={exporting === "students"}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Export Students JSON
                                </button>
                                <button
                                    onClick={() => exportJson("archived_students", "/students/archived", { page: 0, size: 500 })}
                                    disabled={exporting === "archived_students"}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Export Archived JSON
                                </button>
                                {userRole === "SUPER_ADMIN" && (
                                    <button
                                        onClick={() => exportJson("staff", "/staff")}
                                        disabled={exporting === "staff"}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                    >
                                        Export Staff JSON
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "deleted" && (
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 p-4">
                            <h2 className="text-sm font-black text-gray-900">Archived Students</h2>
                            <button
                                onClick={fetchArchivedStudents}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>
                        {loadingArchived ? (
                            <div className="p-10 text-center text-gray-500">
                                <RefreshCw className="mx-auto h-5 w-5 animate-spin" />
                            </div>
                        ) : archivedStudents.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No archived students found.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {archivedStudents.map((student) => (
                                    <div key={student.studentId} className="flex items-center gap-3 p-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-gray-900">{student.fullName}</p>
                                            <p className="text-xs text-gray-500">
                                                {student.studentId} • {student.center || "-"} • Batch {student.examBatch ?? "-"}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">
                                            {student.deletedAt ? new Date(student.deletedAt).toLocaleString() : "-"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "audit" && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900">Audit Coverage</h2>
                        <div className="mt-3 space-y-2">
                            <p className="flex items-center gap-2 text-xs text-gray-600">
                                <Shield className="h-4 w-4 text-emerald-600" />
                                Student create/update/delete actions are written to audit logs.
                            </p>
                            <p className="flex items-center gap-2 text-xs text-gray-600">
                                <Users className="h-4 w-4 text-emerald-600" />
                                Soft-deleted student records stay archived and exportable.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
