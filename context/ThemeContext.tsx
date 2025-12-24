import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme color definitions
export const lightTheme = {
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9FBF7',
    text: '#2D4A22',
    textSecondary: '#6B8E6B',
    textMuted: '#9E9E9E',
    primary: '#4A7C23',
    primaryLight: '#E8F5E9',
    accent: '#FFB800',
    accentLight: '#FFF8E1',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    card: '#FFFFFF',
    error: '#E53935',
    success: '#43A047',
    warning: '#FB8C00',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8E8E8',
    headerBg: 'rgba(255,255,255,0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceSecondary: '#2A2A2A',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    textMuted: '#6E6E6E',
    primary: '#6AAF3D',
    primaryLight: '#1E3A1A',
    accent: '#FFB800',
    accentLight: '#3A3020',
    border: '#3A3A3A',
    divider: '#2E2E2E',
    card: '#1E1E1E',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    tabBar: '#1E1E1E',
    tabBarBorder: '#2E2E2E',
    headerBg: 'rgba(30,30,30,0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
};

export type ThemeColors = typeof lightTheme;

interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    setDarkTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem('focusSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    setIsDark(settings.darkTheme ?? false);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        try {
            const saved = await AsyncStorage.getItem('focusSettings');
            const settings = saved ? JSON.parse(saved) : {};
            settings.darkTheme = newValue;
            await AsyncStorage.setItem('focusSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const setDarkTheme = async (value: boolean) => {
        setIsDark(value);
        try {
            const saved = await AsyncStorage.getItem('focusSettings');
            const settings = saved ? JSON.parse(saved) : {};
            settings.darkTheme = value;
            await AsyncStorage.setItem('focusSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const colors = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setDarkTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
