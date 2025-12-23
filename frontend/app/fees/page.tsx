"use client";

import AdminLayout from "@/components/AdminLayout";
import { Download, Printer, Plus } from "lucide-react";

export default function FeesPage() {
    const fees = [
        { id: "F-1001", student: "Kavin Kumar", amount: "Rs. 2,500", date: "2024-12-01", status: "Paid" },
        { id: "F-1002", student: "Ravi Shankar", amount: "Rs. 2,500", date: "2024-12-05", status: "Pending" },
        { id: "F-1003", student: "Meena Kumari", amount: "Rs. 2,500", date: "2024-12-02", status: "Paid" },
    ];

    return (
        <AdminLayout userRole="STAFF_ADMIN">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">கட்டண விபரங்கள் (Fee Management)</h1>
                    <p className="text-sm text-gray-500">மாதாந்த கட்டணங்களை நிர்வகித்தல் (Track Monthly Fees).</p>
                </div>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    புதிய கொடுப்பனவு (New Payment)
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-6 font-medium border-b">Receipt ID</th>
                            <th className="p-6 font-medium border-b">Student</th>
                            <th className="p-6 font-medium border-b">Amount</th>
                            <th className="p-6 font-medium border-b">Date</th>
                            <th className="p-6 font-medium border-b">Status</th>
                            <th className="p-6 font-medium border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {fees.map((fee) => (
                            <tr key={fee.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-6 text-gray-900 font-bold">{fee.id}</td>
                                <td className="p-6 text-gray-700 font-medium">{fee.student}</td>
                                <td className="p-6 text-emerald-600 font-bold">{fee.amount}</td>
                                <td className="p-6 text-gray-500">{fee.date}</td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {fee.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <button className="text-gray-400 hover:text-emerald-600 transition-colors p-2" title="Download PDF">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button className="text-gray-400 hover:text-blue-600 transition-colors p-2" title="Print Receipt">
                                        <Printer className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
