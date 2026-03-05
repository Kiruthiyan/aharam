import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type Language = 'en' | 'ta';

interface Translation {
    [key: string]: string;
}

const translations: Record<Language, Translation> = {
    en: {
        dashboard: 'Dashboard',
        attendance: 'Attendance',
        scan: 'Scan',
        myQr: 'My QR',
        marks: 'Marks',
        fees: 'Fees',
        settings: 'Settings',
        logout: 'Logout',
        // Settings specific
        accountSettings: 'Account Settings',
        securityPrefs: 'Manage your security preferences',
        changePassword: 'Change Password',
        language: 'App Language',
        languageSub: 'English',
        helpContact: 'Help & Contact',
        helpSub: 'College Details & Support',
        aboutApp: 'About App',
        aboutSub: 'Version & App Info',
        signOut: 'Sign Out of Device',
        signOutConfirm: 'Are you sure you want to log out?',
        // Contact Details
        collegeName: 'Aharam High Standard College',
        collegeAddress: 'M2X8+JFW, Jaffna, Sri Lanka\nK.K.S Road Kokuvil / Mallakam',
        phone: '077 656 2053',
        hours: 'Closed · Opens Sat. 06:00',
        web: 'aharam.lk',
        email: 'aharam.info@gmail.com',
        // Login Specific
        loginTitle: 'Aharam Tuition Center',
        loginSub: 'Aharam Tuition Management',
        loginCardTitle: 'Login to your account',
        usernameLabel: 'Username / ID',
        usernameHolder: 'e.g. KT2026001 or admin',
        passwordLabel: 'Password',
        passwordHolder: 'Enter your password',
        signInBtn: 'Sign In',
        emptyFields: 'Please enter username and password',
        invalidCreds: 'Invalid Credentials',
        networkError: 'Network Error. Please check your connection.',
        securedBy: 'Secured by Aharam Tech Team',
        // Dashboard Specific
        greeting: 'Hello! 👋',
        systemAdmin: '🔧 System Admin',
        staffMember: '👩‍🏫 Staff Member',
        parentAccess: '👨‍👩‍👧 Parent Access',
        overview: 'Overview',
        totalStudents: 'Total Students',
        totalStaff: 'Total Staff',
        feesCollected: 'Fees Collected',
        absentToday: 'Absent Today',
        todaysAttendance: 'Today\'s Attendance',
        present: 'Present',
        absent: 'Absent',
        yourStudent: 'Your Student',
        quickActions: 'Quick Actions',
        idLabel: 'ID:',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong',
        cancel: 'Cancel',
        // Students Specific
        studentsTitle: 'Students Directory',
        searchStudent: 'Search by Name or ID...',
        noStudents: 'No students found.',
        batch: 'Batch',
        statusActive: 'Active',
        statusInactive: 'Inactive',
        father: 'Father / Guardian',
        phoneLabel: 'Phone',
        school: 'School',
        center: 'Center',
        callParent: 'Call Parent',

        // Add Student Wizard
        addStudent: 'Add Student',
        step1: 'Personal Details',
        step2: 'Contact Info',
        step3: 'Academic Details',
        next: 'Next',
        back: 'Back',
        submit: 'Register Student',
        fullName: 'Full Name',
        motherName: 'Mother Name',
        address: 'Residential Address',
        emailLabel: 'Email Address',
        medium: 'Medium',
        success: 'Success',
        studentAdded: 'Student registered successfully!',
        fillAllFields: 'Please fill all required fields.'
    },
    ta: {
        dashboard: 'முகப்பு',
        attendance: 'வருகை',
        scan: 'ஸ்கேன்',
        myQr: 'எனது QR',
        marks: 'மதிப்பெண்கள்',
        fees: 'கட்டணம்',
        settings: 'அமைப்புகள்',
        logout: 'வெளியேறு',
        // Settings specific
        accountSettings: 'கணக்கு அமைப்புகள்',
        securityPrefs: 'உங்கள் பாதுகாப்பு விருப்பங்களை நிர்வகிக்கவும்',
        changePassword: 'கடவுச்சொல்லை மாற்றவும்',
        language: 'செயலி மொழி',
        languageSub: 'தமிழ்',
        helpContact: 'உதவி மற்றும் தொடர்பு',
        helpSub: 'கல்லூரி விவரங்கள் மற்றும் தொடர்பு',
        aboutApp: 'செயலி விவரம்',
        aboutSub: 'பதிப்பு (Version 1.0.0)',
        signOut: 'வெளியேறு',
        signOutConfirm: 'நிச்சயமாக வெளியேற வேண்டுமா?',
        // Contact Details
        collegeName: 'அகரம் உயர் நிலைக் கல்லூரி',
        collegeAddress: 'M2X8+JFW, யாழ்ப்பாணம், இலங்கை\nK.K.S வீதி கொக்குவில் / மல்லாகம்',
        phone: '077 656 2053',
        hours: 'மூடப்பட்டுள்ளது · சனிக்கிழமை 06:00 திறக்கப்படும்',
        web: 'aharam.lk',
        email: 'aharam.info@gmail.com',
        // Login Specific
        loginTitle: 'அகரம் கல்விக் கூடம்',
        loginSub: 'அகரம் கல்வி மேலாண்மை',
        loginCardTitle: 'உங்கள் கணக்கில் உள்நுழைக',
        usernameLabel: 'பயனர் பெயர்',
        usernameHolder: 'உதா. KT2026001 அல்லது admin',
        passwordLabel: 'கடவுச்சொல்',
        passwordHolder: 'கடவுச்சொல்லை உள்ளிடவும்',
        signInBtn: 'உள்நுழைக',
        emptyFields: 'பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்',
        invalidCreds: 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்',
        networkError: 'நெட்வொர்க் பிழை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்.',
        securedBy: 'அகரம் தொழில்நுட்பக் குழுவால் பாதுகாக்கப்பட்டது',
        // Dashboard Specific
        greeting: 'வணக்கம்! 👋',
        systemAdmin: '🔧 கணினி நிர்வாகி',
        staffMember: '👩‍🏫 ஆசிரியர்',
        parentAccess: '👨‍👩‍👧 பெற்றோர் அணுகல்',
        overview: 'கண்ணோட்டம்',
        totalStudents: 'மொத்த மாணவர்கள்',
        totalStaff: 'மொத்த ஆசிரியர்கள்',
        feesCollected: 'வசூலிக்கப்பட்ட கட்டணம்',
        absentToday: 'இன்று வராதவர்கள்',
        todaysAttendance: 'இன்றைய வருகை',
        present: 'வந்தவர்கள்',
        absent: 'வராதவர்கள்',
        yourStudent: 'உங்கள் மாணவர்',
        quickActions: 'விரைவான செயல்கள்',
        idLabel: 'அடையாளம்:',
        currentPassword: 'தற்போதைய கடவுச்சொல்',
        newPassword: 'புதிய கடவுச்சொல்',
        confirmPassword: 'கடவுச்சொல்லை மீண்டும் உள்ளிடுக',
        weak: 'பலவீனம்',
        fair: 'சுமாரானது',
        good: 'நன்று',
        strong: 'வலுவானது',
        cancel: 'ரத்து செய்',
        // Students Specific
        studentsTitle: 'மாணவர் விபரங்கள்',
        searchStudent: 'பெயர் அல்லது ID மூலம் தேடுக...',
        noStudents: 'மாணவர்கள் காணப்படவில்லை.',
        batch: 'Batch',
        statusActive: 'செயலில்',
        statusInactive: 'செயலற்றவர்',
        father: 'தந்தை / பாதுகாவலர்',
        phoneLabel: 'தொலைபேசி எண்',
        school: 'பாடசாலை',
        center: 'கற்பிக்கும் இடம்',
        callParent: 'அழைப்பினை மேற்கொள்ள',

        // Add Student Wizard
        addStudent: 'புதிய மாணவர்',
        step1: 'சுய விபரங்கள்',
        step2: 'தொடர்பு விபரங்கள்',
        step3: 'கல்வி விபரங்கள்',
        next: 'அடுத்து',
        back: 'பின்செல்',
        submit: 'பதிவு செய்',
        fullName: 'முழுப் பெயர்',
        motherName: 'தாயின் பெயர்',
        address: 'வசிப்பிட முகவரி',
        emailLabel: 'மின்னஞ்சல்',
        medium: 'மொழிமூலம்',
        success: 'வெற்றி',
        studentAdded: 'மாணவர் வெற்றிகரமாக பதிவு செய்யப்பட்டார்!',
        fillAllFields: 'தயவுசெய்து அனைத்து விபரங்களையும் உள்ளிடவும்.'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLangState] = useState<Language>('ta'); // Default to Tamil

    useEffect(() => {
        const loadLang = async () => {
            let saved = null;
            if (Platform.OS === 'web') {
                saved = localStorage.getItem('appLang');
            } else {
                saved = await SecureStore.getItemAsync('appLang');
            }
            if (saved === 'en' || saved === 'ta') {
                setLangState(saved);
            }
        };
        loadLang();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLangState(lang);
        if (Platform.OS === 'web') {
            localStorage.setItem('appLang', lang);
        } else {
            await SecureStore.setItemAsync('appLang', lang);
        }
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
