import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useLanguage } from '../lib/i18n';
import { apiFetch } from '../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Phone, MapPin, Mail, School, BookOpen, Hash, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function AddStudentScreen() {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        studentId: '',
        fullName: '',
        examBatch: '',
        medium: '',
        fatherName: '',
        motherName: '',
        parentPhoneNumber: '',
        email: '',
        address: '',
        schoolName: '',
        center: '',
        subjects: ''
    });

    const updateForm = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        if (step === 1 && (!form.fullName || !form.studentId || !form.examBatch || !form.medium)) {
            Alert.alert(t('error') || 'Error', t('fillAllFields'));
            return;
        }
        if (step === 2 && (!form.fatherName || !form.motherName || !form.parentPhoneNumber)) {
            Alert.alert(t('error') || 'Error', t('fillAllFields'));
            return;
        }
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submitForm = async () => {
        if (!form.center) {
            Alert.alert(t('error') || 'Error', t('fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch('/api/students/register', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    examBatch: parseInt(form.examBatch) || 2024
                })
            });

            if (res.ok) {
                Alert.alert(t('success'), t('studentAdded'), [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                const text = await res.text();
                Alert.alert('Error', text || 'Failed to register student');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient colors={['#064e3b', '#047857']} style={styles.headerArea}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('addStudent')}</Text>
                <Text style={styles.headerSub}>{t(`step${step}` as any)}</Text>

                {/* Progress Indicators */}
                <View style={styles.progressContainer}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
                    ))}
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <User color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('fullName')}
                                placeholderTextColor="#94a3b8"
                                value={form.fullName}
                                onChangeText={(v) => updateForm('fullName', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Hash color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Student ID (e.g. KT2026001)"
                                placeholderTextColor="#94a3b8"
                                value={form.studentId}
                                onChangeText={(v) => updateForm('studentId', v)}
                                autoCapitalize="characters"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <BookOpen color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={`${t('batch')} (e.g. 2026)`}
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={form.examBatch}
                                onChangeText={(v) => updateForm('examBatch', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputIcon, { color: '#94a3b8', fontWeight: 'bold' }]}>A</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={`${t('medium')} (Tamil/English)`}
                                placeholderTextColor="#94a3b8"
                                value={form.medium}
                                onChangeText={(v) => updateForm('medium', v)}
                            />
                        </View>
                    </View>
                )}

                {/* Step 2: Contact Info */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <User color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('father')}
                                placeholderTextColor="#94a3b8"
                                value={form.fatherName}
                                onChangeText={(v) => updateForm('fatherName', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <User color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('motherName')}
                                placeholderTextColor="#94a3b8"
                                value={form.motherName}
                                onChangeText={(v) => updateForm('motherName', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Phone color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('phoneLabel')}
                                placeholderTextColor="#94a3b8"
                                keyboardType="phone-pad"
                                value={form.parentPhoneNumber}
                                onChangeText={(v) => updateForm('parentPhoneNumber', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('emailLabel')}
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={form.email}
                                onChangeText={(v) => updateForm('email', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('address')}
                                placeholderTextColor="#94a3b8"
                                value={form.address}
                                onChangeText={(v) => updateForm('address', v)}
                            />
                        </View>
                    </View>
                )}

                {/* Step 3: Academic Details */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <View style={styles.inputGroup}>
                            <School color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('school')}
                                placeholderTextColor="#94a3b8"
                                value={form.schoolName}
                                onChangeText={(v) => updateForm('schoolName', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={`${t('center')} (Kokuvil/Mallakam)`}
                                placeholderTextColor="#94a3b8"
                                value={form.center}
                                onChangeText={(v) => updateForm('center', v)}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <BookOpen color="#94a3b8" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Subjects (Comma separated)"
                                placeholderTextColor="#94a3b8"
                                value={form.subjects}
                                onChangeText={(v) => updateForm('subjects', v)}
                            />
                        </View>
                    </View>
                )}

                {/* Wizard Controls */}
                <View style={styles.controls}>
                    {step > 1 ? (
                        <TouchableOpacity style={styles.btnSecondary} onPress={prevStep}>
                            <ArrowLeft color="#64748b" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.btnSecondaryText}>{t('back')}</Text>
                        </TouchableOpacity>
                    ) : <View style={{ flex: 1 }} />}

                    {step < 3 ? (
                        <TouchableOpacity style={styles.btnPrimary} onPress={nextStep}>
                            <Text style={styles.btnPrimaryText}>{t('next')}</Text>
                            <ArrowRight color="#fff" size={20} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.btnSubmit} onPress={submitForm} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.btnPrimaryText}>{t('submit')}</Text>
                                    <CheckCircle2 color="#fff" size={20} style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    backBtn: { alignSelf: 'flex-start', marginBottom: 20, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
    backBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
    headerSub: { fontSize: 16, color: '#a7f3d0', fontWeight: '600' },

    progressContainer: { flexDirection: 'row', gap: 8, marginTop: 24 },
    progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
    progressDotActive: { backgroundColor: '#fff' },

    formContainer: { padding: 24, paddingBottom: 60 },
    stepContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },

    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, height: 56, paddingHorizontal: 16, marginBottom: 16 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a', fontWeight: '500' },

    controls: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    btnSecondary: { flex: 1, flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1' },
    btnSecondaryText: { color: '#64748b', fontSize: 16, fontWeight: '700' },

    btnPrimary: { flex: 1, flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', borderRadius: 16 },
    btnSubmit: { flex: 2, flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#059669', borderRadius: 16, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
