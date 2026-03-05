import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, Alert, ActivityIndicator, Linking
} from 'react-native';
import { useState, useEffect } from 'react';
import { getAuth, clearAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { router } from 'expo-router';
import { useLanguage } from '../../lib/i18n';
import {
    KeyRound, Globe, HelpCircle, LogOut, ChevronRight, ChevronDown,
    LockKeyhole, Eye, EyeOff, MapPin, Phone, Clock, Mail, Check, X
} from 'lucide-react-native';

const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#10b981'];

function getStrength(p: string) {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
}

export default function SettingsScreen() {
    const { language, setLanguage, t } = useLanguage();
    const [auth, setAuth] = useState<any>({});
    const [expanded, setExpanded] = useState<string | null>(null);
    const strengths = ['', t('weak'), t('fair'), t('good'), t('strong')];

    // Password State
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAuth().then(setAuth);
    }, []);

    const strength = getStrength(newPass);
    const matches = newPass && confirmPass && newPass === confirmPass;

    const toggleSection = (section: string) => {
        setExpanded(expanded === section ? null : section);
    };

    const handleChangePassword = async () => {
        if (!oldPass || !newPass || !confirmPass) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        if (newPass !== confirmPass) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPass.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters.');
            return;
        }

        setSaving(true);
        try {
            const res = await apiFetch('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    username: auth.username,
                    oldPassword: oldPass,
                    newPassword: newPass,
                }),
            });
            if (res.ok) {
                Alert.alert('✅ Success', 'Password has been successfully changed.', [
                    { text: 'OK', onPress: () => { setOldPass(''); setNewPass(''); setConfirmPass(''); setExpanded(null); } }
                ]);
            } else {
                const body = await res.json().catch(() => ({}));
                Alert.alert('Error', body.message || 'Failed to change password.');
            }
        } catch {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('signOut'),
            t('signOutConfirm'),
            [
                { text: t('cancel'), style: "cancel" },
                {
                    text: t('logout'),
                    style: "destructive",
                    onPress: async () => {
                        await clearAuth();
                        router.replace('/(auth)');
                    }
                }
            ]
        );
    };

    const initial = auth.name ? auth.name.charAt(0).toUpperCase() : '?';
    const roleMap: any = { 'ADMIN': 'Admin', 'STAFF': 'Staff', 'PARENT': 'Student / Parent' };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('settings')}</Text>
            </View>

            {/* Profile Section (WhatsApp style) */}
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{auth.name || 'User'}</Text>
                    <Text style={styles.profileStatus}>{roleMap[auth.userRole] || 'Parent'} • {auth.username}</Text>
                </View>
            </View>

            {/* Settings List */}
            <View style={styles.listSection}>

                {/* Account Settings */}
                <TouchableOpacity style={styles.listItem} onPress={() => toggleSection('account')}>
                    <View style={styles.listIconBox}>
                        <KeyRound color="#64748b" size={24} />
                    </View>
                    <View style={styles.listTextContent}>
                        <Text style={styles.listTitle}>{t('accountSettings')}</Text>
                        <Text style={styles.listSub}>{t('securityPrefs')}</Text>
                    </View>
                    {expanded === 'account' ? <ChevronDown color="#94a3b8" size={20} /> : <ChevronRight color="#94a3b8" size={20} />}
                </TouchableOpacity>

                {expanded === 'account' && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.label}>{t('currentPassword')}</Text>
                        <View style={styles.inputContainer}>
                            <LockKeyhole color="#94a3b8" size={18} style={styles.inputIcon} />
                            <TextInput
                                value={oldPass} onChangeText={setOldPass} secureTextEntry={!showOld}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeBtn}>
                                {showOld ? <EyeOff color="#94a3b8" size={18} /> : <Eye color="#94a3b8" size={18} />}
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{t('newPassword')}</Text>
                        <View style={styles.inputContainer}>
                            <LockKeyhole color="#94a3b8" size={18} style={styles.inputIcon} />
                            <TextInput
                                value={newPass} onChangeText={setNewPass} secureTextEntry={!showNew}
                                style={styles.input}
                            />
                        </View>

                        {newPass.length > 0 && (
                            <View style={styles.strengthWrapper}>
                                <View style={styles.strengthBarContainer}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View key={i} style={[styles.strengthSegment, { backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#f1f5f9' }]} />
                                    ))}
                                </View>
                                <Text style={[styles.strengthText, { color: STRENGTH_COLORS[strength] }]}>{strengths[strength]}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>{t('confirmPassword')}</Text>
                        <View style={[styles.inputContainer, matches && newPass.length > 0 && { borderColor: '#10b981', backgroundColor: '#f0fdf4' }]}>
                            <LockKeyhole color={matches && newPass.length > 0 ? '#10b981' : '#94a3b8'} size={18} style={styles.inputIcon} />
                            <TextInput
                                value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={true}
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity onPress={handleChangePassword} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.7 }]}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('changePassword')}</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* App Language */}
                <TouchableOpacity style={styles.listItem} onPress={() => toggleSection('language')}>
                    <View style={styles.listIconBox}>
                        <Globe color="#64748b" size={24} />
                    </View>
                    <View style={styles.listTextContent}>
                        <Text style={styles.listTitle}>{t('language')}</Text>
                        <Text style={styles.listSub}>{t('languageSub')}</Text>
                    </View>
                    {expanded === 'language' ? <ChevronDown color="#94a3b8" size={20} /> : <ChevronRight color="#94a3b8" size={20} />}
                </TouchableOpacity>

                {expanded === 'language' && (
                    <View style={styles.expandedContent}>
                        <TouchableOpacity
                            style={[styles.langOption, language === 'en' && styles.langActive]}
                            onPress={() => setLanguage('en')}
                        >
                            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English (UK)</Text>
                            {language === 'en' && <Check color="#059669" size={20} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.langOption, language === 'ta' && styles.langActive]}
                            onPress={() => setLanguage('ta')}
                        >
                            <Text style={[styles.langText, language === 'ta' && styles.langTextActive]}>தமிழ் (Tamil)</Text>
                            {language === 'ta' && <Check color="#059669" size={20} />}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Help & Contact */}
                <TouchableOpacity style={styles.listItem} onPress={() => toggleSection('help')}>
                    <View style={styles.listIconBox}>
                        <HelpCircle color="#64748b" size={24} />
                    </View>
                    <View style={styles.listTextContent}>
                        <Text style={styles.listTitle}>{t('helpContact')}</Text>
                        <Text style={styles.listSub}>{t('helpSub')}</Text>
                    </View>
                    {expanded === 'help' ? <ChevronDown color="#94a3b8" size={20} /> : <ChevronRight color="#94a3b8" size={20} />}
                </TouchableOpacity>

                {expanded === 'help' && (
                    <View style={styles.expandedContent}>
                        <View style={styles.contactCard}>
                            <Text style={styles.contactTitle}>{t('collegeName')}</Text>

                            <View style={styles.contactRow}>
                                <MapPin color="#64748b" size={18} />
                                <Text style={styles.contactText}>{t('collegeAddress')}</Text>
                            </View>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${t('phone')}`)}>
                                <Phone color="#059669" size={18} />
                                <Text style={[styles.contactText, { color: '#059669' }]}>{t('phone')}</Text>
                            </TouchableOpacity>
                            <View style={styles.contactRow}>
                                <Clock color="#64748b" size={18} />
                                <Text style={styles.contactText}>{t('hours')}</Text>
                            </View>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${t('email')}`)}>
                                <Mail color="#0ea5e9" size={18} />
                                <Text style={[styles.contactText, { color: '#0ea5e9' }]}>{t('email')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://${t('web')}`)}>
                                <Globe color="#8b5cf6" size={18} />
                                <Text style={[styles.contactText, { color: '#8b5cf6' }]}>{t('web')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Logout Section */}
            <View style={styles.listSection}>
                <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
                    <View style={styles.listIconBox}>
                        <LogOut color="#ef4444" size={24} />
                    </View>
                    <View style={styles.listTextContent}>
                        <Text style={[styles.listTitle, { color: '#ef4444' }]}>{t('signOut')}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.aboutBox}>
                    <Text style={styles.aboutText}>Aharam Tuition Management</Text>
                    <Text style={styles.aboutText}>{t('aboutSub')}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { paddingTop: 24, paddingBottom: 16, paddingHorizontal: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },

    profileSection: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 20, marginBottom: 24,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0',
    },
    avatar: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#059669',
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    profileStatus: { fontSize: 14, color: '#64748b', fontWeight: '500' },

    listSection: {
        backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: '#e2e8f0', marginBottom: 24,
    },
    listItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, paddingVertical: 18,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0',
    },
    listIconBox: { width: 32, alignItems: 'center', marginRight: 16 },
    listTextContent: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    listSub: { fontSize: 13, color: '#64748b' },

    expandedContent: {
        padding: 20, backgroundColor: '#fafafa',
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0',
    },

    langOption: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    langActive: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
    langText: { fontSize: 16, color: '#334155', fontWeight: '600' },
    langTextActive: { color: '#059669', fontWeight: '800' },

    contactCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    contactTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    contactRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
    contactText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500' },

    label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', height: 50,
        borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12,
        backgroundColor: '#fff', marginBottom: 16,
    },
    inputIcon: { marginLeft: 16, marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a' },
    eyeBtn: { padding: 12 },
    saveBtn: {
        backgroundColor: '#059669', borderRadius: 12, height: 50,
        alignItems: 'center', justifyContent: 'center', marginTop: 8,
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    strengthWrapper: { marginTop: -8, marginBottom: 16, paddingHorizontal: 4 },
    strengthBarContainer: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
    strengthText: { fontSize: 12, fontWeight: '700' },

    aboutBox: { padding: 24, alignItems: 'center' },
    aboutText: { color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 4 }
});

