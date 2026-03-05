"use client";

import Image from "next/image";
import { MapPin, Star, Users, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
    const { t } = useI18n();

    const stats = [
        { val: "500+", label: t("statStudents"), icon: Users },
        { val: "25+",  label: t("statTeachers"), icon: Star },
        { val: "2",    label: t("statCenters"),  icon: MapPin },
        { val: "100%", label: t("statSuccess"),  icon: TrendingUp },
    ];

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#052e16] via-[#064e3b] to-[#0f4c35]">

            {/* ── Soft radial glows only (no grid lines) ── */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_30%,rgba(16,185,129,0.18),transparent)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_70%,rgba(20,184,166,0.12),transparent)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* ── Main content ── */}
            <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[calc(100vh-12rem)]">

                    {/* ─────── LEFT: Text ─────── */}
                    <div className="flex flex-col items-start">

                        {/* Admission pill */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-400/30 bg-black/20 backdrop-blur-sm text-emerald-200 text-xs font-bold tracking-widest uppercase mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            {t("heroTagline")}
                        </div>

                        {/* College Name */}
                        <h1 className="text-5xl xl:text-[3.6rem] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
                            {t("collegeName")}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base font-semibold text-emerald-200 mb-5">
                            {t("collegeSubtitle")}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-emerald-100/70 leading-relaxed max-w-lg mb-10">
                            {t("heroParagraph")}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/15 w-full">
                            {stats.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <div key={s.label} className="flex flex-col">
                                        <Icon className="w-4 h-4 text-emerald-300 mb-2" />
                                        <span className="text-2xl xl:text-3xl font-extrabold text-white">{s.val}</span>
                                        <span className="text-[11px] text-emerald-200/60 font-medium mt-0.5">{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─────── RIGHT: Premium Logo UI ─────── */}
                    <div className="flex items-center justify-center lg:justify-center">
                        <div className="relative flex items-center justify-center lg:translate-x-4">

                            {/* Large ambient glow */}
                            <div className="absolute w-[30rem] h-[30rem] rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

                            {/* Decorative outer dashed ring */}
                            <div className="absolute w-[30rem] h-[30rem] rounded-full border-2 border-dashed border-emerald-400/10 animate-[spin_40s_linear_infinite]" />

                            {/* Outer slow ring */}
                            <div className="absolute w-[26rem] h-[26rem] rounded-full border border-emerald-300/15 animate-[spin_25s_linear_infinite_reverse]" />

                            {/* Mid pulsing ring */}
                            <div className="absolute w-[24rem] h-[24rem] rounded-full border-2 border-emerald-400/20 animate-pulse" />

                            {/* ── The Logo Frame ── */}
                            {/* White shadow plate behind */}
                            <div className="relative w-80 h-80 flex items-center justify-center">
                                {/* Outer premium frame */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 via-white/30 to-teal-400 p-[4px] shadow-[0_0_100px_rgba(16,185,129,0.7),inset_0_0_40px_rgba(255,255,255,0.06)]">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-900/80 to-[#041a0c]" />
                                </div>

                                {/* Inner white ring for contrast */}
                                <div className="absolute inset-3 rounded-full border-2 border-white/25" />

                                {/* Logo image — large and clear */}
                                <div className="relative z-10 w-72 h-72 rounded-full overflow-hidden shadow-2xl">
                                    <Image
                                        src="/images/college-logo-4k.png"
                                        alt={t("collegeName")}
                                        fill
                                        className="object-cover object-center"
                                        sizes="240px"
                                        priority
                                        quality={100}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* ── Wave transition to white sections ── */}
            <div className="relative z-10 w-full overflow-hidden leading-none mt-16">
                <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                    <path d="M0 90L60 80C120 70 240 50 360 50C480 50 600 70 720 73C840 76 960 63 1080 57C1200 50 1320 50 1380 50L1440 50V90H0Z" fill="#f8fafc"/>
                </svg>
            </div>
        </div>
    );
}
