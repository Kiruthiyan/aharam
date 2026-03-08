"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/error-utils";

type Role = "SUPER_ADMIN" | "STAFF" | "STUDENT";

type StudentListItem = {
    studentId: string;
    fullName: string;
    examBatch: number | null;
    center: string | null;
    medium: string | null;
    gender: string | null;
    status: string | null;
    parentPhoneNumber: string | null;
    email: string | null;
    deleted: boolean;
    updatedAt: string | null;
    deletedAt: string | null;
};

type StudentPagePayload = {
    content: StudentListItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

type StudentDetail = {
    studentId: string;
    fullName: string;
    fatherName: string;
    motherName: string;
    parentPhoneNumber: string;
    email?: string;
    center?: string;
    medium?: string;
    examBatch?: number;
    gender?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

const unwrapData = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export default function StudentsPage() {
    const [role, setRole] = useState<Role>("STAFF");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [rows, setRows] = useState<StudentListItem[]>([]);
    const [search, setSearch] = useState("");
    const [batch, setBatch] = useState("");
    const [center, setCenter] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [showArchived, setShowArchived] = useState(false);
    const [payload, setPayload] = useState<StudentPagePayload | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<StudentDetail | null>(null);

    const canEdit = role === "STAFF";

    const fetchPage = async () => {
        setLoading(true);
        try {
            const res = await api.get("/students/query", {
                params: {
                    search: search || undefined,
                    batch: batch ? Number(batch) : undefined,
                    center: center || undefined,
                    status: status || undefined,
                    includeDeleted: showArchived,
                    archivedOnly: showArchived,
                    page,
                    size,
                    sortBy: showArchived ? "deletedAt" : "updatedAt",
                    sortDir: "desc",
                },
            });
            const data = unwrapData<StudentPagePayload>(res);
            setRows(data.content || []);
            setPayload(data);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to load students."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userRole = localStorage.getItem("userRole") as Role | null;
        if (userRole) setRole(userRole);
        if (userRole !== "STAFF") {
            window.location.href = "/dashboard";
            return;
        }
        fetchPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, showArchived]);

    const applyFilters = () => {
        setPage(0);
        fetchPage();
    };

    const openEdit = async (studentId: string) => {
        try {
            const res = await api.get(`/students/${studentId}`, {
                params: { includeDeleted: true },
            });
            const data = unwrapData<StudentDetail>(res);
            setForm(data);
            setEditingId(studentId);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to load student details."));
        }
    };

    const saveEdit = async () => {
        if (!form || !editingId) {
            return;
        }
        if (!form.fullName?.trim()) {
            toast.error("Student full name is required.");
            return;
        }
        if (!form.fatherName?.trim()) {
            toast.error("Father name is required.");
            return;
        }
        if (!form.motherName?.trim()) {
            toast.error("Mother name is required.");
            return;
        }
        if (!form.parentPhoneNumber?.trim()) {
            toast.error("Parent phone number is required.");
            return;
        }

        setSaving(true);
        try {
            await api.put(`/students/${editingId}`, {
                fullName: form.fullName,
                fatherName: form.fatherName,
                motherName: form.motherName,
                parentPhoneNumber: form.parentPhoneNumber,
                email: form.email || "",
                center: form.center || "",
                medium: form.medium || "",
                examBatch: form.examBatch,
                gender: form.gender || "",
                status: form.status,
            });
            toast.success("Student updated successfully.");
            setEditingId(null);
            setForm(null);
            fetchPage();
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to update student."));
        } finally {
            setSaving(false);
        }
    };

    const removeStudent = async (studentId: string) => {
        if (!canEdit) {
            return;
        }
        const ok = window.confirm(
            "Soft delete this student? They will be removed from active lists, but history will be preserved."
        );
        if (!ok) {
            return;
        }
        setDeleting(studentId);
        try {
            await api.delete(`/students/${studentId}`);
            toast.success("Student archived successfully.");
            fetchPage();
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to archive student."));
        } finally {
            setDeleting(null);
        }
    };

    const heading = useMemo(
        () => (showArchived ? "Archived Students" : "Student Management"),
        [showArchived]
    );

    return (
        <AdminLayout userRole={role}>
            <div className="mx-auto max-w-7xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{heading}</h1>
                        <p className="text-sm text-gray-500">
                            {showArchived
                                ? "Soft-deleted students (history retained)."
                                : "Staff can add, edit, and soft-delete students."}
                        </p>
                    </div>
                    {!showArchived && (
                        <Link
                            href="/students/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4" />
                            New Student
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-6">
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-bold text-gray-500">Search</label>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, ID, phone"
                                className="w-full text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">Batch</label>
                        <input
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            placeholder="2026"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">Center</label>
                        <input
                            value={center}
                            onChange={(e) => setCenter(e.target.value)}
                            placeholder="KOKUVIL"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                        >
                            <option value="">All</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                        <button
                            onClick={() => setShowArchived((v) => !v)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                            {showArchived ? "Show Active" : "Show Archived"}
                        </button>
                        <button
                            onClick={applyFilters}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Batch</th>
                                    <th className="px-4 py-3">Center</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                                            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.studentId} className="border-t border-gray-100">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900">{row.fullName}</p>
                                                <p className="text-xs text-gray-500">{row.studentId}</p>
                                            </td>
                                            <td className="px-4 py-3">{row.examBatch ?? "-"}</td>
                                            <td className="px-4 py-3">{row.center ?? "-"}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                                                    {row.deleted ? "ARCHIVED" : row.status ?? "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{row.parentPhoneNumber ?? "-"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        disabled={!canEdit}
                                                        onClick={() => openEdit(row.studentId)}
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    {!row.deleted && (
                                                        <button
                                                            disabled={!canEdit || deleting === row.studentId}
                                                            onClick={() => removeStudent(row.studentId)}
                                                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                                                            title="Soft Delete"
                                                        >
                                                            {deleting === row.studentId ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                        <p className="text-xs text-gray-500">
                            {payload ? `${payload.totalElements} total records` : "0 records"}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={!payload?.hasPrevious}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <span className="text-xs font-bold text-gray-700">
                                Page {(payload?.page ?? 0) + 1} / {Math.max(payload?.totalPages ?? 1, 1)}
                            </span>
                            <button
                                disabled={!payload?.hasNext}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {editingId && form && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setEditingId(null);
                            setForm(null);
                        }}
                    />
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
                        <h3 className="text-lg font-black text-gray-900">Edit Student</h3>
                        <p className="mt-1 text-xs text-gray-500">Update details and save changes.</p>

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input
                                value={form.fullName || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, fullName: e.target.value } : s))}
                                placeholder="Full Name"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.parentPhoneNumber || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, parentPhoneNumber: e.target.value } : s))}
                                placeholder="Parent Phone"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.fatherName || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, fatherName: e.target.value } : s))}
                                placeholder="Father Name"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.motherName || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, motherName: e.target.value } : s))}
                                placeholder="Mother Name"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.email || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, email: e.target.value } : s))}
                                placeholder="Email (optional)"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.center || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, center: e.target.value } : s))}
                                placeholder="Center"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                value={form.medium || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, medium: e.target.value } : s))}
                                placeholder="Medium"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                                type="number"
                                value={form.examBatch || ""}
                                onChange={(e) =>
                                    setForm((s) =>
                                        s ? { ...s, examBatch: e.target.value ? Number(e.target.value) : undefined } : s
                                    )
                                }
                                placeholder="Exam Batch"
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            />
                            <select
                                value={form.gender || ""}
                                onChange={(e) => setForm((s) => (s ? { ...s, gender: e.target.value } : s))}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            >
                                <option value="">Gender</option>
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="UNSPECIFIED">UNSPECIFIED</option>
                            </select>
                            <select
                                value={form.status || "ACTIVE"}
                                onChange={(e) =>
                                    setForm((s) =>
                                        s
                                            ? { ...s, status: e.target.value as StudentDetail["status"] }
                                            : s
                                    )
                                }
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                            </select>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setForm(null);
                                }}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
