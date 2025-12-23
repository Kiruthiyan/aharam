"use client";

import Navbar from "@/components/Navbar";

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h1 className="text-4xl font-bold text-emerald-900 mb-8 text-center">பாடநெறிகள் (Courses)</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-xl transition-all hover:border-emerald-200 group">
                            <div className="h-40 bg-emerald-100 rounded-xl mb-6 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <span className="text-emerald-600 font-bold text-xl">Grade {item + 5}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">தரம் {item + 5} வகுப்புக்கள்</h3>
                            <p className="text-gray-500 text-sm mb-4">கணிதம், விஞ்ஞானம், தமிழ் மற்றும் ஆங்கிலம் பாடங்கள் கற்பிக்கப்படும்.</p>
                            <button className="w-full py-2 rounded-lg border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-600 hover:text-white transition-colors">
                                விபரங்கள்
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
