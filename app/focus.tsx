import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Alert,
    Dimensions,
    AppState,
    AppStateStatus,
    Modal,
    Vibration
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pause, Play, X, Leaf, Check, AlertTriangle, Skull } from 'lucide-react-native';
import { useFarm } from '../context/FarmContext';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.65;
const SCREEN_DIM_TIMEOUT = 30000; // 30 seconds
const DIM_BRIGHTNESS = 0; // Complete screen off

const MOTIVATIONAL_QUOTES = [
    "Stay focused, your farm is growing! 🌱",
    "Every minute counts towards your goals! 🎯",
    "Your animals are cheering you on! 🐔",
    "Great things take time... keep going! 💪",
    "Focus now, celebrate later! 🎉",
];

export default function FocusScreen() {
    // NOTE: Removed useKeepAwake() to allow device's natural screen timeout behavior

    const router = useRouter();
    const params = useLocalSearchParams<{ taskName?: string; categoryId?: string; categoryName?: string }>();
    const { addStudyTime, saveSession, applyPenalty, state } = useFarm();

    const [isRunning, setIsRunning] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    const [showPenaltyWarning, setShowPenaltyWarning] = useState(false);
    const [leaveCount, setLeaveCount] = useState(0);
    const [sessionStartTime] = useState(new Date());
    const [isScreenDimmed, setIsScreenDimmed] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const appState = useRef(AppState.currentState);
    const backgroundStartTime = useRef<number | null>(null);
    const lastElapsedRef = useRef(0);
    const originalBrightness = useRef<number>(0.7);
    const dimTimeout = useRef<NodeJS.Timeout | null>(null);

    // Keep elapsedSeconds in sync with ref for background calculation
    useEffect(() => {
        lastElapsedRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    // Screen brightness management
    useEffect(() => {
        const initBrightness = async () => {
            try {
                const { status } = await Brightness.requestPermissionsAsync();
                if (status === 'granted') {
                    originalBrightness.current = await Brightness.getBrightnessAsync();
                }
            } catch (e) {
                console.log('Brightness permission not available');
            }
        };
        initBrightness();

        return () => {
            // Restore brightness when leaving
            if (dimTimeout.current) clearTimeout(dimTimeout.current);
            Brightness.setBrightnessAsync(originalBrightness.current).catch(() => { });
        };
    }, []);

    // Auto-dim after inactivity
    const resetDimTimer = useCallback(() => {
        if (dimTimeout.current) clearTimeout(dimTimeout.current);

        // Restore brightness if dimmed
        if (isScreenDimmed) {
            Brightness.setBrightnessAsync(originalBrightness.current).catch(() => { });
            setIsScreenDimmed(false);
        }

        // Set new dim timer
        dimTimeout.current = setTimeout(() => {
            if (isRunning) {
                Brightness.setBrightnessAsync(DIM_BRIGHTNESS).catch(() => { });
                setIsScreenDimmed(true);
            }
        }, SCREEN_DIM_TIMEOUT);
    }, [isRunning, isScreenDimmed]);

    // Reset dim timer on mount and when running changes
    useEffect(() => {
        if (isRunning) {
            resetDimTimer();
        }
        return () => {
            if (dimTimeout.current) clearTimeout(dimTimeout.current);
        };
    }, [isRunning]);

    const handleScreenTouch = () => {
        resetDimTimer();
    };


    // App State Detection - Timer CONTINUES even in background
    // Only track when user leaves and show warning when returning
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // Going to background/inactive (screen off or app minimized)
            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                if (isRunning) {
                    // Record when we went to background
                    backgroundStartTime.current = Date.now();

                    // Vibrate as warning that user left
                    Vibration.vibrate([0, 100, 50, 100]);

                    // DO NOT stop the timer - it continues conceptually
                    // We'll add the background time when returning

                    // Count as a leave
                    setLeaveCount(prev => prev + 1);
                }
            }

            // Coming back to active
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (backgroundStartTime.current && isRunning) {
                    const timeAwayMs = Date.now() - backgroundStartTime.current;
                    const timeAwaySec = Math.floor(timeAwayMs / 1000);

                    // Add the time spent in background to elapsed
                    // Timer was "running" the whole time
                    setElapsedSeconds(prev => prev + timeAwaySec);

                    // Only show warning if away for more than 5 seconds
                    // (quick screen lock might be unintentional)
                    if (timeAwaySec > 5) {
                        setShowLeaveWarning(true);

                        // Check if penalty needed (3+ leaves)
                        if (leaveCount >= 3 && state.hens > 0) {
                            setShowPenaltyWarning(true);
                        }

                        // Shake animation
                        Animated.sequence([
                            Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
                            Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
                            Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
                            Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
                            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                        ]).start();
                    }

                    backgroundStartTime.current = null;
                }
            }

            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [isRunning, state.hens, leaveCount]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        if (isRunning) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.02,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isRunning]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePause = () => {
        setIsRunning(!isRunning);
    };

    const handleStop = () => {
        const minutes = Math.floor(elapsedSeconds / 60);

        if (elapsedSeconds < 60) {
            Alert.alert(
                "Too Short! ⏱️",
                "You need to focus for at least 1 minute to save progress.",
                [
                    { text: "Keep Focusing", style: "cancel" },
                    {
                        text: "Exit Anyway",
                        style: "destructive",
                        onPress: () => router.replace('/(tabs)/farm')
                    },
                ]
            );
            return;
        }

        const leaveMessage = leaveCount > 0
            ? `\n\n⚠️ You left the app ${leaveCount} time(s).`
            : '\n\n✨ Perfect focus session!';

        Alert.alert(
            "Great Work! 🎉",
            `You focused for ${formatTime(elapsedSeconds)}!${leaveMessage}\n\nThis time will be added to your goals.`,
            [
                {
                    text: "Save & Exit",
                    onPress: async () => {
                        addStudyTime(minutes);
                        await saveSession({
                            durationMinutes: minutes,
                            startedAt: sessionStartTime,
                            leaveCount,
                            taskName: params.taskName,
                            categoryId: params.categoryId,
                        });
                        router.replace('/(tabs)/farm');
                    }
                },
            ]
        );
    };

    const handleFinish = async () => {
        const minutes = Math.floor(elapsedSeconds / 60);
        addStudyTime(minutes);
        await saveSession({
            durationMinutes: minutes,
            startedAt: sessionStartTime,
            leaveCount,
            taskName: params.taskName,
            categoryId: params.categoryId,
        });

        const leaveMessage = leaveCount > 0
            ? `\n\n⚠️ You left ${leaveCount} time(s).`
            : '';

        Alert.alert(
            "Session Saved! 🌟",
            `${minutes} minutes added to your goals.${leaveMessage}`,
            [{ text: "Back to Farm", onPress: () => router.replace('/(tabs)/farm') }]
        );
    };

    const handleContinueFocus = () => {
        setShowLeaveWarning(false);
        setIsRunning(true);
    };

    const handlePenaltyConfirm = () => {
        applyPenalty(1);
        setShowPenaltyWarning(false);
        Alert.alert(
            "Penalty Applied 😔",
            "You lost 1 hen for leaving the app too many times. Stay focused!",
            [{ text: "I'll try harder!" }]
        );
    };

    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={handleStop}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Focus Session</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Task Name Display */}
                {params.taskName && (
                    <View style={[styles.taskBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.taskText, { color: colors.primary }]}>📝 {params.taskName}</Text>
                        {params.categoryName && (
                            <Text style={[styles.categoryText, { color: colors.textSecondary }]}> • {params.categoryName}</Text>
                        )}
                    </View>
                )}

                {/* Leave Counter Warning */}
                {leaveCount > 0 && (
                    <View style={[styles.leaveWarning, leaveCount >= 3 && styles.leaveWarningDanger]}>
                        <AlertTriangle size={16} color={leaveCount >= 3 ? "#D32F2F" : "#FF6B00"} />
                        <Text style={[styles.leaveWarningText, leaveCount >= 3 && styles.leaveWarningTextDanger]}>
                            Left app {leaveCount}x {leaveCount >= 3 ? '- Penalty applied!' : '- Stay focused!'}
                        </Text>
                    </View>
                )}

                {/* Motivational Quote */}
                <View style={[styles.quoteContainer, { backgroundColor: colors.surface }]}>
                    <Leaf size={20} color={colors.textSecondary} />
                    <Text style={[styles.quote, { color: colors.textSecondary }]}>{quote}</Text>
                </View>

                {/* Timer Circle */}
                <View style={styles.timerContainer}>
                    <Animated.View
                        style={[
                            styles.timerCircle,
                            { transform: [{ scale: pulseAnim }], backgroundColor: isDark ? colors.primary : '#4A7C23' },
                            !isRunning && styles.timerCirclePaused
                        ]}
                    >
                        <View style={styles.timerInner}>
                            <Text style={styles.timeText}>{formatTime(elapsedSeconds)}</Text>
                            <Text style={[styles.statusText, !isRunning && styles.statusTextPaused]}>
                                {isRunning ? 'Focusing...' : 'Paused'}
                            </Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Focus Tip */}
                <View style={[styles.tipContainer, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.tipText, { color: isDark ? colors.accent : '#8B6B00' }]}>⚠️ Leaving the app will pause timer & count as distraction</Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.controlButton, isRunning ? styles.pauseButton : styles.playButton, { backgroundColor: isRunning ? '#FF6B00' : colors.primary }]}
                        onPress={handlePause}
                    >
                        {isRunning ? (
                            <Pause size={32} color="#FFF" />
                        ) : (
                            <Play size={32} color="#FFF" fill="#FFF" />
                        )}
                    </TouchableOpacity>

                    {elapsedSeconds >= 60 && (
                        <TouchableOpacity
                            style={[styles.finishButton, { backgroundColor: colors.primary }]}
                            onPress={handleFinish}
                        >
                            <Check size={24} color="#FFF" />
                            <Text style={styles.finishText}>Finish</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Time Info */}
                <View style={[styles.progressInfo, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                        {elapsedSeconds >= 60
                            ? `${Math.floor(elapsedSeconds / 60)} min will be saved`
                            : 'Focus for at least 1 min to save'
                        }
                    </Text>
                </View>
            </Animated.View>

            {/* Leave Warning Modal */}
            <Modal visible={showLeaveWarning} transparent animationType="fade">
                <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={styles.modalEmoji}>😔</Text>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>You left the app!</Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            Your timer was paused. Each time you leave counts as a distraction.
                            {leaveCount >= 3 && '\n\n🐔 You lost 1 hen as a penalty!'}
                        </Text>
                        <View style={styles.modalStats}>
                            <View style={[styles.modalStat, { backgroundColor: colors.primaryLight }]}>
                                <Text style={[styles.modalStatValue, { color: colors.text }]}>{leaveCount}</Text>
                                <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>Times Left</Text>
                            </View>
                            <View style={[styles.modalStat, { backgroundColor: colors.primaryLight }]}>
                                <Text style={[styles.modalStatValue, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
                                <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>Total Time</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleContinueFocus}>
                            <Text style={styles.modalButtonText}>Continue Focusing</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Penalty Warning Modal */}
            <Modal visible={showPenaltyWarning} transparent animationType="fade">
                <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.modalContent, styles.penaltyModal, { backgroundColor: colors.surface }]}>
                        <Skull size={48} color="#D32F2F" />
                        <Text style={[styles.penaltyTitle, { color: colors.error }]}>Penalty Warning!</Text>
                        <Text style={[styles.penaltyMessage, { color: colors.textSecondary }]}>
                            You've left the app {leaveCount} times. As a consequence, you will lose 1 hen from your farm.
                        </Text>
                        <TouchableOpacity style={styles.penaltyButton} onPress={handlePenaltyConfirm}>
                            <Text style={styles.penaltyButtonText}>I understand</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        width: '100%',
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
        backgroundColor: '#D7ECD7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D4A22',
    },
    taskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 12,
    },
    taskText: {
        fontSize: 14,
        color: '#2D4A22',
        fontWeight: '600',
    },
    categoryText: {
        fontSize: 14,
        color: '#6B8E6B',
    },
    leaveWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 12,
        gap: 8,
    },
    leaveWarningDanger: {
        backgroundColor: '#FFEBEE',
    },
    leaveWarningText: {
        fontSize: 13,
        color: '#E65100',
        fontWeight: '600',
    },
    leaveWarningTextDanger: {
        color: '#D32F2F',
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginTop: 12,
        marginHorizontal: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    quote: {
        fontSize: 13,
        color: '#556B2F',
        flex: 1,
        lineHeight: 18,
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 6,
        borderColor: '#4A7C23',
    },
    timerCirclePaused: {
        borderColor: '#FF9800',
    },
    timerInner: {
        alignItems: 'center',
    },
    timeText: {
        fontSize: 52,
        fontWeight: '200',
        color: '#2D4A22',
        letterSpacing: -2,
    },
    statusText: {
        fontSize: 16,
        color: '#4A7C23',
        marginTop: 8,
        fontWeight: '600',
    },
    statusTextPaused: {
        color: '#FF9800',
    },
    tipContainer: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 16,
    },
    tipText: {
        fontSize: 11,
        color: '#E65100',
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 20,
    },
    controlButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    pauseButton: {
        backgroundColor: '#FF9800',
    },
    playButton: {
        backgroundColor: '#4A7C23',
    },
    finishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A7C23',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    finishText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    progressInfo: {
        marginBottom: 30,
    },
    progressText: {
        fontSize: 14,
        color: '#6B8E6B',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    modalEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2D4A22',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: '#6B8E6B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    modalStats: {
        flexDirection: 'row',
        gap: 32,
        marginBottom: 24,
    },
    modalStat: {
        alignItems: 'center',
    },
    modalStatValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#E65100',
    },
    modalStatLabel: {
        fontSize: 12,
        color: '#6B8E6B',
        marginTop: 4,
    },
    modalButton: {
        backgroundColor: '#4A7C23',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
        width: '100%',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    penaltyModal: {
        borderWidth: 3,
        borderColor: '#D32F2F',
    },
    penaltyTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#D32F2F',
        marginTop: 16,
        marginBottom: 12,
    },
    penaltyMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    penaltyButton: {
        backgroundColor: '#D32F2F',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
        width: '100%',
    },
    penaltyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
