import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuth } from '../../lib/auth';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { LayoutDashboard, CalendarCheck2, QrCode, ScanLine, FileText, Wallet, Settings } from 'lucide-react-native';

export default function TabsLayout() {
    const [role, setRole] = useState<string>('PARENT');

    useEffect(() => {
        getAuth().then(auth => {
            if (auth.userRole) setRole(auth.userRole);
        });
    }, []);

    const isAdmin = role === 'ADMIN';
    const isStaff = role === 'STAFF' || role === 'ADMIN';
    const isParent = role === 'PARENT';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#059669', // Emerald 600
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#ffffff',
                    height: Platform.OS === 'ios' ? 85 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    paddingTop: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
                    ) : null
                ),
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
                headerStyle: {
                    backgroundColor: '#064e3b', // Deep emerald header
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    headerTitle: '🏫 அகரம்',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={24} strokeWidth={2.5} />,
                    tabBarLabel: 'Home',
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Attendance',
                    headerTitle: '📅 வருகை (Attendance)',
                    tabBarIcon: ({ color, size }) => <CalendarCheck2 color={color} size={24} strokeWidth={2.5} />,
                    tabBarLabel: 'Attendance',
                }}
            />
            {isStaff && (
                <Tabs.Screen
                    name="scan"
                    options={{
                        title: 'QR Scan',
                        headerTitle: '📷 ஸ்கேன் செய்க (Scan)',
                        tabBarIcon: ({ color, size }) => <ScanLine color={color} size={24} strokeWidth={2.5} />,
                        tabBarLabel: 'Scan',
                    }}
                />
            )}
            {!isStaff && (
                <Tabs.Screen
                    name="qr"
                    options={{
                        title: 'My QR',
                        headerTitle: '📱 My QR Code',
                        tabBarIcon: ({ color, size }) => <QrCode color={color} size={24} strokeWidth={2.5} />,
                        tabBarLabel: 'My QR',
                    }}
                />
            )}
            <Tabs.Screen
                name="marks"
                options={{
                    title: 'Marks',
                    headerTitle: '📝 மதிப்பெண்கள் (Marks)',
                    tabBarIcon: ({ color, size }) => <FileText color={color} size={24} strokeWidth={2.5} />,
                    tabBarLabel: 'Marks',
                }}
            />
            <Tabs.Screen
                name="fees"
                options={{
                    title: 'Fees',
                    headerTitle: '💰 கட்டணம் (Fees)',
                    tabBarIcon: ({ color, size }) => <Wallet color={color} size={24} strokeWidth={2.5} />,
                    tabBarLabel: 'Fees',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerTitle: '⚙️ அமைப்புகள் (Settings)',
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={24} strokeWidth={2.5} />,
                    tabBarLabel: 'Settings',
                }}
            />
        </Tabs>
    );
}
