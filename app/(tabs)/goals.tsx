import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, CheckCircle, Trophy, Gift, ArrowRight, Repeat } from 'lucide-react-native';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

export default function GoalsScreen() {
    const {
        state,
        claimDailyReward,
        claimWeeklyReward,
        claimMonthlyReward,
        convertHensToGoat,
        convertHensToCow,
        getSessions,
    } = useFarm();

    const [weeklyMinutes, setWeeklyMinutes] = React.useState(0);
    const [monthlyMinutes, setMonthlyMinutes] = React.useState(0);
    const [isLoadingStats, setIsLoadingStats] = React.useState(true);

    // Convert minutes to hours for display
    const todayHours = state.todayMinutes / 60;
    const weeklyHours = (weeklyMinutes + state.todayMinutes) / 60;
    const monthlyHours = (monthlyMinutes + state.todayMinutes) / 60;

    // Goal targets from context
    const DAILY_TARGET = state.dailyGoalTarget;
    const WEEKLY_TARGET = state.weeklyGoalTarget;
    const MONTHLY_TARGET = state.monthlyGoalTarget;

    React.useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                // Fetch sessions for the last 30 days
                const sessions = await getSessions(31);

                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
                startOfWeek.setHours(0, 0, 0, 0);

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                let weekSum = 0;
                let monthSum = 0;

                const todayStr = now.toDateString();

                sessions.forEach(session => {
                    const sessionDate = new Date(session.started_at);

                    // Don't include today's minutes as they are already in state.todayMinutes
                    if (sessionDate.toDateString() === todayStr) return;

                    if (sessionDate >= startOfWeek) {
                        weekSum += session.duration_minutes;
                    }
                    if (sessionDate >= startOfMonth) {
                        monthSum += session.duration_minutes;
                    }
                });

                setWeeklyMinutes(weekSum);
                setMonthlyMinutes(monthSum);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
            setIsLoadingStats(false);
        };

        fetchStats();
    }, [state.todayMinutes]);

    const dailyProgress = Math.min((todayHours / DAILY_TARGET) * 100, 100);
    const weeklyProgress = Math.min((weeklyHours / WEEKLY_TARGET) * 100, 100);
    const monthlyProgress = Math.min((monthlyHours / MONTHLY_TARGET) * 100, 100);

    const canClaimDaily = todayHours >= DAILY_TARGET && !state.dailyGoalClaimed;

    const handleClaimDaily = () => {
        claimDailyReward();
        Alert.alert(
            "🎉 New Hen Unlocked!",
            "You've earned a new Hen for completing your daily goal! Check your farm.",
            [{ text: "Awesome!" }]
        );
    };

    const handleConvertToGoat = () => {
        Alert.alert(
            "Convert Hens to Goat",
            "Trade 6 Hens for 1 Goat?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Convert",
                    onPress: async () => {
                        const success = await convertHensToGoat();
                        if (success) {
                            Alert.alert("🐐 Goat Unlocked!", "You now have a new Goat on your farm!");
                        } else {
                            Alert.alert("Not Enough Hens", "You need at least 6 Hens to convert.");
                        }
                    }
                }
            ]
        );
    };

    const handleConvertToCow = () => {
        Alert.alert(
            "Convert Hens to Cow",
            "Trade 24 Hens for 1 Cow?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Convert",
                    onPress: async () => {
                        const success = await convertHensToCow();
                        if (success) {
                            Alert.alert("🐄 Cow Unlocked!", "You now have a new Cow on your farm!");
                        } else {
                            Alert.alert("Not Enough Hens", "You need at least 24 Hens to convert.");
                        }
                    }
                }
            ]
        );
    };

    const formatHours = (hours: number) => {
        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        }
        return `${hours.toFixed(1)} hrs`;
    };

    const { colors } = useTheme();

    if (state.isLoading || isLoadingStats) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your progress...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Target size={28} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>Today's Focus</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatHours(todayHours)}</Text>
                </View>

                {/* Daily Goal */}
                <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalEmoji}>🌅</Text>
                            <View>
                                <Text style={[styles.goalTitle, { color: colors.text }]}>Daily Goal</Text>
                                <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>Focus for {DAILY_TARGET} hours today</Text>
                            </View>
                        </View>
                        {state.dailyGoalClaimed ? (
                            <View style={[styles.claimedBadge, { backgroundColor: colors.primaryLight }]}>
                                <CheckCircle size={16} color={colors.primary} />
                                <Text style={[styles.claimedText, { color: colors.primary }]}>Claimed</Text>
                            </View>
                        ) : canClaimDaily ? (
                            <TouchableOpacity style={[styles.claimButton, { backgroundColor: colors.primary }]} onPress={handleClaimDaily}>
                                <Gift size={16} color="#FFF" />
                                <Text style={styles.claimText}>Claim</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressBar, { width: `${dailyProgress}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {formatHours(todayHours)}{todayHours >= DAILY_TARGET ? ' 🎉' : ` / ${DAILY_TARGET} hrs`}
                        </Text>
                        <View style={styles.rewardHint}>
                            <Text style={styles.rewardEmoji}>🐔</Text>
                            <Text style={[styles.rewardText, { color: colors.accent }]}>+1 Hen</Text>
                        </View>
                    </View>
                </View>

                {/* Weekly Goal */}
                <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalEmoji}>📅</Text>
                            <View>
                                <Text style={[styles.goalTitle, { color: colors.text }]}>Weekly Goal</Text>
                                <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>Focus for {WEEKLY_TARGET} hours this week</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressBar, { width: `${weeklyProgress}%`, backgroundColor: '#42A5F5' }]} />
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {formatHours(weeklyHours)}{weeklyHours >= WEEKLY_TARGET ? ' 🏆' : ` / ${WEEKLY_TARGET} hrs`}
                        </Text>
                    </View>
                </View>

                {/* Monthly Goal */}
                <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalEmoji}>🥇</Text>
                            <View>
                                <Text style={[styles.goalTitle, { color: colors.text }]}>Monthly Goal</Text>
                                <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>Focus for {MONTHLY_TARGET} hours this month</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressBar, { width: `${monthlyProgress}%`, backgroundColor: '#9C27B0' }]} />
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {formatHours(monthlyHours)}{monthlyHours >= MONTHLY_TARGET ? ' 👑' : ` / ${MONTHLY_TARGET} hrs`}
                        </Text>
                    </View>
                </View>

                {/* Animal Converter Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🔄 Animal Converter</Text>
                <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                    Combine hens to upgrade your farm animals!
                </Text>

                {/* Current Animals */}
                <View style={[styles.animalCountCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.animalCount}>
                        <Text style={styles.animalEmoji}>🐔</Text>
                        <Text style={[styles.animalNumber, { color: colors.text }]}>{state.hens}</Text>
                        <Text style={[styles.animalLabel, { color: colors.textSecondary }]}>Hens</Text>
                    </View>
                    <View style={styles.animalCount}>
                        <Text style={styles.animalEmoji}>🐐</Text>
                        <Text style={[styles.animalNumber, { color: colors.text }]}>{state.goats}</Text>
                        <Text style={[styles.animalLabel, { color: colors.textSecondary }]}>Goats</Text>
                    </View>
                    <View style={styles.animalCount}>
                        <Text style={styles.animalEmoji}>🐄</Text>
                        <Text style={[styles.animalNumber, { color: colors.text }]}>{state.cows}</Text>
                        <Text style={[styles.animalLabel, { color: colors.textSecondary }]}>Cows</Text>
                    </View>
                </View>

                {/* Converter Buttons */}
                <TouchableOpacity
                    style={[styles.converterCard, { backgroundColor: colors.surface }, state.hens < 6 && styles.converterDisabled]}
                    onPress={handleConvertToGoat}
                    disabled={state.hens < 6}
                >
                    <View style={styles.converterLeft}>
                        <View style={styles.converterIcons}>
                            <Text style={styles.converterEmoji}>🐔</Text>
                            <Text style={[styles.converterCount, { color: colors.textSecondary }]}>×6</Text>
                        </View>
                        <ArrowRight size={20} color={state.hens >= 6 ? colors.primary : colors.textMuted} />
                        <View style={styles.converterIcons}>
                            <Text style={styles.converterEmoji}>🐐</Text>
                            <Text style={[styles.converterCount, { color: colors.textSecondary }]}>×1</Text>
                        </View>
                    </View>
                    <View style={[styles.converterButton, { backgroundColor: colors.primary }, state.hens < 6 && styles.converterButtonDisabled]}>
                        <Repeat size={16} color="#FFF" />
                        <Text style={styles.converterButtonText}>Convert</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.converterCard, { backgroundColor: colors.surface }, state.hens < 24 && styles.converterDisabled]}
                    onPress={handleConvertToCow}
                    disabled={state.hens < 24}
                >
                    <View style={styles.converterLeft}>
                        <View style={styles.converterIcons}>
                            <Text style={styles.converterEmoji}>🐔</Text>
                            <Text style={[styles.converterCount, { color: colors.textSecondary }]}>×24</Text>
                        </View>
                        <ArrowRight size={20} color={state.hens >= 24 ? colors.primary : colors.textMuted} />
                        <View style={styles.converterIcons}>
                            <Text style={styles.converterEmoji}>🐄</Text>
                            <Text style={[styles.converterCount, { color: colors.textSecondary }]}>×1</Text>
                        </View>
                    </View>
                    <View style={[styles.converterButton, { backgroundColor: colors.primary }, state.hens < 24 && styles.converterButtonDisabled]}>
                        <Repeat size={16} color="#FFF" />
                        <Text style={styles.converterButtonText}>Convert</Text>
                    </View>
                </TouchableOpacity>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.accentLight }]}>
                    <Trophy size={24} color="#FFB800" />
                    <View style={styles.infoText}>
                        <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
                        <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
                            Complete 6 hours of focus daily to earn Hens. Combine 6 Hens for a Goat, or 24 Hens for a Cow! Goals reset at midnight.
                        </Text>
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
    content: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    summaryCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
    },
    summaryTitle: {
        fontSize: 14,
        color: '#6B8E6B',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#4A7C23',
        marginTop: 4,
    },
    goalCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    goalEmoji: {
        fontSize: 32,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D4A22',
    },
    goalSubtitle: {
        fontSize: 13,
        color: '#6B8E6B',
        marginTop: 2,
    },
    claimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A7C23',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    claimText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    claimedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    claimedText: {
        color: '#4A7C23',
        fontSize: 13,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E8F5E9',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4A7C23',
        borderRadius: 5,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    progressText: {
        fontSize: 13,
        color: '#6B8E6B',
        fontWeight: '500',
    },
    rewardHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rewardEmoji: {
        fontSize: 18,
    },
    rewardText: {
        fontSize: 13,
        color: '#8B6B00',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D4A22',
        marginTop: 32,
    },
    sectionDesc: {
        fontSize: 13,
        color: '#6B8E6B',
        marginTop: 4,
    },
    animalCountCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF8E1',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        justifyContent: 'space-around',
    },
    animalCount: {
        alignItems: 'center',
    },
    animalEmoji: {
        fontSize: 32,
    },
    animalNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#5D4037',
        marginTop: 4,
    },
    animalLabel: {
        fontSize: 12,
        color: '#8B6B00',
        fontWeight: '500',
    },
    converterCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    converterDisabled: {
        opacity: 0.5,
    },
    converterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    converterIcons: {
        alignItems: 'center',
    },
    converterEmoji: {
        fontSize: 28,
    },
    converterCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5D4037',
    },
    converterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A7C23',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    converterButtonDisabled: {
        backgroundColor: '#CCC',
    },
    converterButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF8E1',
        borderRadius: 16,
        padding: 16,
        marginTop: 24,
        gap: 12,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#5D4037',
    },
    infoSubtitle: {
        fontSize: 13,
        color: '#8B6B00',
        marginTop: 4,
        lineHeight: 18,
    },
    overtimeBar: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#FF9800',
        borderRadius: 8,
    },
    overtimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9800',
    },
});
