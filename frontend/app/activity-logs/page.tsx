"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { FileText, Filter, Search } from "lucide-react";

type LogItem = {
  at: string;
  user: string;
  role: string;
  action: string;
  details?: string;
  ip?: string;
};

export default function ActivityLogsPage() {
  const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("SUPER_ADMIN");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setUserRole(storedRole as any);
  }, []);

  // Backend can later provide: GET /api/admin/logs?query=
  useEffect(() => {
    if (userRole !== "SUPER_ADMIN") return;
    setLoading(false);
    setLogs([]);
  }, [userRole]);

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">System Activity Logs</h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
                Audit trail for attendance, fees, and staff actions.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button className="h-12 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-6 rounded-2xl text-sm font-black transition-all flex items-center gap-2 active:scale-95 shadow-sm">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by user, role, action, or IP address..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-gray-900 tracking-tight text-lg">Recent System Events</h3>
          </div>
          {loading ? (
            <div className="p-20 text-center"><div className="h-8 w-8 animate-spin border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto" /></div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">No Events Recorded</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium max-w-sm mx-auto">Future integration will populate this list with system-wide user actions, parameter adjustments, and authentications.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50/50">
              {logs.map((l, idx) => (
                <div key={idx} className="p-6 sm:px-8 hover:bg-emerald-50/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                    <p className="text-sm font-black text-gray-900 group-hover:text-emerald-900 transition-colors">{l.action}</p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{l.at}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    <span className="font-bold text-gray-700">{l.user}</span> <span className="text-xs uppercase tracking-wider text-emerald-600 font-bold ml-1 px-2 py-0.5 bg-emerald-50 rounded-md">{l.role}</span>
                    {l.details && <span className="mx-2 text-gray-300">•</span>}
                    {l.details}
                    {l.ip && <span className="mx-2 text-gray-300">•</span>}
                    {l.ip && <span className="font-mono text-xs text-gray-400">IP: {l.ip}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

