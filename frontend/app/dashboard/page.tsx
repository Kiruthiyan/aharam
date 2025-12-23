"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Calendar, BookOpen, CreditCard } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
    return (
        <AdminLayout userRole="SUPER_ADMIN">
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
        </AdminLayout>
    );
}
