import {
    View, Text, ScrollView, ActivityIndicator,
    RefreshControl, StyleSheet
} from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Trophy, Award } from 'lucide-react-native';

interface Mark {
    id: number;
    subjectName: string;
    examName: string;
    marks: number;
    maxMarks: number;
    grade?: string;
}

export default function MarksScreen() {
    const [marks, setMarks] = useState<Mark[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [username, setUsername] = useState('');

    const load = async () => {
        const auth = await getAuth();
        setUsername(auth.username || '');
        const res = await apiFetch(`/api/marks/student/${auth.username}`);
        if (res.ok) setMarks(await res.json());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const exams = [...new Set(marks.map(m => m.examName))];

    if (loading) return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <ActivityIndicator size="large" color="#059669" />
        </View>
    );

    if (marks.length === 0) return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 32 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <BookOpen color="#94a3b8" size={32} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#334155' }}>No marks recorded yet</Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                Your exam scores will appear here once entered by the staff.
            </Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        >
            <View style={styles.headerArea}>
                <Text style={styles.pageTitle}>Academic Marks</Text>
                <Text style={styles.pageSub}>View your performance by exam</Text>
            </View>

            <View style={{ padding: 20 }}>
                {exams.map((exam, index) => {
                    const examMarks = marks.filter(m => m.examName === exam);
                    const total = examMarks.reduce((s, m) => s + m.marks, 0);
                    const maxTotal = examMarks.reduce((s, m) => s + m.maxMarks, 0);
                    const avg = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                    const isPass = avg >= 35;

                    return (
                        <View key={exam} style={styles.examCard}>
                            {/* Card Header Linear Gradient */}
                            <LinearGradient
                                colors={isPass ? ['#059669', '#047857'] : ['#f43f5e', '#e11d48']}
                                style={styles.examBanner}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.examTitleRow}>
                                    <View style={styles.examIconBg}>
                                        <Trophy color={isPass ? "#059669" : "#e11d48"} size={20} />
                                    </View>
                                    <View>
                                        <Text style={styles.examName}>{exam}</Text>
                                        <Text style={styles.examDate}>Term Examination</Text>
                                    </View>
                                </View>
                                <View style={styles.avgBadge}>
                                    <Text style={styles.avgText}>{avg}%</Text>
                                    <Text style={styles.avgLabel}>{isPass ? 'PASS' : 'FAIL'}</Text>
                                </View>
                            </LinearGradient>

                            {/* Marks table */}
                            <View style={styles.tableBox}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableCell, styles.cellSubject, styles.colHeader]}>Subject</Text>
                                    <Text style={[styles.tableCell, styles.colHeader]}>Mark</Text>
                                    <Text style={[styles.tableCell, styles.colHeader]}>Max</Text>
                                    <Text style={[styles.tableCell, styles.colHeader]}>Res</Text>
                                </View>

                                {examMarks.map((m, i) => {
                                    const pct = Math.round((m.marks / m.maxMarks) * 100);
                                    const pass = pct >= 35;
                                    const isLast = i === examMarks.length - 1;

                                    return (
                                        <View key={m.id} style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}>
                                            <Text style={[styles.tableCell, styles.cellSubject, { color: '#334155', fontWeight: '500' }]}>
                                                {m.subjectName}
                                            </Text>
                                            <Text style={[styles.tableCell, pass ? styles.passText : styles.failText]}>
                                                {m.marks}
                                            </Text>
                                            <Text style={[styles.tableCell, { color: '#94a3b8' }]}>{m.maxMarks}</Text>
                                            <Text style={styles.tableCell}>
                                                <Award color={pass ? "#10b981" : "#f43f5e"} size={16} />
                                            </Text>
                                        </View>
                                    );
                                })}

                                {/* Total row */}
                                <View style={styles.totalRow}>
                                    <Text style={[styles.tableCell, styles.cellSubject, styles.totalLabel]}>Total Score</Text>
                                    <Text style={[styles.tableCell, styles.totalValue]}>{total}</Text>
                                    <Text style={[styles.tableCell, styles.totalValue, { color: '#64748b' }]}>{maxTotal}</Text>
                                    <Text style={[styles.tableCell, styles.totalValue, { color: isPass ? '#059669' : '#e11d48' }]}>{avg}%</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerArea: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    pageSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

    examCard: {
        backgroundColor: '#fff', borderRadius: 24,
        marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
        borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden'
    },
    examBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20,
    },
    examTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    examIconBg: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    examName: { fontSize: 18, fontWeight: '800', color: '#fff' },
    examDate: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    avgBadge: { alignItems: 'flex-end' },
    avgText: { fontSize: 24, fontWeight: '800', color: '#fff' },
    avgLabel: { fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: 1 },

    tableBox: { padding: 8 },
    tableHeader: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f8fafc', borderRadius: 12 },
    colHeader: { color: '#64748b', fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
    tableCell: { flex: 1, fontSize: 14, textAlign: 'center', justifyContent: 'center', alignItems: 'center' },
    cellSubject: { flex: 2, textAlign: 'left', alignItems: 'flex-start' },
    passText: { color: '#059669', fontWeight: '700', fontSize: 16 },
    failText: { color: '#e11d48', fontWeight: '700', fontSize: 16 },

    totalRow: {
        flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 16, backgroundColor: '#f0fdf4',
        borderRadius: 16, marginTop: 12, marginBottom: 8, marginHorizontal: 8, alignItems: 'center'
    },
    totalLabel: { fontWeight: '800', color: '#0f172a', fontSize: 14 },
    totalValue: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
});
