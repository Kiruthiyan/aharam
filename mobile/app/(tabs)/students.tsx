import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    ActivityIndicator, StyleSheet, RefreshControl, Linking, Platform
} from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Phone, Users, School, MapPin, ChevronRight, GraduationCap, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

interface Student {
    studentId: string;
    fullName: string;
    fatherName: string;
    parentPhoneNumber: string;
    schoolName: string;
    status: string;
    examBatch?: number;
    center?: string;
    medium?: string;
}

export default function StudentsScreen() {
    const { t } = useLanguage();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const loadStudents = async () => {
        try {
            const res = await apiFetch('/api/students');
            if (res.ok) {
                setStudents(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStudents();
        setRefreshing(false);
    };

    const callParent = (phone: string) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };

    const filteredStudents = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return students;
        return students.filter(s =>
            s.fullName?.toLowerCase().includes(query) ||
            s.studentId?.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Slide-over detail panel is rendered conditionally over the list if a student is selected.
    if (selectedStudent) {
        const s = selectedStudent;
        const initial = s.fullName ? s.fullName.substring(0, 2).toUpperCase() : 'ST';
        const isActive = s.status === 'ACTIVE';

        return (
            <View style={styles.detailContainer}>
                {/* Header */}
                <LinearGradient colors={['#064e3b', '#047857']} style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setSelectedStudent(null)} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.detailHeaderContent}>
                        <View style={styles.detailAvatar}>
                            <Text style={styles.detailAvatarText}>{initial}</Text>
                        </View>
                        <View>
                            <Text style={styles.detailName}>{s.fullName}</Text>
                            <Text style={styles.detailId}>{s.studentId}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView style={styles.detailBody} contentContainerStyle={{ padding: 20 }}>
                    <View style={styles.statusRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                            <Text style={[styles.statusBadgeText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                                {isActive ? t('statusActive') : t('statusInactive')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Users color="#94a3b8" size={20} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('father')}</Text>
                                <Text style={styles.infoValue}>{s.fatherName || '—'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Phone color="#059669" size={20} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('phoneLabel')}</Text>
                                <Text style={styles.infoValue}>{s.parentPhoneNumber || '—'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <School color="#94a3b8" size={20} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('school')}</Text>
                                <Text style={styles.infoValue}>{s.schoolName || '—'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <MapPin color="#94a3b8" size={20} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('center')}</Text>
                                <Text style={styles.infoValue}>{s.center || '—'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <GraduationCap color="#94a3b8" size={20} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('batch')} / Medium</Text>
                                <Text style={styles.infoValue}>{t('batch')} {s.examBatch || '—'} — {s.medium || '—'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => callParent(s.parentPhoneNumber)}
                        disabled={!s.parentPhoneNumber}
                    >
                        <LinearGradient colors={['#10b981', '#059669']} style={styles.callBtnGradient}>
                            <Phone color="#fff" size={20} />
                            <Text style={styles.callBtnText}>{t('callParent')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // Main List View
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('studentsTitle')}</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search color="#94a3b8" size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('searchStudent')}
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />
                    }
                >
                    {filteredStudents.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Users color="#cbd5e1" size={48} />
                            <Text style={styles.emptyText}>{t('noStudents')}</Text>
                        </View>
                    ) : (
                        filteredStudents.map((s) => {
                            const initial = s.fullName ? s.fullName.substring(0, 2).toUpperCase() : 'ST';
                            const isActive = s.status === 'ACTIVE';

                            return (
                                <TouchableOpacity
                                    key={s.studentId}
                                    style={styles.card}
                                    onPress={() => setSelectedStudent(s)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.cardRow}>
                                        <View style={styles.listAvatar}>
                                            <Text style={styles.listAvatarText}>{initial}</Text>
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.cardName}>{s.fullName}</Text>
                                            <Text style={styles.cardId}>{s.studentId}</Text>
                                        </View>
                                        <ChevronRight color="#cbd5e1" size={24} />
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.badgeWrapper}>
                                            <Text style={styles.badgeText}>{t('batch')} {s.examBatch || '—'}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                                            <Text style={[styles.statusBadgeSmallText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                                                {isActive ? t('statusActive') : t('statusInactive')}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* Premium Floating Action Button for adding a user */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => router.push('/add-student')}
            >
                <LinearGradient colors={['#10b981', '#059669']} style={styles.fabGradient}>
                    <Plus color="#fff" size={28} strokeWidth={3} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 24, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },

    searchContainer: {
        paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9',
        borderRadius: 12, paddingHorizontal: 16, height: 48,
    },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#0f172a' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 100 },

    emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.7 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '500' },

    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    listAvatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5',
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    listAvatarText: { color: '#059669', fontSize: 18, fontWeight: '700' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    cardId: { fontSize: 13, color: '#64748b', fontWeight: '500' },

    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#f1f5f9'
    },
    badgeWrapper: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, color: '#475569', fontWeight: '600' },

    statusBadgeSmallText: { fontSize: 11, fontWeight: '700' },

    // Detail View Styles
    detailContainer: { flex: 1, backgroundColor: '#f8fafc' },
    detailHeader: { paddingTop: 40, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
    backBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
    detailHeaderContent: { flexDirection: 'row', alignItems: 'center' },
    detailAvatar: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center', justifyContent: 'center', marginRight: 16
    },
    detailAvatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    detailName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    detailId: { color: '#a7f3d0', fontSize: 14, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    detailBody: { flex: 1 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    detailLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },

    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusBadgeActive: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
    statusBadgeInactive: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    statusTextActive: { color: '#059669', fontSize: 13, fontWeight: '700' },
    statusTextInactive: { color: '#dc2626', fontSize: 13, fontWeight: '700' },

    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
    infoTextContainer: { marginLeft: 16, flex: 1 },
    infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
    infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '600' },

    callBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    callBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 12 },
    callBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    fab: {
        position: 'absolute', right: 20, bottom: 20,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, borderRadius: 32
    },
    fabGradient: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center'
    }
});
