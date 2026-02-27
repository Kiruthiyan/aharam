import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { getAuth } from '../../lib/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MyQRScreen() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuth().then(auth => {
            setUsername(auth.username || '');
            setName(auth.name || '');
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <ActivityIndicator size="large" color="#059669" />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Background design elements */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Student Identity</Text>
                    <Text style={styles.pageSub}>Digital ID Card</Text>
                </View>

                <View style={styles.card}>
                    {/* Top gradient edge */}
                    <LinearGradient colors={['#059669', '#047857']} style={styles.cardTopEdge} />

                    <View style={styles.cardInner}>
                        <View style={styles.cardHeader}>
                            <ShieldCheck color="#059669" size={28} />
                            <Text style={styles.title}>அகரம் கல்விக் கூடம்</Text>
                        </View>

                        <Text style={styles.instruction}>Scan for Attendance</Text>

                        <View style={styles.qrBoxOuter}>
                            <View style={styles.qrBox}>
                                <QRCode
                                    value={username}
                                    size={180}
                                    color="#022c22"
                                    backgroundColor="transparent"
                                />
                            </View>
                        </View>

                        <Text style={styles.studentName}>{name}</Text>

                        <View style={styles.idBadge}>
                            <Text style={styles.idText}>{username}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Info color="#059669" size={20} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoTitle}>How this works</Text>
                        <Text style={styles.infoText}>
                            Staff will scan this QR code to mark your attendance instantly. Keep this screen bright when showing.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, backgroundColor: '#f8fafc',
    },
    bgCircle1: { position: 'absolute', top: -150, right: -100, width: 400, height: 400, borderRadius: 200, backgroundColor: '#d1fae5', opacity: 0.5 },
    bgCircle2: { position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#ccfbf1', opacity: 0.5 },
    content: { flex: 1, padding: 24, justifyContent: 'center', zIndex: 10 },

    header: { alignItems: 'center', marginBottom: 32 },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    pageSub: { fontSize: 13, color: '#64748b', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },

    card: {
        backgroundColor: '#fff', borderRadius: 30,
        alignItems: 'center', width: '100%',
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1, shadowRadius: 30, elevation: 10,
        overflow: 'hidden', marginBottom: 32,
    },
    cardTopEdge: { height: 8, width: '100%' },
    cardInner: { padding: 32, alignItems: 'center', width: '100%' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
    title: { fontSize: 16, fontWeight: '800', color: '#022c22', letterSpacing: 0.5 },

    instruction: { fontSize: 12, color: '#94a3b8', marginBottom: 16, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

    qrBoxOuter: {
        padding: 6, borderRadius: 28, backgroundColor: '#fff',
        borderWidth: 2, borderColor: '#e2e8f0', marginBottom: 32,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
    },
    qrBox: {
        padding: 20, backgroundColor: '#f8fafc', borderRadius: 22,
    },

    studentName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
    idBadge: {
        backgroundColor: '#f1f5f9', paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0'
    },
    idText: { color: '#059669', fontWeight: '800', fontSize: 15, letterSpacing: 2 },

    infoBox: {
        flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#bbf7d0', gap: 12, alignItems: 'center'
    },
    infoTitle: { color: '#059669', fontWeight: '700', fontSize: 14, marginBottom: 2 },
    infoText: { color: '#334155', fontSize: 12, lineHeight: 18, fontWeight: '500' },
});
