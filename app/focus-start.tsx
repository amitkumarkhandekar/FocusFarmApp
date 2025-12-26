import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, X, ChevronRight, Bell, BellOff, Smartphone } from 'lucide-react-native';
import { useFarm } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';

export default function FocusStartScreen() {
    const router = useRouter();
    const { state } = useFarm();
    const { colors, isDark } = useTheme();
    const [taskName, setTaskName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [dndAcknowledged, setDndAcknowledged] = useState(false);

    // Only show user-created categories (no defaults)
    const allCategories = state.categories.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
    }));

    const handleStart = () => {
        if (!taskName.trim()) {
            Alert.alert('Task Name Required', 'Please enter what you want to focus on.');
            return;
        }

        // Navigate to focus screen with params
        router.push({
            pathname: '/focus',
            params: {
                taskName: taskName.trim(),
                categoryId: selectedCategory || '',
                categoryName: allCategories.find(c => c.id === selectedCategory)?.name || '',
            },
        });
    };

    const handleQuickStart = () => {
        router.push({
            pathname: '/focus',
            params: {
                taskName: 'Quick Focus',
                categoryId: '',
                categoryName: '',
            },
        });
    };

    const openDNDSettings = () => {
        if (Platform.OS === 'android') {
            // Open Android Do Not Disturb settings
            Linking.openSettings();
        } else {
            // iOS Focus Mode instructions
            Alert.alert(
                'Enable Focus Mode',
                'To minimize distractions:\n\n' +
                '1. Swipe down from top-right corner\n' +
                '2. Tap "Focus"\n' +
                '3. Select "Do Not Disturb" or create a custom Focus\n\n' +
                'Or go to Settings → Focus',
                [
                    { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
                    { text: 'Got it!', style: 'cancel' }
                ]
            );
        }
    };

    const showFocusTips = () => {
        Alert.alert(
            '🎯 Focus Tips',
            '• Enable Do Not Disturb to block notifications\n\n' +
            '• Put your phone face-down while studying\n\n' +
            '• Use the built-in Focus Mode on your device\n\n' +
            '• Each time you leave the app counts as a distraction\n\n' +
            '• 3+ distractions = lose 1 hen! 🐔',
            [{ text: 'Got it!' }]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
                    <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Focus Session</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* DND Suggestion Card */}
                <View style={[styles.dndCard, { backgroundColor: isDark ? '#2A2522' : '#FFF8E1', borderColor: colors.accent }]}>
                    <View style={styles.dndHeader}>
                        <BellOff size={24} color={colors.accent} />
                        <Text style={[styles.dndTitle, { color: isDark ? colors.accent : '#8B6B00' }]}>
                            Ready to Focus?
                        </Text>
                    </View>
                    <Text style={[styles.dndDescription, { color: colors.textSecondary }]}>
                        For the best focus experience, we recommend enabling Do Not Disturb or Focus Mode on your device.
                    </Text>
                    <View style={styles.dndButtons}>
                        <TouchableOpacity
                            style={[styles.dndButton, { backgroundColor: colors.accent }]}
                            onPress={openDNDSettings}
                        >
                            <Smartphone size={16} color="#FFF" />
                            <Text style={styles.dndButtonText}>
                                {Platform.OS === 'android' ? 'Open DND Settings' : 'Enable Focus Mode'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.dndButtonSecondary, { borderColor: colors.accent }]}
                            onPress={showFocusTips}
                        >
                            <Text style={[styles.dndButtonSecondaryText, { color: colors.accent }]}>Tips</Text>
                        </TouchableOpacity>
                    </View>
                    {!dndAcknowledged && (
                        <TouchableOpacity
                            style={styles.acknowledgeButton}
                            onPress={() => setDndAcknowledged(true)}
                        >
                            <Text style={[styles.acknowledgeText, { color: colors.textMuted }]}>
                                ✓ I've enabled DND / I'll do it later
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Task Name */}
                <Text style={[styles.label, { color: colors.text }]}>What are you focusing on?</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g., Complete project report"
                    placeholderTextColor={colors.textMuted}
                    value={taskName}
                    onChangeText={setTaskName}
                    maxLength={100}
                />

                {/* Category Selection */}
                {allCategories.length > 0 && (
                    <>
                        <Text style={[styles.label, { color: colors.text }]}>Category (optional)</Text>
                        <View style={styles.categoryGrid}>
                            {allCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        selectedCategory === cat.id && {
                                            borderColor: cat.color,
                                            borderWidth: 2,
                                            backgroundColor: `${cat.color}15`,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(
                                        selectedCategory === cat.id ? null : cat.id
                                    )}
                                >
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <Text style={[
                                        styles.categoryName,
                                        { color: colors.textSecondary },
                                        selectedCategory === cat.id && { color: cat.color, fontWeight: '700' }
                                    ]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    💡 Add more categories in Settings
                </Text>

                {/* Focus Tips */}
                <View style={[styles.warningCard, { backgroundColor: isDark ? '#1E3320' : '#E8F5E9' }]}>
                    <Text style={[styles.warningText, { color: isDark ? '#81C784' : '#2E7D32' }]}>
                        💡 Tip: Enable DND above for best results. Your timer continues even if you leave!
                    </Text>
                </View>

                {/* Start Button */}
                <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]} onPress={handleStart}>
                    <Play size={24} color="#FFF" fill="#FFF" />
                    <Text style={styles.startButtonText}>Start Focus</Text>
                </TouchableOpacity>

                {/* Quick Start */}
                <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
                    <Text style={[styles.quickStartText, { color: colors.textSecondary }]}>Quick Start (No Task)</Text>
                    <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },

    // DND Card
    dndCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    dndHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    dndTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    dndDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    dndButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    dndButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    dndButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    dndButtonSecondary: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    dndButtonSecondaryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    acknowledgeButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    acknowledgeText: {
        fontSize: 12,
    },

    // Warning Card
    warningCard: {
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },

    label: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 12,
    },
    input: {
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryCard: {
        width: '31%',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 12,
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        marginTop: 24,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    startButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    quickStartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 16,
        gap: 4,
    },
    quickStartText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
