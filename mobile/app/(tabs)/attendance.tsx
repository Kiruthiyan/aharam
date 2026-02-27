import {
    View, Text, ScrollView, ActivityIndicator,
    RefreshControl, StyleSheet, TouchableOpacity
} from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, TrendingUp } from 'lucide-react-native';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export default function AttendanceScreen() {
    const [role, setRole] = useState('PARENT');
    const [userId, setUserId] = useState('');
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear] = useState(new Date().getFullYear());

    const load = async () => {
        const auth = await getAuth();
        setRole(auth.userRole || 'PARENT');
        setUserId(auth.username || '');

        if (auth.userRole === 'PARENT') {
            const res = await apiFetch(`/api/attendance/student/${auth.username}`);
            if (res.ok) setRecords(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    // Calendar for parent
    const monthRecords = records.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

    const getStatus = (day: number) => {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const r = monthRecords.find(r => r.date === dateStr);
        return r?.status;
    };

    const present = monthRecords.filter(r => r.status === 'PRESENT').length;
    const total = monthRecords.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

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
                <Text style={styles.pageTitle}>Monthly Attendance</Text>
                <Text style={styles.pageSub}>Track your presence easily</Text>
            </View>

            {/* Premium Month Selector Banner */}
            <View style={styles.monthScrollWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthBar}>
                    {MONTHS.map((m, i) => {
                        const isActive = selectedMonth === i;
                        return (
                            <TouchableOpacity
                                key={m}
                                onPress={() => setSelectedMonth(i)}
                                style={[styles.monthChip, isActive && styles.monthChipActive]}
                            >
                                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                                    {m.substring(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { borderColor: '#dcfce7', backgroundColor: '#f0fdf4' }]}>
                        <CheckCircle2 color="#10b981" size={24} />
                        <Text style={styles.summaryVal}>{present}</Text>
                        <Text style={styles.summaryLabel}>Present</Text>
                    </View>
                    <View style={[styles.summaryCard, { borderColor: '#fee2e2', backgroundColor: '#fef2f2' }]}>
                        <XCircle color="#f43f5e" size={24} />
                        <Text style={styles.summaryVal}>{total - present}</Text>
                        <Text style={styles.summaryLabel}>Absent</Text>
                    </View>
                    <View style={[styles.summaryCard, { borderColor: '#e0f2fe', backgroundColor: '#f0f9ff' }]}>
                        <TrendingUp color="#0ea5e9" size={24} />
                        <Text style={styles.summaryVal}>{pct}%</Text>
                        <Text style={styles.summaryLabel}>Rate</Text>
                    </View>
                </View>

                {/* Glassmorphism Calendar Card */}
                <View style={styles.calendarCard}>
                    <View style={styles.calHeaderBox}>
                        <CalendarIcon color="#059669" size={20} />
                        <Text style={styles.calTitle}>
                            {MONTHS[selectedMonth]} {selectedYear}
                        </Text>
                    </View>

                    {/* Day headers */}
                    <View style={styles.calRow}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <Text key={d} style={styles.calDayHeader}>{d}</Text>
                        ))}
                    </View>

                    {/* Days Grid */}
                    {(() => {
                        const days = getDaysInMonth(selectedMonth, selectedYear);
                        const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
                        const cells: JSX.Element[] = [];
                        for (let i = 0; i < firstDay; i++) {
                            cells.push(<View key={`empty-${i}`} style={styles.calCell} />);
                        }
                        for (let d = 1; d <= days; d++) {
                            const status = getStatus(d);
                            const isPresent = status === 'PRESENT';
                            const isAbsent = status === 'ABSENT';

                            cells.push(
                                <View
                                    key={d}
                                    style={[
                                        styles.calCell,
                                        isPresent && styles.cellPresent,
                                        isAbsent && styles.cellAbsent,
                                    ]}
                                >
                                    <Text style={[
                                        styles.calDayText,
                                        isPresent && { color: '#059669', fontWeight: '800' },
                                        isAbsent && { color: '#dc2626', fontWeight: '800' },
                                    ]}>{d}</Text>
                                </View>
                            );
                        }
                        const rows: JSX.Element[][] = [];
                        for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
                        return rows.map((row, ri) => (
                            <View key={ri} style={styles.calRow}>{row}</View>
                        ));
                    })()}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    pageSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

    monthScrollWrapper: { marginBottom: 20 },
    monthBar: { paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
    monthChip: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    monthChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    monthText: { color: '#64748b', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    monthTextActive: { color: '#fff' },

    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    summaryCard: {
        flex: 1, borderRadius: 20, padding: 16, alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
    },
    summaryVal: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginVertical: 6 },
    summaryLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },

    calendarCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, shadowRadius: 20, elevation: 5,
        borderWidth: 1, borderColor: '#f1f5f9'
    },
    calHeaderBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    calTitle: { fontWeight: '800', fontSize: 18, color: '#0f172a' },
    calRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    calDayHeader: { flex: 1, textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    calCell: {
        flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
        borderRadius: 14, marginHorizontal: 2,
    },
    cellPresent: { backgroundColor: '#dcfce7' },
    cellAbsent: { backgroundColor: '#fee2e2' },
    calDayText: { fontSize: 14, color: '#334155', fontWeight: '600' },
});
