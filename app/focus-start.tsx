import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, X, ChevronRight, Plus } from 'lucide-react-native';
import { useFarm } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';

export default function FocusStartScreen() {
    const router = useRouter();
    const { state } = useFarm();
    const { colors, isDark } = useTheme();
    const [taskName, setTaskName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    💡 Add more categories in Settings
                </Text>

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
        backgroundColor: '#F9FBF9',
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
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D4A22',
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D4A22',
        marginTop: 24,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#2D4A22',
        borderWidth: 1,
        borderColor: '#E8F5E9',
        shadowColor: '#2D4A22',
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
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 12,
        color: '#556B2F',
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: '#6B8E6B',
        textAlign: 'center',
        marginTop: 16,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A7C23',
        paddingVertical: 18,
        borderRadius: 30,
        marginTop: 32,
        gap: 10,
        shadowColor: '#2D4A22',
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
        color: '#6B8E6B',
        fontWeight: '500',
    },
});
