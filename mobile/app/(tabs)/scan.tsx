import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useState } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { apiFetch } from '../../lib/api';
import { getAuth } from '../../lib/auth';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, Scan, Camera as CameraIcon } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function QRScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedId, setScannedId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<'PRESENT' | 'ABSENT' | null>(null);

    const onBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);
        setScannedId(data);
        setResult(null);

        // Fetch student info
        try {
            const res = await apiFetch(`/api/students/${data}`);
            if (res.ok) {
                const s = await res.json();
                setStudentName(s.fullName || data);
            } else {
                setStudentName(data);
            }
        } catch {
            setStudentName(data);
        }
    };

    const markAttendance = async (status: 'PRESENT' | 'ABSENT') => {
        setSaving(true);
        const auth = await getAuth();
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await apiFetch('/api/attendance/mark', {
                method: 'POST',
                body: JSON.stringify({
                    studentId: scannedId,
                    date: today,
                    status,
                    recordedBy: auth.username,
                }),
            });
            if (res.ok) {
                setResult(status);
            } else {
                alert('Could not save attendance.');
            }
        } catch {
            alert('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const reset = () => {
        setScanned(false);
        setScannedId('');
        setStudentName('');
        setResult(null);
    };

    if (!permission) {
        return (
            <View style={styles.centerMode}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerMode}>
                <View style={styles.permIconBg}>
                    <CameraIcon color="#059669" size={48} strokeWidth={2} />
                </View>
                <Text style={styles.permTitle}>Camera Access Required</Text>
                <Text style={styles.permSub}>Please allow camera permissions to scan student ID QR codes.</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
            />

            {/* Scanning Overlay UI */}
            {!scanned && (
                <View style={styles.overlayContainer}>
                    <View style={styles.topMask}>
                        <Text style={styles.maskTitle}>Scan Student ID</Text>
                        <Text style={styles.maskSub}>Point camera directly at the QR code</Text>
                    </View>

                    <View style={styles.middleRow}>
                        <View style={styles.sideMask} />
                        <View style={styles.scanFrameBox}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <View style={styles.sideMask} />
                    </View>

                    <View style={styles.bottomMask} />
                </View>
            )}

            {/* Action Panel after scanning */}
            {scanned && (
                <BlurView intensity={90} tint="light" style={styles.resultPanel}>
                    {result ? (
                        <View style={styles.resultContent}>
                            <View style={[styles.resultIconBg, result === 'PRESENT' ? styles.presentBg : styles.absentBg]}>
                                {result === 'PRESENT' ? <CheckCircle color="#10b981" size={48} /> : <XCircle color="#ef4444" size={48} />}
                            </View>
                            <Text style={styles.resultTitle}>
                                {result === 'PRESENT' ? 'Marked Present' : 'Marked Absent'}
                            </Text>
                            <Text style={styles.studentNameResult}>{studentName}</Text>
                            <Text style={styles.studentIdResult}>ID: {scannedId}</Text>

                            <TouchableOpacity style={styles.scanNextBtn} onPress={reset}>
                                <Scan color="#fff" size={20} />
                                <Text style={styles.scanNextText}>Scan Next Student</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.resultContent}>
                            <View style={styles.avatarHolder}>
                                <Text style={styles.avatarLetter}>{studentName.charAt(0)}</Text>
                            </View>
                            <Text style={styles.scannedName}>{studentName}</Text>
                            <View style={styles.idChip}>
                                <Text style={styles.idChipText}>{scannedId}</Text>
                            </View>

                            <Text style={styles.actionPrompt}>Record Attendance For Today</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.bigActionBtn, styles.presentBtn]}
                                    onPress={() => markAttendance('PRESENT')}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#fff" /> : (
                                        <>
                                            <CheckCircle color="#fff" size={28} />
                                            <Text style={styles.bigActionText}>Present</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.bigActionBtn, styles.absentBtn]}
                                    onPress={() => markAttendance('ABSENT')}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#ef4444" /> : (
                                        <>
                                            <XCircle color="#ef4444" size={28} />
                                            <Text style={[styles.bigActionText, { color: '#ef4444' }]}>Absent</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.cancelLink} onPress={reset}>
                                <Text style={styles.cancelText}>Cancel & Rescan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </BlurView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerMode: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f8fafc' },
    permIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    permTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
    permSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    permBtn: { backgroundColor: '#059669', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    permBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

    overlayContainer: { ...StyleSheet.absoluteFillObject },
    topMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
    maskTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
    maskSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
    middleRow: { flexDirection: 'row', height: SCAN_FRAME_SIZE },
    sideMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
    scanFrameBox: { width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE, backgroundColor: 'transparent' },
    bottomMask: { flex: 2, backgroundColor: 'rgba(0,0,0,0.7)' },

    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#10b981' },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },

    resultPanel: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 32, paddingBottom: 50,
        overflow: 'hidden', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.8)',
    },
    resultContent: { alignItems: 'center', width: '100%' },

    avatarHolder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    avatarLetter: { color: '#fff', fontSize: 32, fontWeight: '800' },
    scannedName: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 6, textAlign: 'center' },
    idChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
    idChipText: { color: '#475569', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
    actionPrompt: { fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 16 },

    actionRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 20 },
    bigActionBtn: { flex: 1, borderRadius: 20, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
    presentBtn: { backgroundColor: '#10b981' },
    absentBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#fca5a5' },
    bigActionText: { fontSize: 18, fontWeight: '800', color: '#fff' },

    cancelLink: { padding: 12 },
    cancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    resultIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    presentBg: { backgroundColor: '#dcfce7' },
    absentBg: { backgroundColor: '#fee2e2' },
    resultTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    studentNameResult: { fontSize: 16, color: '#475569', fontWeight: '500', marginBottom: 4 },
    studentIdResult: { fontSize: 14, color: '#94a3b8', marginBottom: 32 },

    scanNextBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0f172a', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 16, width: '100%', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10 },
    scanNextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
