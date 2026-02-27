import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import { useState } from 'react';
import { getAuth, clearAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { router } from 'expo-router';
import { LockKeyhole, Eye, EyeOff, LogOut, Check, X, ShieldAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STRENGTHS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
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
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const strength = getStrength(newPass);
    const matches = newPass && confirmPass && newPass === confirmPass;

    const handleChange = async () => {
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
        const auth = await getAuth();
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
                    { text: 'Awesome', onPress: () => { setOldPass(''); setNewPass(''); setConfirmPass(''); } }
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

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out of Aharam?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await clearAuth();
                        router.replace('/(auth)');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.headerArea}>
                <Text style={styles.pageTitle}>Account Settings</Text>
                <Text style={styles.pageSub}>Manage your security preferences</Text>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
                {/* Security Card */}
                <View style={styles.securityCard}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.iconBox}>
                            <ShieldAlert color="#059669" size={24} />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Change Password</Text>
                            <Text style={styles.cardSub}>கடவுச்சொல்லை மாற்றவும்</Text>
                        </View>
                    </View>

                    <View style={styles.formSpace}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputContainer}>
                            <LockKeyhole color="#94a3b8" size={18} style={styles.inputIcon} />
                            <TextInput
                                value={oldPass} onChangeText={setOldPass} secureTextEntry={!showOld}
                                placeholder="Enter current password" placeholderTextColor="#cbd5e1"
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeBtn}>
                                {showOld ? <EyeOff color="#94a3b8" size={18} /> : <Eye color="#94a3b8" size={18} />}
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <LockKeyhole color="#94a3b8" size={18} style={styles.inputIcon} />
                            <TextInput
                                value={newPass} onChangeText={setNewPass} secureTextEntry={!showNew}
                                placeholder="Min. 8 characters" placeholderTextColor="#cbd5e1"
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                                {showNew ? <EyeOff color="#94a3b8" size={18} /> : <Eye color="#94a3b8" size={18} />}
                            </TouchableOpacity>
                        </View>

                        {/* Strength Meter */}
                        {newPass.length > 0 && (
                            <View style={styles.strengthWrapper}>
                                <View style={styles.strengthBarContainer}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View key={i} style={[styles.strengthSegment, { backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#f1f5f9' }]} />
                                    ))}
                                </View>
                                <Text style={[styles.strengthText, { color: STRENGTH_COLORS[strength] }]}>
                                    {STRENGTHS[strength]} Password
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={[styles.inputContainer, matches && newPass.length > 0 && { borderColor: '#10b981', backgroundColor: '#f0fdf4' }]}>
                            <LockKeyhole color={matches && newPass.length > 0 ? '#10b981' : '#94a3b8'} size={18} style={styles.inputIcon} />
                            <TextInput
                                value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={!showConfirm}
                                placeholder="Re-enter password" placeholderTextColor="#cbd5e1"
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                {showConfirm ? <EyeOff color="#94a3b8" size={18} /> : <Eye color="#94a3b8" size={18} />}
                            </TouchableOpacity>
                        </View>

                        {/* Match Indicator */}
                        {confirmPass.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 16, gap: 6 }}>
                                {matches ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}
                                <Text style={{ fontSize: 13, fontWeight: '600', color: matches ? '#10b981' : '#ef4444' }}>
                                    {matches ? 'Passwords match perfectly' : 'Passwords do not match yet'}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity onPress={handleChange} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.7 }]}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>App Version</Text>
                    <Text style={styles.infoValue}>v1.0.0 (Premium Build)</Text>
                    <View style={styles.divider} />
                    <Text style={styles.infoTitle}>Push Notifications</Text>
                    <Text style={styles.infoValue}>Enabled via Expo Push API</Text>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut color="#ef4444" size={20} />
                    <Text style={styles.logoutText}>Sign Out of Device</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    pageSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

    securityCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06, shadowRadius: 16, elevation: 5,
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
    iconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
    cardSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

    formSpace: { marginTop: 8 },
    label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', height: 54,
        borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16,
        backgroundColor: '#fafafa', marginBottom: 20,
    },
    inputIcon: { marginLeft: 16, marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a', fontWeight: '500' },
    eyeBtn: { padding: 16, justifyContent: 'center' },

    strengthWrapper: { marginTop: -8, marginBottom: 20, paddingHorizontal: 4 },
    strengthBarContainer: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
    strengthText: { fontSize: 12, fontWeight: '700' },

    saveBtn: {
        backgroundColor: '#059669', borderRadius: 16, height: 56,
        alignItems: 'center', justifyContent: 'center', marginTop: 8,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

    infoCard: {
        backgroundColor: '#f1f5f9', borderRadius: 20, padding: 20,
        marginBottom: 32,
    },
    infoTitle: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    infoValue: { fontSize: 14, color: '#334155', fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 14 },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fecaca',
        borderRadius: 16, height: 56,
    },
    logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16 },
});
