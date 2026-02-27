import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiFetch } from './api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,   // WhatsApp-style banner
        shouldPlaySound: true,   // Sound like WhatsApp
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('[Push] Must use physical device for push notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] Permission denied');
        return null;
    }

    // Get Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'aharam-tuition', // matches app.json
    });
    const token = tokenData.data;
    console.log('[Push] Token:', token);

    // Android channel (required)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Aharam Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
        });
    }

    // Register token with backend
    try {
        await apiFetch('/api/notifications/token', {
            method: 'POST',
            body: JSON.stringify({ userId, token }),
        });
    } catch (e) {
        console.error('[Push] Failed to register token with backend', e);
    }

    return token;
}
