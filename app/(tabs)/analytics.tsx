import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, Calendar, TrendingUp, Clock, Flame, Filter } from 'lucide-react-native';
import { useFarm, StudySession } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsScreen() {
    const { getSessions, state } = useFarm();
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');

    const loadSessions = async () => {
        const days = timeFrame === 'daily' ? 7 : timeFrame === 'weekly' ? 30 : 90;
        const data = await getSessions(days);
        setSessions(data);
        setIsLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadSessions();
    }, [timeFrame]);

    const onRefresh = () => {
        setRefreshing(true);
        loadSessions();
    };

    // Get data based on timeframe
    const getChartData = () => {
        const days: { date: string; label: string; minutes: number }[] = [];
        const numDays = timeFrame === 'daily' ? 7 : timeFrame === 'weekly' ? 4 : 12;

        if (timeFrame === 'daily') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

                const dayMinutes = sessions
                    .filter(s => s.started_at.startsWith(dateStr))
                    .reduce((sum, s) => sum + s.duration_minutes, 0);

                days.push({ date: dateStr, label: dayLabel, minutes: dayMinutes });
            }
        } else if (timeFrame === 'weekly') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
                const weekEnd = new Date();
                weekEnd.setDate(weekEnd.getDate() - (i * 7));

                const weekMinutes = sessions.filter(s => {
                    const sessionDate = new Date(s.started_at);
                    return sessionDate >= weekStart && sessionDate <= weekEnd;
                }).reduce((sum, s) => sum + s.duration_minutes, 0);

                days.push({
                    date: weekStart.toISOString(),
                    label: `W${4 - i}`,
                    minutes: weekMinutes,
                });
            }
        } else {
            // Last 12 months (simplified to last 4 months for display)
            for (let i = 3; i >= 0; i--) {
                const monthStart = new Date();
                monthStart.setMonth(monthStart.getMonth() - i, 1);
                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

                const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short' });

                const monthMinutes = sessions.filter(s => {
                    const sessionDate = new Date(s.started_at);
                    return sessionDate >= monthStart && sessionDate <= monthEnd;
                }).reduce((sum, s) => sum + s.duration_minutes, 0);

                days.push({
                    date: monthStart.toISOString(),
                    label: monthLabel,
                    minutes: monthMinutes,
                });
            }
        }

        return days;
    };

    // Calculate stats
    const getStats = () => {
        const last7Days = sessions.filter(s => {
            const sessionDate = new Date(s.started_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
        });

        const totalMinutes = last7Days.reduce((sum, s) => sum + s.duration_minutes, 0);
        const avgMinutes = totalMinutes / 7;

        // Calculate streak
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const hasSession = sessions.some(s => s.started_at.startsWith(dateStr));
            if (hasSession) {
                streak++;
            } else if (dateStr !== today) {
                break;
            }
        }

        // Category breakdown
        const categoryMap = new Map<string, number>();
        sessions.forEach(s => {
            const catName = s.task_name || 'General';
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + s.duration_minutes);
        });
        const categoryBreakdown = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            totalHours: (totalMinutes / 60).toFixed(1),
            avgHours: (avgMinutes / 60).toFixed(1),
            streak,
            totalSessions: sessions.length,
            categoryBreakdown,
        };
    };

    const chartData = getChartData();
    const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);
    const stats = getStats();
    const { colors, isDark } = useTheme();

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Calculate additional metrics
    const totalMinutesAllTime = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const avgSessionLength = sessions.length > 0 ? Math.round(totalMinutesAllTime / sessions.length) : 0;
    const bestDayMinutes = Math.max(...chartData.map(d => d.minutes), 0);
    const focusScore = stats.totalHours > 0 ? Math.min(100, Math.round((stats.totalHours / 42) * 100)) : 0; // 6hrs * 7 days = 42hrs goal

    // This month stats
    const now = new Date();
    const thisMonthSessions = sessions.filter(s => {
        const d = new Date(s.started_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthMinutes = thisMonthSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const thisMonthHours = (thisMonthMinutes / 60).toFixed(1);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <BarChart2 size={28} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                {/* Main Stats Cards - 2x2 Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Flame size={24} color="#FF6B00" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.streak}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Clock size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalHours}h</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <TrendingUp size={24} color="#1976D2" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgHours}h</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Avg</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Calendar size={24} color="#9C27B0" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalSessions}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
                    </View>
                </View>

                {/* Timeframe Filters - Below Stats Grid */}
                <View style={styles.filterRowInline}>
                    {(['daily', 'weekly', 'monthly'] as TimeFrame[]).map((tf) => (
                        <TouchableOpacity
                            key={tf}
                            style={[styles.filterButton, { backgroundColor: colors.primaryLight }, timeFrame === tf && { backgroundColor: colors.primary }]}
                            onPress={() => setTimeFrame(tf)}
                        >
                            <Text style={[styles.filterText, { color: colors.textSecondary }, timeFrame === tf && { color: '#FFF' }]}>
                                {tf.charAt(0).toUpperCase() + tf.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bar Chart */}
                <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>
                        📊 {timeFrame === 'daily' ? 'Last 7 Days' : timeFrame === 'weekly' ? 'Last 4 Weeks' : 'Last 4 Months'}
                    </Text>
                    <View style={styles.chart}>
                        {chartData.map((day, index) => {
                            const barHeight = (day.minutes / maxMinutes) * 120;
                            const hours = (day.minutes / 60).toFixed(1);

                            return (
                                <View key={day.date || index} style={styles.barContainer}>
                                    <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                                        {day.minutes >= 60 ? `${hours}h` : `${day.minutes}m`}
                                    </Text>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: Math.max(barHeight, 4),
                                                backgroundColor: day.minutes >= 360 ? colors.primary :
                                                    day.minutes > 0 ? '#A5D6A7' : colors.border,
                                            }
                                        ]}
                                    />
                                    <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{day.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Additional Insights */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 More Insights</Text>

                <View style={styles.insightsGrid}>
                    <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.insightValue, { color: colors.primary }]}>{avgSessionLength}m</Text>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Avg Session</Text>
                    </View>
                    <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.insightValue, { color: '#FF6B00' }]}>{(bestDayMinutes / 60).toFixed(1)}h</Text>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Best Day</Text>
                    </View>
                    <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.insightValue, { color: '#9C27B0' }]}>{thisMonthHours}h</Text>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>This Month</Text>
                    </View>
                </View>

                {/* Focus Score */}
                <View style={[styles.focusScoreCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.focusScoreHeader}>
                        <Text style={[styles.focusScoreTitle, { color: colors.text }]}>🎯 Weekly Focus Score</Text>
                        <Text style={[styles.focusScoreValue, { color: focusScore >= 70 ? colors.primary : focusScore >= 40 ? '#FF6B00' : '#D32F2F' }]}>
                            {focusScore}%
                        </Text>
                    </View>
                    <View style={[styles.focusScoreBar, { backgroundColor: colors.border }]}>
                        <View style={[
                            styles.focusScoreFill,
                            {
                                width: `${focusScore}%`,
                                backgroundColor: focusScore >= 70 ? colors.primary : focusScore >= 40 ? '#FF6B00' : '#D32F2F'
                            }
                        ]} />
                    </View>
                    <Text style={[styles.focusScoreHint, { color: colors.textMuted }]}>
                        {focusScore >= 70 ? '🌟 Excellent! Keep it up!' :
                            focusScore >= 40 ? '💪 Good progress, aim higher!' :
                                '🚀 Focus more to grow your farm!'}
                    </Text>
                </View>

                {/* Quick Tips */}
                <View style={[styles.tipsCard, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Focus Tips</Text>
                    <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                        • Goal: 6 hours daily = 42 hours/week{'\n'}
                        • Each 6-hour day = +1 Hen{'\n'}
                        • Consistency beats intensity!
                    </Text>
                </View>

                {sessions.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📝</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sessions yet</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Start a focus session to see your analytics!</Text>
                    </View>
                )}
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
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 8,
        marginBottom: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
    },
    filterButtonActive: {
        backgroundColor: '#4A7C23',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B8E6B',
    },
    filterTextActive: {
        color: '#FFF',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    statCard: {
        width: '47%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2D4A22',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B8E6B',
        marginTop: 4,
    },
    chartCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D4A22',
        marginBottom: 16,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 160,
        paddingTop: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barValue: {
        fontSize: 10,
        color: '#6B8E6B',
        marginBottom: 4,
    },
    bar: {
        width: 28,
        borderRadius: 4,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 11,
        color: '#6B8E6B',
        marginTop: 8,
        fontWeight: '500',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F5E9',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    categoryRank: {
        fontSize: 12,
        color: '#9CA89C',
        fontWeight: '600',
    },
    categoryName: {
        fontSize: 14,
        color: '#2D4A22',
        flex: 1,
    },
    categoryMinutes: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A7C23',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D4A22',
        marginTop: 24,
        marginBottom: 12,
    },
    sessionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sessionInfo: {},
    sessionDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D4A22',
    },
    sessionTime: {
        fontSize: 12,
        color: '#6B8E6B',
        marginTop: 2,
    },
    sessionTask: {
        fontSize: 11,
        color: '#4A7C23',
        marginTop: 4,
    },
    sessionStats: {
        alignItems: 'flex-end',
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4A7C23',
    },
    sessionLeaves: {
        fontSize: 11,
        color: '#FF6B00',
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#6B8E6B',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA89C',
        marginTop: 4,
    },
    filterRowInline: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        marginBottom: 8,
        justifyContent: 'center',
    },
    insightsGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    insightCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
    },
    insightValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    insightLabel: {
        fontSize: 11,
        marginTop: 4,
    },
    focusScoreCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    focusScoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    focusScoreTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    focusScoreValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    focusScoreBar: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    focusScoreFill: {
        height: '100%',
        borderRadius: 5,
    },
    focusScoreHint: {
        fontSize: 12,
        marginTop: 10,
        textAlign: 'center',
    },
    tipsCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 13,
        lineHeight: 20,
    },
});
