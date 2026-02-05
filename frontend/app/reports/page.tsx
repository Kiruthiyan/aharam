"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { BarChart3, PieChart, TrendingUp, Users, Download, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import clsx from "clsx";

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
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/reports/summary", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    setSummary(await res.json());
                }
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
        <AdminLayout userRole="ADMIN">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-emerald-600" />
                        அறிக்கைகள் (Reports)
                    </h1>
                    <p className="text-gray-500 mt-1">System-wide analytics and downloadable reports.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition">
                    <Download className="h-4 w-4" /> Export All
                </button>
            </div>

            {/* Configurable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={clsx("p-4 rounded-xl", card.bg, card.color)}>
                            <card.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
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
                        <div className="p-3 bg-red-50 rounded-lg flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-800">Kavin Kumar (AHC-1001)</span>
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">Overdue: Rs. 1500</span>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-800">Ravi Shankar (AHC-1004)</span>
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">Overdue: Rs. 3000</span>
                        </div>
                    </div>
                </div>

                {/* Academic Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Top Performers (Term 1)
                        </h3>
                        <button className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-800">Anitha R. (AHC-1002)</span>
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">Avg: 95%</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-800">Siva K. (AHC-1005)</span>
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">Avg: 92%</span>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
