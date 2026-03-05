import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { isLoggedIn } from '../lib/auth';
import { LanguageProvider } from '../lib/i18n';

// Globally suppress specific React 19 deprecation errors from triggering the Web Red Screen Overlay
const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && (
        args[0].includes('props.pointerEvents is deprecated') ||
        args[0].includes('shadow* style props are deprecated') ||
        args[0].includes('Listening to push token changes is not yet fully supported on web')
    )) {
        return;
    }
    originalConsoleError(...args);
};

// Silence all development warnings (the yellow boxes) for a clean web testing experience
LogBox.ignoreLogs([
    'Listening to push token changes is not yet fully supported on web',
    'props.pointerEvents is deprecated. Use style.pointerEvents',
    '"shadow*" style props are deprecated. Use "boxShadow"'
]);

export default function RootLayout() {
    useEffect(() => {
        isLoggedIn().then(loggedIn => {
            if (!loggedIn) router.replace('/(auth)');
        });
    }, []);

    return (
        <LanguageProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </LanguageProvider>
    );
}
