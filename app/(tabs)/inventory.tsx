import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Info } from 'lucide-react-native';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

export default function InventoryScreen() {
    const { state, getTotalAnimals } = useFarm();
    const { colors } = useTheme();

    const inventory = [
        { id: '1', type: 'hen', count: state.hens, emoji: '🐔', name: 'Hen' },
        { id: '2', type: 'goat', count: state.goats, emoji: '🐐', name: 'Goat' },
        { id: '3', type: 'cow', count: state.cows, emoji: '🐄', name: 'Cow' },
    ];

    if (state.isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading inventory...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Package size={28} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Inventory</Text>
            </View>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
                <Text style={[styles.summaryValue, { color: '#FFFFFF' }]}>{getTotalAnimals()}</Text>
                <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.9)' }]}>Animals on your farm</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Animals</Text>
                {inventory.map((item) => (
                    <View key={item.id} style={[styles.animalCard, { backgroundColor: colors.surface }]}>
                        <Text style={styles.animalEmoji}>{item.emoji}</Text>
                        <View style={styles.animalInfo}>
                            <Text style={[styles.animalName, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.animalCount, { color: colors.textSecondary }]}>x{item.count} on your farm</Text>
                        </View>
                        <TouchableOpacity style={[styles.infoButton, { backgroundColor: colors.primaryLight }]}>
                            <Info size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* How to get more animals */}
                <View style={[styles.tipCard, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>🌟 How to get more animals</Text>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>🐔</Text>
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>Complete daily goal (6 hours) = +1 Hen</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>🐐</Text>
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>Convert 6 Hens = +1 Goat</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Text style={styles.tipEmoji}>🐄</Text>
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>Convert 24 Hens = +1 Cow</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B8E6B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2D4A22',
    },
    summaryCard: {
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 56,
        fontWeight: '800',
        color: '#4A7C23',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B8E6B',
        marginTop: 4,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#556B2F',
        marginTop: 24,
        marginBottom: 12,
    },
    animalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    animalEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    animalInfo: {
        flex: 1,
    },
    animalName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D4A22',
    },
    animalCount: {
        fontSize: 14,
        color: '#6B8E6B',
        marginTop: 2,
    },
    infoButton: {
        padding: 8,
    },
    tipCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#5D4037',
        marginBottom: 12,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    tipEmoji: {
        fontSize: 20,
    },
    tipText: {
        fontSize: 13,
        color: '#8B6B00',
    },
});
