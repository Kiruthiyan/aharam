"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Bell, Megaphone, Send } from "lucide-react";

type Notice = {
  title: string;
  message: string;
  audience: "STAFF" | "STUDENTS" | "ALL";
  at: string;
};

export default function NotificationsPage() {
  const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "STAFF" | "STUDENT">("SUPER_ADMIN");
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setUserRole(storedRole as any);
  }, []);

  // Placeholder until backend supports announcements/SMS/WhatsApp configuration
  useEffect(() => {
    setNotices([]);
  }, [userRole]);

  return (
    <AdminLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notification Center</h1>
              <p className="text-sm text-gray-400 font-medium mt-1">
                Broadcast announcements across the institution and monitor automated alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Announcement (Admin Only) */}
          {userRole === "SUPER_ADMIN" && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">New Announcement</h2>
              </div>
              
              <form className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Title</label>
                  <input className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all" placeholder="e.g. Schedule Change for Batch 2025" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Message</label>
                  <textarea rows={5} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all resize-none" placeholder="Write the announcement content here..." />
                </div>
                <div className="flex gap-4 pt-2">
                  <select className="flex-1 px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-black text-gray-700 transition-all cursor-pointer">
                    <option value="ALL">Broadcast: All Users</option>
                    <option value="STAFF">Broadcast: Staff Only</option>
                    <option value="STUDENTS">Broadcast: Students Only</option>
                  </select>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10 hover:shadow-lg active:scale-95"
                  >
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider text-center">
                    Note: Dispatch capability offline pending backend routing integration.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Recent Notifications List */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="p-8 border-b border-gray-100">
              <h3 className="font-black text-gray-900 tracking-tight text-lg">Broadcast History</h3>
            </div>
            
            {notices.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Bell className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Inbox Clear</h3>
                <p className="text-sm text-gray-400 mt-2 font-medium max-w-sm mx-auto">No institution-wide broadcasts or alerts have been dispatched recently.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50/50">
                {notices.map((n, idx) => (
                  <div key={idx} className="p-6 sm:px-8 hover:bg-emerald-50/30 transition-colors group">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3 mb-2">
                        <p className="text-base font-black text-gray-900 group-hover:text-emerald-900 transition-colors">{n.title}</p>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">{n.at}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-3">{n.message}</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      Target: {n.audience}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

