import { Platform } from 'react-native';

// Central API configuration
// ⚠️ Change this to your local network IP when testing on a physical device
export const API_BASE = 'http://10.10.26.171:8080';

import * as SecureStore from 'expo-secure-store';

export async function apiFetch(path: string, options?: RequestInit) {
    let token = null;
    if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
    } else {
        token = await SecureStore.getItemAsync('token');
    }

    return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options?.headers || {}),
        },
    });
}
