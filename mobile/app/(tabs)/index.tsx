import {
    View, Text, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, StyleSheet, Dimensions
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getAuth, clearAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, UserCheck, Wallet, XCircle, ScanLine, LogOut, CheckCircle, ChevronRight, GraduationCap, CalendarCheck2, FileText } from 'lucide-react-native';
import { useLanguage } from '../../lib/i18n';

const { width } = Dimensions.get('window');

interface Stats {
    totalStudents?: number;
    totalStaff?: number;
    totalFeesCollected?: number;
    totalAbsent?: number;
    totalPresent?: number;
}

function StatCard({ icon: Icon, title, value, gradientColors }: { icon: any; title: string; value: string | number; gradientColors: readonly [string, string, ...string[]] }) {
    return (
        <View style={styles.statCardWrapper}>
            <LinearGradient colors={gradientColors} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.statHeader}>
                    <Icon color="#fff" size={24} strokeWidth={2.5} />
                    <Text style={styles.statValue}>{value}</Text>
                </View>
                <Text style={styles.statLabel}>{title}</Text>
            </LinearGradient>
        </View>
    );
}

export default function DashboardScreen() {
    const { t } = useLanguage();
    const [auth, setAuth] = useState<any>({});
    const [stats, setStats] = useState<Stats>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        const a = await getAuth();
        setAuth(a);
        try {
            const res = await apiFetch('/api/dashboard/stats');
            if (res.ok) setStats(await res.json());
        } catch { }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const handleLogout = async () => {
        await clearAuth();
        router.replace('/(auth)');
    };

    const isParent = auth.userRole === 'PARENT';
    const isAdmin = auth.userRole === 'ADMIN';
    const isStaff = auth.userRole === 'STAFF' || isAdmin;

    const roleLabel = isAdmin ? t('systemAdmin') : isStaff ? t('staffMember') : t('parentAccess');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        >
            {/* Premium Header Banner */}
            <LinearGradient colors={['#064e3b', '#047857']} style={styles.banner}>
                <View style={styles.bannerContent}>
                    <View>
                        <Text style={styles.bannerGreet}>{t('greeting')}</Text>
                        <Text style={styles.bannerName}>{auth.name || auth.username}</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <UserCheck color="#064e3b" size={32} />
                    </View>
                </View>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{roleLabel}</Text>
                </View>
            </LinearGradient>

            <View style={styles.contentPad}>
                {loading ? (
                    <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {isAdmin && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{t('overview')}</Text>
                                </View>
                                <View style={styles.row}>
                                    <StatCard icon={GraduationCap} title={t('totalStudents')} value={stats.totalStudents ?? '—'} gradientColors={['#0ea5e9', '#0284c7']} />
                                    <StatCard icon={Users} title={t('totalStaff')} value={stats.totalStaff ?? '—'} gradientColors={['#8b5cf6', '#6d28d9']} />
                                </View>
                                <View style={styles.row}>
                                    <StatCard icon={Wallet} title={t('feesCollected')} value={`Rs.${stats.totalFeesCollected ?? 0}`} gradientColors={['#10b981', '#059669']} />
                                    <StatCard icon={XCircle} title={t('absentToday')} value={stats.totalAbsent ?? 0} gradientColors={['#f43f5e', '#e11d48']} />
                                </View>
                            </>
                        )}

                        {isStaff && !isAdmin && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{t('todaysAttendance')}</Text>
                                </View>
                                <View style={styles.row}>
                                    <StatCard icon={CheckCircle} title={t('present')} value={stats.totalPresent ?? '—'} gradientColors={['#10b981', '#059669']} />
                                    <StatCard icon={XCircle} title={t('absent')} value={stats.totalAbsent ?? '—'} gradientColors={['#f43f5e', '#e11d48']} />
                                </View>
                            </>
                        )}

                        {isParent && (
                            <View style={styles.parentCard}>
                                <View style={styles.parentCardHeader}>
                                    <View>
                                        <Text style={styles.parentCardTitle}>{t('yourStudent')}</Text>
                                        <Text style={styles.parentName}>{auth.name}</Text>
                                        <Text style={styles.parentId}>{t('idLabel')} {auth.username}</Text>
                                    </View>
                                    <View style={styles.studentIconBox}>
                                        <GraduationCap color="#059669" size={28} />
                                    </View>
                                </View>

                                <View style={styles.quickLinks}>
                                    <TouchableOpacity style={styles.quickLinkItem} onPress={() => router.navigate('/attendance')}>
                                        <View style={[styles.quickLinkIcon, { backgroundColor: '#dcfce7' }]}>
                                            <CalendarCheck2 color="#15803d" size={22} />
                                        </View>
                                        <Text style={styles.quickLinkText}>{t('attendance')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quickLinkItem} onPress={() => router.navigate('/marks')}>
                                        <View style={[styles.quickLinkIcon, { backgroundColor: '#f3e8ff' }]}>
                                            <FileText color="#7e22ce" size={22} />
                                        </View>
                                        <Text style={styles.quickLinkText}>{t('marks')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quickLinkItem} onPress={() => router.navigate('/fees')}>
                                        <View style={[styles.quickLinkIcon, { backgroundColor: '#fef08a' }]}>
                                            <Wallet color="#a16207" size={22} />
                                        </View>
                                        <Text style={styles.quickLinkText}>{t('fees')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Quick Actions for Staff */}
                        {isStaff && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                                </View>
                                <View style={styles.actionGrid}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/scan')}>
                                        <LinearGradient colors={['#10b981', '#059669']} style={styles.actionIconBg}>
                                            <ScanLine color="#fff" size={28} />
                                        </LinearGradient>
                                        <Text style={styles.actionBtnLabel}>{t('scan')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/attendance')}>
                                        <View style={[styles.actionIconBg, { backgroundColor: '#f1f5f9' }]}>
                                            <CalendarCheck2 color="#334155" size={28} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>{t('attendance')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/marks')}>
                                        <View style={[styles.actionIconBg, { backgroundColor: '#f1f5f9' }]}>
                                            <FileText color="#334155" size={28} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>{t('marks')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/fees')}>
                                        <View style={[styles.actionIconBg, { backgroundColor: '#f1f5f9' }]}>
                                            <Wallet color="#334155" size={28} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>{t('fees')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </>
                )}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut color="#dc2626" size={20} />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    banner: {
        paddingTop: 30, paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
        marginBottom: 20,
    },
    bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bannerGreet: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
    bannerName: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
    avatarCircle: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
    },
    roleBadge: {
        marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    contentPad: { paddingHorizontal: 20 },
    sectionHeader: { marginBottom: 16, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    row: { flexDirection: 'row', marginHorizontal: -6, marginBottom: 12 },
    statCardWrapper: { flex: 1, paddingHorizontal: 6 },
    statCard: {
        borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 26, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

    parentCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 16,
        marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
    },
    parentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
    parentCardTitle: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 4 },
    parentName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    parentId: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
    studentIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
    quickLinks: { flexDirection: 'row', justifyContent: 'space-between' },
    quickLinkItem: { alignItems: 'center', flex: 1 },
    quickLinkIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickLinkText: { fontSize: 12, fontWeight: '600', color: '#475569' },

    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
    actionBtn: {
        width: '50%', padding: 6, alignItems: 'center'
    },
    actionIconBg: {
        width: 70, height: 70, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
        backgroundColor: '#fff',
    },
    actionBtnLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },

    logoutBtn: {
        marginTop: 30, marginBottom: 20,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 16,
        padding: 16, backgroundColor: '#fef2f2',
    },
    logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});
