"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useI18n } from "@/lib/i18n";
import {
    GraduationCap, Users, Monitor, ShieldCheck,
    MapPin, Phone, Mail, Globe, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function Home() {
    const { t } = useI18n();

    const features = [
        { icon: GraduationCap, titleKey: "f1Title", descKey: "f1Desc", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", ring: "ring-emerald-200" },
        { icon: Users, titleKey: "f2Title", descKey: "f2Desc", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", ring: "ring-blue-200" },
        { icon: Monitor, titleKey: "f3Title", descKey: "f3Desc", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50", ring: "ring-violet-200" },
        { icon: ShieldCheck, titleKey: "f4Title", descKey: "f4Desc", gradient: "from-orange-500 to-amber-500", bg: "bg-orange-50", ring: "ring-orange-200" },
    ] as const;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <Hero />

            {/* ── Features ── */}
            <section className="min-h-[90vh] flex items-center bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 mb-4">
                            {t("featuresTag")}
                        </span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{t("featuresTitle")}</h2>
                        <p className="text-slate-500 text-base leading-relaxed">{t("featuresSub")}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.titleKey}
                                    className={`group relative bg-white ${f.bg} rounded-3xl p-8 ring-1 ${f.ring} hover:ring-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-200`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-3">{t(f.titleKey)}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{t(f.descKey)}</p>
                                    <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${f.gradient} opacity-5 rounded-full translate-x-8 translate-y-8 pointer-events-none`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Vision / Mission ── */}
            <section className="min-h-[90vh] flex items-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_15%,#22c55e,transparent_60%)]" />
                <div className="absolute inset-y-0 right-[-20%] w-[40%] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <p className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-400/40">
                            {t("featuresTag")}
                        </p>
                        <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                            {t("visionTitle")} &nbsp;/&nbsp; {t("missionTitle")}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10 md:gap-12">
                        {[
                            { title: t("visionTitle"), text: t("visionText") },
                            { title: t("missionTitle"), text: t("missionText") }
                        ].map((item) => (
                            <article
                                key={item.title}
                                className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-[0_24px_80px_rgba(0,0,0,0.55)] hover:border-emerald-300/60 hover:bg-white/8 transition-all duration-300"
                            >
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.45),transparent_55%)]" />
                                <div className="relative p-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-300/50">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        </span>
                                        <h2 className="text-xl md:text-2xl font-extrabold text-white">
                                            {item.title}
                                        </h2>
                                    </div>
                                    <p className="text-sm md:text-base leading-relaxed text-emerald-100/95">
                                        {item.text}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Centers ── */}
            <section className="min-h-[90vh] flex items-center bg-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 mb-4">
                            {t("centersTag")}
                        </span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{t("centersTitle")}</h2>
                        <p className="text-slate-500 text-base">{t("centersSub")}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { name: t("center1Name"), addr: t("center1Addr"), maps: "https://maps.google.com/?q=Aharam+Tuition+Kokuvil" },
                            { name: t("center2Name"), addr: t("center2Addr"), maps: "https://maps.google.com/?q=Aharam+Tuition+Mallakam" },
                        ].map((c) => (
                            <div key={c.name} className="group flex flex-col gap-5 bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{c.name}</h3>
                                    <p className="text-slate-500 text-sm">{c.addr}</p>
                                </div>
                                <a href={c.maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                                    {t("navContact")} <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-gradient-to-t from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 py-12 border-t border-emerald-800/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        <div>
                            <h3 className="text-emerald-300 font-extrabold text-lg mb-3">{t("collegeName")}</h3>
                            <p className="text-sm leading-relaxed text-emerald-100/80">{t("footerTagline")}</p>
                        </div>
                        <div>
                            <h3 className="text-emerald-100 font-semibold text-xs uppercase tracking-[0.22em] mb-4">
                                {t("footerQuickLinks")}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/" className="text-emerald-100/80 hover:text-emerald-300 transition-colors">{t("navHome")}</Link></li>
                                <li><Link href="/courses" className="text-emerald-100/80 hover:text-emerald-300 transition-colors">{t("navCourses")}</Link></li>
                                <li><Link href="/contact" className="text-emerald-100/80 hover:text-emerald-300 transition-colors">{t("navContact")}</Link></li>
                                <li><Link href="/login" className="text-emerald-100/80 hover:text-emerald-300 transition-colors">{t("navLogin")}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-emerald-100 font-semibold text-xs uppercase tracking-[0.22em] mb-4">
                                {t("contactTitle")}
                            </h3>
                            <ul className="space-y-2 text-sm text-emerald-100/80">
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                    {t("address1")} {t("address2")} {t("address3")}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                                    {t("phone")}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                                    {t("email")}
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-emerald-800/70 pt-6 text-center text-xs text-emerald-400/80">
                        {t("copyright")}
                    </div>
                </div>
            </footer>
        </main>
    );
}
