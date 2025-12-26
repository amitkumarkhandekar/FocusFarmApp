import React, { useState, useEffect, useCallback } from 'react';
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
import { ChevronLeft, ChevronRight, RotateCcw, BarChart2 } from 'lucide-react-native';
import { useFarm, StudySession } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeFrame = 'day' | 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
    const { getSessions } = useFarm();
    const { colors, isDark } = useTheme();
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const loadSessions = useCallback(async () => {
        // Load sessions for a longer period to support year view
        const data = await getSessions(365);
        setSessions(data);
        setIsLoading(false);
        setRefreshing(false);
    }, [getSessions]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const onRefresh = () => {
        setRefreshing(true);
        loadSessions();
    };

    // Helper: Format duration as HH:MM:SS
    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.floor((minutes * 60) % 60);
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper: Format duration as hours
    const formatHours = (minutes: number): string => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = (minutes / 60).toFixed(1);
        return `${hours}h`;
    };

    // Get date range for current view
    const getDateRange = (): { start: Date; end: Date; label: string } => {
        const date = new Date(selectedDate);

        switch (timeFrame) {
            case 'day': {
                const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const end = new Date(start);
                end.setDate(end.getDate() + 1);
                const label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                return { start, end, label };
            }
            case 'week': {
                const dayOfWeek = date.getDay();
                const start = new Date(date);
                start.setDate(date.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(start.getDate() + 7);
                const endDisplay = new Date(end);
                endDisplay.setDate(endDisplay.getDate() - 1);
                const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDisplay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                return { start, end, label };
            }
            case 'month': {
                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return { start, end, label };
            }
            case 'year': {
                const start = new Date(date.getFullYear(), 0, 1);
                const end = new Date(date.getFullYear() + 1, 0, 1);
                const label = date.getFullYear().toString();
                return { start, end, label };
            }
        }
    };

    // Navigate to previous/next period
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        const delta = direction === 'prev' ? -1 : 1;

        switch (timeFrame) {
            case 'day':
                newDate.setDate(newDate.getDate() + delta);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (delta * 7));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + delta);
                break;
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + delta);
                break;
        }
        setSelectedDate(newDate);
    };

    // Reset to today
    const resetToToday = () => {
        setSelectedDate(new Date());
    };

    // Get sessions for current period
    const getSessionsForPeriod = (): StudySession[] => {
        const { start, end } = getDateRange();
        return sessions.filter(s => {
            const sessionDate = new Date(s.started_at);
            return sessionDate >= start && sessionDate < end;
        });
    };

    // Calculate total minutes for period
    const getTotalMinutes = (): number => {
        return getSessionsForPeriod().reduce((sum, s) => sum + s.duration_minutes, 0);
    };

    // Calculate hens earned (6 hours = 360 minutes = 1 hen)
    const getHensEarned = (): number => {
        return Math.floor(getTotalMinutes() / 360);
    };

    // Get daily average
    const getDailyAverage = (): number => {
        const total = getTotalMinutes();
        const { start, end } = getDateRange();
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        return total / days;
    };

    // Get hourly data for day view
    const getDayData = (): { hour: string; minutes: number }[] => {
        const data: { hour: string; minutes: number }[] = [];
        const periodSessions = getSessionsForPeriod();

        for (let h = 0; h < 24; h++) {
            const hourLabel = `${h.toString().padStart(2, '0')}:00`;
            let hourMinutes = 0;

            periodSessions.forEach(s => {
                const sessionDate = new Date(s.started_at);
                if (sessionDate.getHours() === h) {
                    hourMinutes += s.duration_minutes;
                }
            });

            data.push({ hour: hourLabel, minutes: hourMinutes });
        }

        return data;
    };

    // Get daily data for week view
    const getWeekData = (): { day: string; date: string; minutes: number }[] => {
        const data: { day: string; date: string; minutes: number }[] = [];
        const { start } = getDateRange();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + d);
            const dateStr = dayDate.toISOString().split('T')[0];

            const dayMinutes = sessions
                .filter(s => s.started_at.startsWith(dateStr))
                .reduce((sum, s) => sum + s.duration_minutes, 0);

            data.push({
                day: dayNames[d],
                date: dayDate.getDate().toString(),
                minutes: dayMinutes
            });
        }

        return data;
    };

    // Get calendar data for month view
    const getMonthData = (): { date: number; minutes: number; isCurrentMonth: boolean }[][] => {
        const { start } = getDateRange();
        const year = start.getFullYear();
        const month = start.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const weeks: { date: number; minutes: number; isCurrentMonth: boolean }[][] = [];
        let currentWeek: { date: number; minutes: number; isCurrentMonth: boolean }[] = [];

        // Fill in days from previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            const prevDate = new Date(year, month, 1 - (startDayOfWeek - i));
            currentWeek.push({ date: prevDate.getDate(), minutes: 0, isCurrentMonth: false });
        }

        // Fill in days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            const dayMinutes = sessions
                .filter(s => s.started_at.startsWith(dateStr))
                .reduce((sum, s) => sum + s.duration_minutes, 0);

            currentWeek.push({ date: d, minutes: dayMinutes, isCurrentMonth: true });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill remaining days of last week
        if (currentWeek.length > 0) {
            let nextDate = 1;
            while (currentWeek.length < 7) {
                currentWeek.push({ date: nextDate++, minutes: 0, isCurrentMonth: false });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    // Get monthly data for year view
    const getYearData = (): { month: string; minutes: number }[] => {
        const year = selectedDate.getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return monthNames.map((month, idx) => {
            const monthStart = new Date(year, idx, 1);
            const monthEnd = new Date(year, idx + 1, 1);

            const monthMinutes = sessions
                .filter(s => {
                    const d = new Date(s.started_at);
                    return d >= monthStart && d < monthEnd;
                })
                .reduce((sum, s) => sum + s.duration_minutes, 0);

            return { month, minutes: monthMinutes };
        });
    };

    // Get color intensity based on minutes (for heatmap)
    const getHeatmapColor = (minutes: number, maxMinutes: number): string => {
        if (minutes === 0) return isDark ? colors.surface : '#f5f5f5';
        const intensity = Math.min(1, minutes / Math.max(maxMinutes, 60));
        if (isDark) {
            // Dark theme: vary opacity of primary color
            const r = parseInt(colors.primary.slice(1, 3), 16);
            const g = parseInt(colors.primary.slice(3, 5), 16);
            const b = parseInt(colors.primary.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`;
        } else {
            // Light theme: interpolate from light green to primary
            const lightGreen = [200, 230, 200];
            const primaryGreen = [74, 124, 35];
            const r = Math.round(lightGreen[0] + (primaryGreen[0] - lightGreen[0]) * intensity);
            const g = Math.round(lightGreen[1] + (primaryGreen[1] - lightGreen[1]) * intensity);
            const b = Math.round(lightGreen[2] + (primaryGreen[2] - lightGreen[2]) * intensity);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    const { label } = getDateRange();
    const totalMinutes = getTotalMinutes();
    const hensEarned = getHensEarned();
    const dailyAvg = getDailyAverage();

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

    // Render Day View
    const renderDayView = () => {
        const data = getDayData();
        const maxMinutes = Math.max(...data.map(d => d.minutes), 30);
        const displayHours = [0, 6, 12, 18, 23];

        return (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Hourly Distribution</Text>
                <View style={styles.dayChart}>
                    {data.map((item, idx) => {
                        const barHeight = (item.minutes / maxMinutes) * 100;
                        return (
                            <View key={idx} style={styles.dayBarContainer}>
                                <View
                                    style={[
                                        styles.dayBar,
                                        {
                                            height: Math.max(barHeight, 2),
                                            backgroundColor: item.minutes > 0 ? colors.primary : colors.border,
                                        }
                                    ]}
                                />
                            </View>
                        );
                    })}
                </View>
                <View style={styles.dayLabels}>
                    {displayHours.map(h => (
                        <Text key={h} style={[styles.dayLabel, { color: colors.textSecondary }]}>
                            {h.toString().padStart(2, '0')}:00
                        </Text>
                    ))}
                </View>
            </View>
        );
    };

    // Render Week View
    const renderWeekView = () => {
        const data = getWeekData();
        const maxMinutes = Math.max(...data.map(d => d.minutes), 60);
        const today = new Date().toISOString().split('T')[0];

        return (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Distribution</Text>
                <View style={styles.weekChart}>
                    {data.map((item, idx) => {
                        const barHeight = (item.minutes / maxMinutes) * 100;
                        const { start } = getDateRange();
                        const dayDate = new Date(start);
                        dayDate.setDate(start.getDate() + idx);
                        const isToday = dayDate.toISOString().split('T')[0] === today;

                        return (
                            <View key={idx} style={styles.weekBarContainer}>
                                <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                                    {item.minutes > 0 ? formatHours(item.minutes) : ''}
                                </Text>
                                <View
                                    style={[
                                        styles.weekBar,
                                        {
                                            height: Math.max(barHeight, 4),
                                            backgroundColor: item.minutes > 0 ? colors.primary : colors.border,
                                            borderWidth: isToday ? 2 : 0,
                                            borderColor: colors.accent,
                                        }
                                    ]}
                                />
                                <Text style={[styles.weekLabel, { color: colors.textSecondary }]}>{item.day}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // Render Month View (Calendar Grid)
    const renderMonthView = () => {
        const weeks = getMonthData();
        const allMinutes = weeks.flat().map(d => d.minutes);
        const maxMinutes = Math.max(...allMinutes, 60);
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const isCurrentMonth = today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear();

        return (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Calendar</Text>

                {/* Day headers */}
                <View style={styles.calendarHeader}>
                    {dayHeaders.map(day => (
                        <View key={day} style={styles.calendarHeaderCell}>
                            <Text style={[styles.calendarHeaderText, { color: colors.textSecondary }]}>{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar grid */}
                {weeks.map((week, weekIdx) => (
                    <View key={weekIdx} style={styles.calendarRow}>
                        {week.map((day, dayIdx) => {
                            const isToday = isCurrentMonth && day.isCurrentMonth && day.date === today.getDate();
                            return (
                                <View
                                    key={dayIdx}
                                    style={[
                                        styles.calendarCell,
                                        { backgroundColor: getHeatmapColor(day.minutes, maxMinutes) },
                                        isToday && { borderWidth: 2, borderColor: colors.accent },
                                    ]}
                                >
                                    <Text style={[
                                        styles.calendarDate,
                                        { color: day.isCurrentMonth ? colors.text : colors.textMuted },
                                        day.minutes > maxMinutes * 0.5 && { color: '#fff' }
                                    ]}>
                                        {day.date}
                                    </Text>
                                    {day.minutes > 0 && (
                                        <Text style={[
                                            styles.calendarMinutes,
                                            { color: day.minutes > maxMinutes * 0.5 ? '#fff' : colors.textSecondary }
                                        ]}>
                                            {formatHours(day.minutes)}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    // Render Year View (Monthly Grid)
    const renderYearView = () => {
        const data = getYearData();
        const maxMinutes = Math.max(...data.map(d => d.minutes), 60);
        const currentMonth = new Date().getMonth();
        const isCurrentYear = new Date().getFullYear() === selectedDate.getFullYear();

        return (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Yearly Overview</Text>
                <View style={styles.yearGrid}>
                    {data.map((item, idx) => {
                        const isCurrentMonthCell = isCurrentYear && idx === currentMonth;
                        return (
                            <View
                                key={idx}
                                style={[
                                    styles.yearCell,
                                    { backgroundColor: getHeatmapColor(item.minutes, maxMinutes) },
                                    isCurrentMonthCell && { borderWidth: 2, borderColor: colors.accent },
                                ]}
                            >
                                <Text style={[
                                    styles.yearMonth,
                                    { color: item.minutes > maxMinutes * 0.5 ? '#fff' : colors.text }
                                ]}>
                                    {item.month}
                                </Text>
                                <Text style={[
                                    styles.yearMinutes,
                                    { color: item.minutes > maxMinutes * 0.5 ? '#fff' : colors.textSecondary }
                                ]}>
                                    {formatHours(item.minutes)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
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
                {/* TimeFrame Selector */}
                <View style={styles.timeFrameRow}>
                    {(['day', 'week', 'month', 'year'] as TimeFrame[]).map((tf) => (
                        <TouchableOpacity
                            key={tf}
                            style={[
                                styles.timeFrameButton,
                                { backgroundColor: colors.primaryLight },
                                timeFrame === tf && { backgroundColor: colors.primary }
                            ]}
                            onPress={() => setTimeFrame(tf)}
                        >
                            <Text style={[
                                styles.timeFrameText,
                                { color: colors.textSecondary },
                                timeFrame === tf && { color: '#FFF' }
                            ]}>
                                {tf.charAt(0).toUpperCase() + tf.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date Navigator */}
                <View style={styles.dateNavigator}>
                    <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.dateContainer}>
                        <Text style={[styles.dateText, { color: colors.text }]}>{label}</Text>
                        <TouchableOpacity onPress={resetToToday} style={styles.resetButton}>
                            <RotateCcw size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
                        <ChevronRight size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Overview Card */}
                <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.overviewTop}>
                        <Text style={styles.henEmoji}>🐔</Text>
                        <View>
                            <Text style={[styles.hensLabel, { color: colors.textSecondary }]}>Hens Earned</Text>
                            <Text style={[styles.hensValue, { color: colors.primary }]}>{hensEarned}</Text>
                        </View>
                    </View>
                    <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.overviewBottom}>
                        <Text style={[styles.totalTimeLabel, { color: colors.textSecondary }]}>Total Study Time</Text>
                        <Text style={[styles.totalTimeValue, { color: colors.text }]}>{formatDuration(totalMinutes)}</Text>
                        <Text style={[styles.henNote, { color: colors.textMuted }]}>(6 hours = 1 Hen)</Text>
                    </View>
                </View>

                {/* Chart View based on TimeFrame */}
                {timeFrame === 'day' && renderDayView()}
                {timeFrame === 'week' && renderWeekView()}
                {timeFrame === 'month' && renderMonthView()}
                {timeFrame === 'year' && renderYearView()}

                {/* Stats Card */}
                <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.statsTitle, { color: colors.text }]}>{label}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.primary }]}>Total Time</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(totalMinutes)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.accent }]}>Daily Average</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(dailyAvg)}</Text>
                        </View>
                    </View>
                </View>

                {/* Empty State */}
                {totalMinutes === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📝</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data for this period</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Start a focus session to track your progress!</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
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
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },

    // TimeFrame Selector
    timeFrameRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        justifyContent: 'center',
    },
    timeFrameButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },
    timeFrameText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Date Navigator
    dateNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
    },
    resetButton: {
        padding: 4,
    },

    // Overview Card
    overviewCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    overviewTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    henEmoji: {
        fontSize: 48,
    },
    hensLabel: {
        fontSize: 14,
    },
    hensValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    overviewDivider: {
        height: 1,
        marginVertical: 16,
    },
    overviewBottom: {
        alignItems: 'center',
    },
    totalTimeLabel: {
        fontSize: 14,
    },
    totalTimeValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 4,
    },
    henNote: {
        fontSize: 12,
        marginTop: 4,
    },

    // Chart Card
    chartCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },

    // Day Chart
    dayChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 100,
        gap: 2,
    },
    dayBarContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    dayBar: {
        width: '80%',
        borderRadius: 2,
    },
    dayLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    dayLabel: {
        fontSize: 10,
    },

    // Week Chart
    weekChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
    },
    weekBarContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barValue: {
        fontSize: 10,
        marginBottom: 4,
    },
    weekBar: {
        width: 32,
        borderRadius: 4,
    },
    weekLabel: {
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
    },

    // Calendar (Month View)
    calendarHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    calendarHeaderCell: {
        flex: 1,
        alignItems: 'center',
    },
    calendarHeaderText: {
        fontSize: 12,
        fontWeight: '600',
    },
    calendarRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    calendarCell: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        margin: 2,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarDate: {
        fontSize: 12,
        fontWeight: '600',
    },
    calendarMinutes: {
        fontSize: 9,
        marginTop: 2,
    },

    // Year Grid
    yearGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    yearCell: {
        width: (SCREEN_WIDTH - 80) / 4,
        aspectRatio: 1.2,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yearMonth: {
        fontSize: 14,
        fontWeight: '700',
    },
    yearMinutes: {
        fontSize: 12,
        marginTop: 4,
    },

    // Stats Card
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    statsTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 4,
    },

    // Empty State
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
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
});
