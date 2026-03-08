"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Lang = "en" | "ta";

const translations = {
    en: {
        // Nav
        navHome: "Home",
        navCourses: "Courses",
        navContact: "Contact",
        navLogin: "Login",
        navAbout: "About Us",

        // Hero
        collegeName: "Aharam High Standard College",
        collegeSubtitle: "Shaping futures with disciplined, value-based learning.",
        heroTagline: "Learning today, leading tomorrow.",
        heroParagraph: "Every child deserves a strong foundation. We blend disciplined teaching, personal mentoring, and quiet focus to help students grow in knowledge, character, and confidence.",
        heroMotto: "Aharam – shaping the finest future for our children.",
        statStudents: "Students",
        statTeachers: "Teachers",
        statCenters: "Centers",
        statSuccess: "Success Rate",

        // Features
        featuresTag: "Why Choose Us?",
        featuresTitle: "The Foundation of Your Success",
        featuresSub: "We empower every student with the knowledge, skills, and confidence they need to excel.",
        f1Title: "Expert Graduate Teachers",
        f1Desc: "Our faculty consists of highly qualified, experienced graduates who are passionate about nurturing academic excellence in every student.",
        f2Title: "Individual Attention",
        f2Desc: "We identify each student's strengths and weaknesses and tailor our approach to ensure every child reaches their full potential.",
        f3Title: "Modern Facilities",
        f3Desc: "Well-equipped, peaceful classrooms with modern technology and learning materials that make studying engaging and effective.",
        f4Title: "Safe & Secure",
        f4Desc: "A CCTV-monitored, safe learning environment where parents can trust their children are in good hands at all times.",

        // Vision/Mission
        visionTitle: "Our Vision",
        visionText: "To make quality education accessible to all and to shape the next generation with knowledge, strength, and integrity.",
        missionTitle: "Our Mission",
        missionText: "To discover each student's unique potential, nurture their talents, and build responsible citizens who contribute positively to society.",

        // Contact
        contactTitle: "Contact & Location",
        contactPageTitle: "Contact Aharam High Standard College",
        contactPageSub: "Reach our team for admissions, course details, or any other information.",
        contactPhoneLabel: "Phone Numbers",
        contactEmailLabel: "Email",
        contactAddressLabel: "Address",
        contactFormName: "Full Name",
        contactFormEmail: "Email Address",
        contactFormMessage: "Message",
        contactFormSubmit: "Send Message",
        address1: "K.K.S Road, Kokuvil,",
        address2: "K.K.S Road, Mallakam,",
        address3: "Jaffna, Sri Lanka",
        phone: "077 656 2053",
        phoneAlt: "+94 77 656 2053",
        email: "aharam.info@gmail.com",
        website: "aharam.lk",

        // Login
        loginTitle: "Sign in to your account",
        loginSubtitle: "Enter your Login ID (Email/Username/Student ID) and password.",
        loginIdLabel: "Login ID",
        loginPasswordLabel: "Password",
        loginRememberMe: "Remember me",
        loginForgotPassword: "Forgot password?",
        loginBackToHome: "Back to Home",
        loginButton: "Sign In",
        loginLoading: "Signing in...",
        loginIdPlaceholder: "e.g., AHC-1001 or your email",
        loginPasswordPlaceholder: "Enter your password",
        loginErrorInvalid: "Invalid login ID or password.",
        loginErrorServer: "Server error. Please try again.",
        loginErrorNetwork: "Network error. Please check your connection.",

        // Centers
        centersTag: "Our Locations",
        centersTitle: "Two Convenient Centers",
        centersSub: "Strategically located to serve the students of Kokuvil and Mallakam in Jaffna.",
        center1Name: "Kokuvil Center",
        center1Addr: "K.K.S Road, Kokuvil, Jaffna",
        center2Name: "Mallakam Center",
        center2Addr: "K.K.S Road, Mallakam, Jaffna",

        // Footer
        footerTagline: "Your Academic Journey Begins Here.",
        footerQuickLinks: "Quick Links",
        copyright: "© 2026 Aharam High Standard College. All rights reserved.",
    },
    ta: {
        // Nav
        navHome: "முகப்பு",
        navCourses: "பாடநெறிகள்",
        navContact: "தொடர்புகளுக்கு",
        navLogin: "உள்நுழைவு",
        navAbout: "எம்மை பற்றி",

        // Hero
        collegeName: "அகரம் உயர் நிலைக் கல்லூரி",
        collegeSubtitle: "ஒழுக்கமுள்ள கல்வியால் எதிர்காலத்தை உருவாக்குகிறோம்.",
        heroTagline: "இன்றே கற்று, நாளை முன்னிலை வகிப்போம்.",
        heroParagraph: "ஒவ்வொரு மாணவனுக்கும் வலிமையான அடித்தளம் அவசியம். ஒழுக்கமான பயிற்சி, தனிப்பட்ட வழிகாட்டல், அமைதியான கற்றல் சூழல் ஆகியவற்றால் அறிவு, பண்பு, தன்னம்பிக்கை வளர்த்தெடுக்கிறோம்.",
        heroMotto: "அகரம் எம் தேகக்குழந்தைகளின் எற்றமிகு எதிர்காலம்",
        statStudents: "மாணவர்கள்",
        statTeachers: "ஆசிரியர்கள்",
        statCenters: "மையங்கள்",
        statSuccess: "வெற்றி விகிதம்",

        // Features
        featuresTag: "ஏன் எம்மை தெரிவு செய்ய வேண்டும்?",
        featuresTitle: "உங்கள் வெற்றியின் அடித்தளம்",
        featuresSub: "ஒவ்வொரு மாணவரையும் அறிவு, திறன், மற்றும் தன்னம்பிக்கையுடன் வளர்க்கிறோம்.",
        f1Title: "பட்டதாரி நிபுணர் ஆசிரியர்கள்",
        f1Desc: "தகுதிவாய்ந்த, அனுபவமிக்க ஆசிரியர்களால் ஒவ்வொரு மாணவரிலும் கல்வி சிறப்பை வளர்க்கிறோம்.",
        f2Title: "தனிப்பட்ட கவனம்",
        f2Desc: "ஒவ்வொரு மாணவரின் பலம் மற்றும் பலவீனங்களை அறிந்து, அவர்கள் முழு திறனை வெளிக்கொண்டு வர உதவுகிறோம்.",
        f3Title: "நவீன வசதிகள்",
        f3Desc: "சிறந்த தொழில்நுட்பம் மற்றும் கற்றல் பொருட்களுடன் கூடிய அமைதியான, நவீன வகுப்பறைகள்.",
        f4Title: "பாதுகாப்பான சூழல்",
        f4Desc: "சிசிடிவி கண்காணிப்புடன் கூடிய பாதுகாப்பான சூழலில் உங்கள் பிள்ளைகள் நல்ல கைகளில் உள்ளனர்.",

        // Vision/Mission
        visionTitle: "எமது நோக்கம்",
        visionText: "தரமான கல்வியை அனைவருக்கும் கிட்டச்செய்து, அடுத்த தலைமுறையை அறிவு, வலிமை மற்றும் ஒழுக்கத்துடன் உருவாக்குவது.",
        missionTitle: "எமது குறிக்கோள்",
        missionText: "ஒவ்வொரு மாணவரின் தனித்துவமான திறனை கண்டறிந்து, அவர்களின் ஆற்றலை வளர்த்து, சமூகத்திற்கு பயனுள்ள நல்ல பிரஜைகளாக உருவாக்குவது.",

        // Contact
        contactTitle: "தொடர்பு & இடம்",
        contactPageTitle: "அகரம் உயர் நிலைக் கல்லூரியை தொடர்புகொள்ள",
        contactPageSub: "சேர்க்கைகள், பாடநெறிகள் அல்லது பிற தகவல்களுக்கு நேரடியாக எங்களை தொடர்பு கொள்ளலாம்.",
        contactPhoneLabel: "தொலைபேசி எண்கள்",
        contactEmailLabel: "மின்னஞ்சல்",
        contactAddressLabel: "முகவரி",
        contactFormName: "முழுப்பெயர்",
        contactFormEmail: "மின்னஞ்சல் முகவரி",
        contactFormMessage: "செய்தி",
        contactFormSubmit: "செய்தியை அனுப்புக",
        address1: "K.K.S வீதி, கொக்குவில்,",
        address2: "K.K.S வீதி, மல்லாகம்,",
        address3: "யாழ்ப்பாணம், இலங்கை",
        phone: "077 656 2053",
        phoneAlt: "+94 77 656 2053",
        email: "aharam.info@gmail.com",
        website: "aharam.lk",

        // Login
        loginTitle: "கணக்கில் உள்நுழைவு",
        loginSubtitle: "உங்கள் உள்நுழைவு குறியீட்டை (மின்னஞ்சல்/பயனர்பெயர்/மாணவர் சுட்டெண்) மற்றும் கடவுச்சொல்லை உள்ளிடவும்.",
        loginIdLabel: "உள்நுழைவு குறியீடு",
        loginPasswordLabel: "கடவுச்சொல்",
        loginRememberMe: "என்னை நினைவில் கொள்",
        loginForgotPassword: "கடவுச்சொல்லை மறந்தீர்களா?",
        loginBackToHome: "முகப்புக்கு திரும்ப",
        loginButton: "உள்நுழைய",
        loginLoading: "உள்நுழைகிறது...",
        loginIdPlaceholder: "உ.ம்: AHC-1001 அல்லது உங்கள் மின்னஞ்சல்",
        loginPasswordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
        loginErrorInvalid: "தவறான உள்நுழைவு குறியீடு அல்லது கடவுச்சொல்.",
        loginErrorServer: "சேவையகப் பிழை. பின்னர் முயற்சிக்கவும்.",
        loginErrorNetwork: "இணையத் தொடர்பு பிழை. உங்கள் இணைப்பை சரிபார்க்கவும்.",

        // Centers
        centersTag: "எமது மையங்கள்",
        centersTitle: "இரண்டு வசதியான மையங்கள்",
        centersSub: "யாழ்ப்பாணத்தின் கொக்குவில் மற்றும் மல்லாகம் மாணவர்களுக்கு சேவை செய்கிறோம்.",
        center1Name: "கொக்குவில் மையம்",
        center1Addr: "K.K.S வீதி, கொக்குவில், யாழ்ப்பாணம்",
        center2Name: "மல்லாகம் மையம்",
        center2Addr: "K.K.S வீதி, மல்லாகம், யாழ்ப்பாணம்",

        // Footer
        footerTagline: "உங்கள் கல்வி பயணம் இங்கே தொடங்குகிறது.",
        footerQuickLinks: "இணைப்புகள்",
        copyright: "© 2026 அகரம் உயர் நிலைக் கல்லூரி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    },
};

type TranslationKeys = keyof typeof translations.en;

interface I18nContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (k: TranslationKeys) => string;
}

const I18nContext = createContext<I18nContextType>({
    lang: "en",
    setLang: () => { },
    t: (k) => k as string,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Lang>(() => {
        if (typeof window === "undefined") {
            return "en";
        }
        const storedLang = localStorage.getItem("appLang");
        return storedLang === "ta" ? "ta" : "en";
    });

    const setLangWithPersistence = useCallback((nextLang: Lang) => {
        setLang(nextLang);
        if (typeof window !== "undefined") {
            localStorage.setItem("appLang", nextLang);
            document.documentElement.lang = nextLang;
            document.documentElement.setAttribute("data-lang", nextLang);
        }
    }, []);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.lang = lang;
            document.documentElement.setAttribute("data-lang", lang);
        }
    }, [lang]);

    const t = useCallback(
        (k: TranslationKeys) => translations[lang][k] ?? k,
        [lang]
    );
    return (
        <I18nContext.Provider value={{ lang, setLang: setLangWithPersistence, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
