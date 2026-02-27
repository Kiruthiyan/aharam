import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { apiFetch } from '../../lib/api';
import { saveAuth } from '../../lib/auth';
import { registerForPushNotificationsAsync } from '../../lib/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setError('பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும் (Please enter username and password)');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await apiFetch('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                await saveAuth(data);

                // Register for push notifications after successful login
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    await apiFetch('/api/notifications/token', {
                        method: 'POST',
                        body: JSON.stringify({ token: pushToken }),
                        token: data.token,
                    }).catch(err => console.error("Failed to save push token:", err));
                }

                router.replace('/(tabs)');
            } else {
                setError('தவறான பயனர் பெயர் அல்லது கடவுச்சொல் (Invalid Credentials)');
            }
        } catch (err) {
            setError('Network Error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={['#064e3b', '#022c22']} // Emerald-900 to Emerald-950
                style={styles.background}
            />

            {/* Decorative background circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <ShieldCheck color="#34d399" size={48} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.title}>அகரம் கல்விக் கூடம்</Text>
                    <Text style={styles.subtitle}>Aharam Tuition Management</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Login to your account</Text>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Username Input */}
                    <Text style={styles.label}>பயனர் பெயர் (Username / ID)</Text>
                    <View style={styles.inputContainer}>
                        <User color="#059669" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. KT2026001 or admin"
                            placeholderTextColor="#9ca3af"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    {/* Password Input */}
                    <Text style={styles.label}>கடவுச்சொல் (Password)</Text>
                    <View style={styles.inputContainer}>
                        <Lock color="#059669" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {showPassword ?
                                <EyeOff color="#6b7280" size={20} /> :
                                <Eye color="#6b7280" size={20} />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginBtnText}>உள்நுழைக (Sign In)</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    Secured by Aharam Tech Team
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { ...StyleSheet.absoluteFillObject },
    circle1: {
        position: 'absolute', top: -100, left: -50,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(52, 211, 153, 0.15)', // Emerald-400
        blurRadius: 40,
    },
    circle2: {
        position: 'absolute', bottom: -50, right: -100,
        width: 250, height: 250, borderRadius: 125,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        blurRadius: 30,
    },
    content: {
        flex: 1, justifyContent: 'center', padding: 24, zIndex: 10
    },
    header: { alignItems: 'center', marginBottom: 40 },
    iconContainer: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: 0.5 },
    subtitle: { fontSize: 14, color: '#a7f3d0', fontWeight: '500', letterSpacing: 1 }, // Emerald-200
    card: {
        backgroundColor: '#fff', borderRadius: 24, padding: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
        width: '100%', maxWidth: 400, alignSelf: 'center',
    },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24, textAlign: 'center' },
    errorBox: {
        backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5',
        borderRadius: 12, padding: 12, marginBottom: 20,
    },
    errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center', fontWeight: '500' },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
        borderRadius: 16, marginBottom: 20, height: 56,
    },
    inputIcon: { marginLeft: 16, marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 15, color: '#111827', fontWeight: '500' },
    eyeIcon: { paddingHorizontal: 16, height: '100%', justifyContent: 'center' },
    loginBtn: { marginTop: 8, borderRadius: 16, overflow: 'hidden', shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    loginBtnDisabled: { opacity: 0.7 },
    loginGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginTop: 32, fontWeight: '500' }
});
