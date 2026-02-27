import {
    View, Text, ScrollView, ActivityIndicator,
    RefreshControl, StyleSheet
} from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { IndianRupee, Clock, CheckCircle2, FileClock, Info } from 'lucide-react-native';

interface Fee {
    id: number;
    month: string;
    amount: number;
    status: string;
    paidDate?: string;
}

export default function FeesScreen() {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        const auth = await getAuth();
        const res = await apiFetch(`/api/fees/student/${auth.username}`);
        if (res.ok) setFees(await res.json());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const totalPaid = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);
    const paidCount = fees.filter(f => f.status === 'PAID').length;
    const pendingCount = Math.max(0, 12 - paidCount);

    if (loading) return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <ActivityIndicator size="large" color="#059669" />
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        >
            <View style={styles.headerArea}>
                <Text style={styles.pageTitle}>Fee Management</Text>
                <Text style={styles.pageSub}>Track your tuition payments</Text>
            </View>

            {/* Premium Header Summary Card */}
            <View style={{ paddingHorizontal: 20 }}>
                <LinearGradient
                    colors={['#064e3b', '#047857']}
                    style={styles.summaryCard}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <View style={styles.summaryTop}>
                        <View style={styles.rupeeBg}>
                            <IndianRupee color="#059669" size={28} />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.totalVal}>₹ {totalPaid.toLocaleString()}</Text>
                            <Text style={styles.totalLabel}>Total Fees Paid</Text>
                        </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryBottom}>
                        <View style={styles.summaryItem}>
                            <View style={[styles.dot, { backgroundColor: '#34d399' }]} />
                            <Text style={styles.statVal}>{paidCount}</Text>
                            <Text style={styles.statLabel}>Paid Months</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <View style={[styles.dot, { backgroundColor: '#fca5a5' }]} />
                            <Text style={[styles.statVal, { color: '#fca5a5' }]}>{pendingCount}</Text>
                            <Text style={styles.statLabel}>Pending Months</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Payment History</Text>
                    <Info color="#94a3b8" size={18} />
                </View>

                {fees.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 40 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <FileClock color="#94a3b8" size={32} />
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 16, fontWeight: '600' }}>No fee records yet</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Your payment history will appear here.</Text>
                    </View>
                ) : (
                    fees.map((fee, i) => {
                        const paid = fee.status === 'PAID';
                        return (
                            <View key={fee.id} style={styles.feeRow}>
                                <View style={[styles.monthIcon, paid ? styles.paidIconBg : styles.pendingIconBg]}>
                                    {paid ? <CheckCircle2 color="#059669" size={22} /> : <Clock color="#e11d48" size={22} />}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.monthText}>{fee.month}</Text>
                                    <Text style={styles.dateText}>
                                        {fee.paidDate ? `Paid on ${new Date(fee.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Awaiting Payment'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.amountText}>₹ {fee.amount?.toLocaleString()}</Text>
                                    <View style={[styles.statusBadge, paid ? styles.paidBadge : styles.pendingBadge]}>
                                        <Text style={[styles.statusText, { color: paid ? '#059669' : '#e11d48' }]}>
                                            {paid ? 'PAID' : 'PENDING'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    pageSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

    summaryCard: {
        borderRadius: 24, padding: 24,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
        marginBottom: 28,
    },
    summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rupeeBg: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    totalVal: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    totalLabel: { fontSize: 12, color: '#a7f3d0', fontWeight: '600', marginTop: 4 },
    summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
    summaryBottom: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    dot: { width: 6, height: 6, borderRadius: 3, marginBottom: 8 },
    statVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 11, color: '#a7f3d0', fontWeight: '500', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },

    feeRow: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 16,
        marginBottom: 12, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    monthIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    paidIconBg: { backgroundColor: '#dcfce7' },
    pendingIconBg: { backgroundColor: '#ffe4e6' },
    monthText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
    dateText: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' },
    amountText: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
    paidBadge: { backgroundColor: '#dcfce7' },
    pendingBadge: { backgroundColor: '#ffe4e6' },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
