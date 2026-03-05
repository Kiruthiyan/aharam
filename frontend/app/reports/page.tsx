"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { BarChart3, PieChart, TrendingUp, Users, Download, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";

interface ReportSummary {
    totalStudents: number;
    activeStudents: number;
    totalIncome: number;
}

export default function ReportsPage() {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res: any = await api.get("/reports/summary");
                setSummary(res.data || res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const cards = [
        { title: "Total Students", value: summary?.totalStudents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Active Students", value: summary?.activeStudents || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
        { title: "Total Income", value: `Rs. ${summary?.totalIncome || 0}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    ];


    return (
        <AdminLayout userRole="SUPER_ADMIN">
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 shrink-0" />
                        System Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">System-wide analytics and downloadable reports.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition text-sm self-start sm:self-auto">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export All</span>
                    <span className="sm:hidden">Export</span>
                </button>
            </div>

            {/* Configurable Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={clsx("p-3 sm:p-4 rounded-xl", card.bg, card.color)}>
                            <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Defaulters Report */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Fee Defaulters
                        </h3>
                        <button className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm border border-dashed border-gray-200 text-gray-400">
                            Insufficient data to generate defaulters report for this month.
                        </div>
                    </div>
                </div>

                {/* Academic Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Top Performers
                        </h3>
                        <button className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm border border-dashed border-gray-200 text-gray-400">
                            Performances will be calculated after the upcoming term exams.
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
