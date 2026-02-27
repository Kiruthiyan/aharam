import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = ['token', 'userRole', 'username', 'name', 'userId'];

async function setItemAsync(key: string, value: string) {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
}

async function getItemAsync(key: string) {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
}

async function deleteItemAsync(key: string) {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
}

export async function saveAuth(data: {
    token: string;
    role: string;
    username: string;
    displayName: string;
    id: string | number;
    requirePasswordChange?: boolean;
}) {
    await setItemAsync('token', data.token);
    await setItemAsync('userRole', data.role);
    await setItemAsync('username', data.username);
    await setItemAsync('name', data.displayName || data.username);
    await setItemAsync('userId', String(data.id));
    if (data.requirePasswordChange) {
        await setItemAsync('requirePasswordChange', 'true');
    }
}

export async function clearAuth() {
    for (const key of KEYS) {
        await deleteItemAsync(key);
    }
    await deleteItemAsync('requirePasswordChange');
}

export async function getAuth() {
    return {
        token: await getItemAsync('token'),
        userRole: await getItemAsync('userRole'),
        username: await getItemAsync('username'),
        name: await getItemAsync('name'),
        userId: await getItemAsync('userId'),
    };
}

export async function isLoggedIn() {
    const token = await getItemAsync('token');
    return !!token;
}
