import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FarmProvider } from '../context/FarmContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import VersionCheck from '../components/VersionCheck';

function AppContent() {
    const { isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="focus"
                    options={{
                        presentation: 'fullScreenModal',
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="focus-start"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <FarmProvider>
                <VersionCheck>
                    <AppContent />
                </VersionCheck>
            </FarmProvider>
        </ThemeProvider>
    );
}
