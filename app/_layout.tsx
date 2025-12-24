import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FarmProvider } from '../context/FarmContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

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
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <FarmProvider>
                <AppContent />
            </FarmProvider>
        </ThemeProvider>
    );
}
