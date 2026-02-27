import { Platform } from 'react-native';

// Central API configuration
// We use localhost for the web browser, but the actual IP for physical devices
export let API_BASE = 'http://10.10.26.171:8080';
if (Platform.OS === 'web') {
    API_BASE = 'http://127.0.0.1:8080';
}

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
