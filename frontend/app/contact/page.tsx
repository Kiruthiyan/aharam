"use client";

import Navbar from "@/components/Navbar";
import { MoveRight, Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";

export default function ContactPage() {
    const { t, lang } = useI18n();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#052e16] via-[#064e3b] to-[#0f4c35]">
            {/* Soft ambient glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(20,184,166,0.1),transparent_50%)] pointer-events-none" />

            <Navbar />

            <div className="relative z-10 grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
                {/* Left: Contact info — green panel with card feel */}
                <div className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 py-16 lg:py-24">
                    <div className="max-w-xl">
                        <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-[0.2em] uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 mb-6">
                            {t("contactTitle")}
                        </p>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                            {t("contactPageTitle")}
                        </h1>
                        <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-10">
                            {t("contactPageSub")}
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90 mb-1">
                                        {t("contactPhoneLabel")}
                                    </h3>
                                    <a href="tel:0776562053" className="text-emerald-50 font-medium hover:text-white transition-colors">
                                        {t("phone")}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90 mb-1">
                                        {t("contactEmailLabel")}
                                    </h3>
                                    <a href="mailto:aharam.info@gmail.com" className="text-emerald-50 font-medium hover:text-white transition-colors break-all">
                                        {t("email")}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90 mb-1">
                                        {t("contactAddressLabel")}
                                    </h3>
                                    <p className="text-emerald-50/95 text-sm leading-relaxed">
                                        {t("address1")} {t("address2")} {t("address3")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form — curved green/white split, modern card */}
                <div className="relative flex items-center justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24 bg-slate-50 lg:rounded-l-[3rem] lg:shadow-[0_0_40px_-8px_rgba(0,0,0,0.08)]">
                    <form className="relative w-full max-w-md space-y-5 bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
                        <div className="border-b border-slate-100 pb-4 mb-2">
                            <h2 className="text-lg font-bold text-slate-800">
                                {lang === "ta" ? "செய்தி அனுப்புங்கள்" : "Send a message"}
                            </h2>
                            <p className="text-slate-500 text-sm mt-0.5">
                                {lang === "ta" ? "விரைவில் பதிலளிப்போம்." : "We'll get back to you soon."}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t("contactFormName")}
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-slate-50/50 transition-all placeholder:text-slate-400"
                                placeholder={lang === "ta" ? "உங்கள் முழுப் பெயர்" : "Your full name"}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t("contactFormEmail")}
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-slate-50/50 transition-all placeholder:text-slate-400"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t("contactFormMessage")}
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-slate-50/50 transition-all placeholder:text-slate-400 resize-none"
                                placeholder={lang === "ta" ? "உங்கள் செய்தியை இங்கே எழுதவும்..." : "Write your message here..."}
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {t("contactFormSubmit")}
                            <MoveRight className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
