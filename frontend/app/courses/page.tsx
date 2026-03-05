"use client";

import Navbar from "@/components/Navbar";

const lowerGrades = {
    titleTa: "தரம் 6–9",
    titleEn: "Grades 6–9",
    tamilMedium: [
        "தமிழ்",
        "ஆங்கிலம்",
        "கணிதம்",
        "அறிவியல்",
        "சுகாதாரம்",
        "தகவல் தொழில்நுட்பம்",
        "தொழில்நுட்பம்",
        "புவியியல்",
        "வரலாறு",
        "குடியுரிமை",
        "மதம்",
    ],
    englishMedium: [
        "Tamil",
        "English",
        "Mathematics",
        "Science",
        "Health",
        "ICT",
        "Technology",
        "Geography",
        "History",
        "Civics",
        "Religion",
    ],
} as const;

const upperGradesCompulsory = {
    titleTa: "தரம் 10–11 (கட்டாயப் பாடங்கள்)",
    titleEn: "Grades 10–11 – Compulsory Subjects",
    tamilMedium: [
        "தமிழ்",
        "ஆங்கில மொழி",
        "கணிதம்",
        "அறிவியல்",
        "மதம் மற்றும் ஒழுக்கக் கல்வி",
    ],
    englishMedium: [
        "Tamil",
        "English Language",
        "Mathematics",
        "Science",
        "Religion & Value Education",
    ],
} as const;

const upperGradesElectives = {
    titleTa: "தரம் 10–11 (தேர்வுப் பாடங்கள்)",
    titleEn: "Grades 10–11 – Electives",
    tamilMedium: [
        "இரண்டாம் தேசிய மொழி",
        "தகவல் தொழில்நுட்பம்",
        "வரலாறு",
        "குடியியல் கல்வி",
        "உடற்கல்வி",
        "புவியியல்",
        "தொழில்நுட்பம்",
        "அழகியல் கல்வி",
        "தொழில் முயற்சி & நிதி அறிவு",
    ],
    englishMedium: [
        "Second National Language",
        "ICT",
        "History",
        "Civic Education",
        "Health & Physical Education",
        "Geography",
        "Technology",
        "Aesthetic Education",
        "Entrepreneurship & Financial Literacy",
    ],
} as const;

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-emerald-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <header className="text-center max-w-3xl mx-auto mb-14">
                    <p className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-400/40">
                        Courses · பாடநெறிகள்
                    </p>
                    <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-50">
                        Structured classes from Grade 6 to O/L
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-emerald-100/80 leading-relaxed">
                        Strong subject coverage in both Tamil and English medium, with a disciplined,
                        exam-focused approach that builds confidence for national examinations.
                    </p>
                </header>

                <section className="space-y-10">
                    {/* Grades 6–9 */}
                    <article className="rounded-3xl bg-emerald-900/40 border border-emerald-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-emerald-50">
                                    {lowerGrades.titleTa}
                                </h2>
                                <p className="text-xs md:text-sm text-emerald-200 mt-1">
                                    {lowerGrades.titleEn}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-400/40">
                                Core foundation subjects · அடித்தளப் பாடங்கள்
                            </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-emerald-950/40 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    Tamil Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {lowerGrades.tamilMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    English Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {lowerGrades.englishMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>

                    {/* Grades 10–11 compulsory */}
                    <article className="rounded-3xl bg-emerald-900/40 border border-emerald-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-emerald-50">
                                    {upperGradesCompulsory.titleTa}
                                </h2>
                                <p className="text-xs md:text-sm text-emerald-200 mt-1">
                                    {upperGradesCompulsory.titleEn}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-400/40">
                                O/L core subjects · O/L கட்டாயப் பாடங்கள்
                            </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-emerald-950/40 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    Tamil Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {upperGradesCompulsory.tamilMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    English Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {upperGradesCompulsory.englishMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>

                    {/* Grades 10–11 electives */}
                    <article className="rounded-3xl bg-emerald-900/40 border border-emerald-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-emerald-50">
                                    {upperGradesElectives.titleTa}
                                </h2>
                                <p className="text-xs md:text-sm text-emerald-200 mt-1">
                                    {upperGradesElectives.titleEn}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-400/40">
                                Stream selection · தேர்வு செய்யக்கூடிய பாடங்கள்
                            </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-emerald-950/40 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    Tamil Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {upperGradesElectives.tamilMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-700/60 p-5">
                                <h3 className="text-sm font-semibold text-emerald-200 tracking-[0.18em] uppercase mb-3">
                                    English Medium
                                </h3>
                                <ul className="space-y-1.5 text-sm text-emerald-50/90">
                                    {upperGradesElectives.englishMedium.map((s) => (
                                        <li key={s} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}
