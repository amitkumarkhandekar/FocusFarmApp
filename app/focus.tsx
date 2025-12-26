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
import { Pause, Play, X, Leaf, Check, AlertTriangle } from 'lucide-react-native';
import { useFarm } from '../context/FarmContext';
import { deactivateKeepAwake } from 'expo-keep-awake';
import * as Brightness from 'expo-brightness';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.55;

// 6 hours in seconds = 21600 seconds
const SIX_HOURS_SECONDS = 6 * 60 * 60;
const SCREEN_DIM_TIMEOUT = 30000; // 30 seconds before dimming
const MIN_BRIGHTNESS = 0.01; // Almost completely dark

const MOTIVATIONAL_QUOTES = [
    "Your chick is growing! Keep going! 🐣",
    "Almost there! Your hen is waiting! 🐔",
    "Every minute makes your chick bigger! 🌱",
    "Great things take time... keep going! 💪",
    "Focus now, celebrate later! 🎉",
];

// Chicken growth stages based on progress (0-1)
const getChickenEmoji = (progress: number): string => {
    if (progress >= 1) return '🐔'; // Full grown hen
    if (progress >= 0.8) return '🐓'; // Almost adult
    if (progress >= 0.6) return '🐥'; // Older chick
    if (progress >= 0.4) return '🐤'; // Young chick
    if (progress >= 0.2) return '🐣'; // Baby chick hatching
    return '🥚'; // Egg
};

// Get size multiplier based on progress
const getChickenSize = (progress: number): number => {
    return 0.5 + (progress * 1);
};

// Get chicken stage description
const getChickenStage = (progress: number): string => {
    if (progress >= 1) return 'Full Grown Hen! 🎉';
    if (progress >= 0.8) return 'Almost There!';
    if (progress >= 0.6) return 'Growing Fast!';
    if (progress >= 0.4) return 'Getting Bigger!';
    if (progress >= 0.2) return 'Hatching...';
    return 'Fresh Egg';
};

export default function FocusScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ taskName?: string; categoryId?: string; categoryName?: string }>();
    const { addStudyTime, saveSession, claimDailyReward, state } = useFarm();
    const { colors, isDark } = useTheme();

    // Initialize elapsed seconds with today's accumulated minutes
    const initialSeconds = (state.todayMinutes || 0) * 60;

    const [isRunning, setIsRunning] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
    const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    const [showHenEarnedModal, setShowHenEarnedModal] = useState(false);
    const [henJustEarned, setHenJustEarned] = useState(false);
    const [leaveCount, setLeaveCount] = useState(0);
    const [sessionStartTime] = useState(new Date());
    const [isScreenDimmed, setIsScreenDimmed] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const chickenScaleAnim = useRef(new Animated.Value(1)).current;
    const appState = useRef(AppState.currentState);
    const backgroundStartTime = useRef<number | null>(null);
    const lastElapsedRef = useRef(0);
    const originalBrightness = useRef<number>(0.7);
    const dimTimeout = useRef<NodeJS.Timeout | null>(null);

    // Progress towards 6 hours
    const progressTowardsHen = (totalSeconds % SIX_HOURS_SECONDS) / SIX_HOURS_SECONDS;
    const currentChickenProgress = Math.min(progressTowardsHen, 1);

    // Sync elapsedSeconds with ref
    useEffect(() => {
        lastElapsedRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    // Screen brightness management - save original and set up dimming
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
        deactivateKeepAwake('focus-session');

        return () => {
            // Restore brightness when leaving
            if (dimTimeout.current) clearTimeout(dimTimeout.current);
            Brightness.setBrightnessAsync(originalBrightness.current).catch(() => { });
        };
    }, []);

    // Auto-dim after 30 seconds of inactivity
    const resetDimTimer = useCallback(() => {
        // Clear existing timer
        if (dimTimeout.current) clearTimeout(dimTimeout.current);

        // Restore brightness if dimmed
        if (isScreenDimmed) {
            Brightness.setBrightnessAsync(originalBrightness.current).catch(() => { });
            setIsScreenDimmed(false);
        }

        // Set new dim timer (only if running)
        if (isRunning) {
            dimTimeout.current = setTimeout(() => {
                Brightness.setBrightnessAsync(MIN_BRIGHTNESS).catch(() => { });
                setIsScreenDimmed(true);
            }, SCREEN_DIM_TIMEOUT);
        }
    }, [isRunning, isScreenDimmed]);

    // Start dim timer on mount and when running changes
    useEffect(() => {
        if (isRunning) {
            resetDimTimer();
        } else {
            // Restore brightness when paused
            if (dimTimeout.current) clearTimeout(dimTimeout.current);
            Brightness.setBrightnessAsync(originalBrightness.current).catch(() => { });
            setIsScreenDimmed(false);
        }
        return () => {
            if (dimTimeout.current) clearTimeout(dimTimeout.current);
        };
    }, [isRunning]);

    // Handle screen touch - restore brightness
    const handleScreenTouch = () => {
        resetDimTimer();
    };

    // Check if hen was earned
    useEffect(() => {
        const previousHens = Math.floor((totalSeconds - 1) / SIX_HOURS_SECONDS);
        const currentHens = Math.floor(totalSeconds / SIX_HOURS_SECONDS);

        if (currentHens > previousHens && totalSeconds > 0 && !henJustEarned) {
            setHenJustEarned(true);
            setShowHenEarnedModal(true);

            Animated.sequence([
                Animated.spring(chickenScaleAnim, { toValue: 1.5, useNativeDriver: true }),
                Animated.spring(chickenScaleAnim, { toValue: 1, useNativeDriver: true }),
            ]).start();

            Vibration.vibrate([0, 200, 100, 200, 100, 400]);
        }
    }, [totalSeconds]);

    // App State Detection - Timer CONTINUES in background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // Going to background/inactive
            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                if (isRunning) {
                    backgroundStartTime.current = Date.now();
                    Vibration.vibrate([0, 100, 50, 100]);
                    setLeaveCount(prev => prev + 1);
                }
            }

            // Coming back to active
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (backgroundStartTime.current && isRunning) {
                    const timeAwayMs = Date.now() - backgroundStartTime.current;
                    const timeAwaySec = Math.floor(timeAwayMs / 1000);

                    setElapsedSeconds(prev => prev + timeAwaySec);
                    setTotalSeconds(prev => prev + timeAwaySec);

                    if (timeAwaySec > 5) {
                        setShowLeaveWarning(true);

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
    }, [isRunning, leaveCount]);

    // Animations
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

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
                setTotalSeconds(prev => prev + 1);
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

    const formatTimeRemaining = () => {
        const remaining = SIX_HOURS_SECONDS - (totalSeconds % SIX_HOURS_SECONDS);
        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        return `${hrs}h ${mins}m to next hen`;
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
            ? `\n\n📱 You checked your phone ${leaveCount} time(s).`
            : '\n\n✨ Perfect focus session!';

        const henMessage = henJustEarned ? '\n\n🐔 You earned a new hen!' : '';

        Alert.alert(
            "Great Work! 🎉",
            `You focused for ${formatTime(elapsedSeconds)}!${leaveMessage}${henMessage}\n\nThis time will be added to your goals.`,
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

                        const newTotalMinutes = state.todayMinutes + minutes;
                        if (newTotalMinutes >= state.dailyGoalTarget * 60 && !state.dailyGoalClaimed) {
                            claimDailyReward();
                        }

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

        const newTotalMinutes = state.todayMinutes + minutes;
        if (newTotalMinutes >= state.dailyGoalTarget * 60 && !state.dailyGoalClaimed) {
            claimDailyReward();
        }

        const leaveMessage = leaveCount > 0
            ? `\n\n📱 You checked your phone ${leaveCount} time(s).`
            : '';

        const henMessage = henJustEarned ? '\n\n🐔 You earned a new hen!' : '';

        Alert.alert(
            "Session Saved! 🌟",
            `${minutes} minutes added to your goals.${leaveMessage}${henMessage}`,
            [{ text: "Back to Farm", onPress: () => router.replace('/(tabs)/farm') }]
        );
    };

    const handleContinueFocus = () => {
        setShowLeaveWarning(false);
        setIsRunning(true);
    };

    const handleHenEarnedContinue = () => {
        setShowHenEarnedModal(false);
    };

    const chickenEmoji = getChickenEmoji(currentChickenProgress);
    const chickenSize = getChickenSize(currentChickenProgress);
    const chickenStage = getChickenStage(currentChickenProgress);

    return (
        <TouchableWithoutFeedback onPress={handleScreenTouch}>
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

                    {/* Leave Counter (informational only, no penalty) */}
                    {leaveCount > 0 && (
                        <View style={[styles.leaveWarning, { backgroundColor: isDark ? '#2A2522' : '#FFF3E0' }]}>
                            <AlertTriangle size={16} color="#FF6B00" />
                            <Text style={[styles.leaveWarningText, { color: '#E65100' }]}>
                                📱 Checked phone {leaveCount}x - Stay focused!
                            </Text>
                        </View>
                    )}

                    {/* Motivational Quote */}
                    <View style={[styles.quoteContainer, { backgroundColor: colors.surface }]}>
                        <Leaf size={20} color={colors.textSecondary} />
                        <Text style={[styles.quote, { color: colors.textSecondary }]}>{quote}</Text>
                    </View>

                    {/* Growing Chicken Display */}
                    <View style={styles.chickenContainer}>
                        <View style={[styles.chickenCircle, { backgroundColor: colors.surface }]}>
                            <Animated.Text style={[
                                styles.chickenEmoji,
                                {
                                    fontSize: 60 * chickenSize,
                                    transform: [{ scale: chickenScaleAnim }]
                                }
                            ]}>
                                {chickenEmoji}
                            </Animated.Text>
                            <Text style={[styles.chickenStage, { color: colors.primary }]}>{chickenStage}</Text>

                            {/* Progress bar */}
                            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${currentChickenProgress * 100}%`,
                                            backgroundColor: currentChickenProgress >= 1 ? colors.accent : colors.primary
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.timeRemaining, { color: colors.textMuted }]}>
                                {currentChickenProgress >= 1 ? '🎉 Hen earned!' : formatTimeRemaining()}
                            </Text>
                        </View>
                    </View>

                    {/* Timer Circle */}
                    <View style={styles.timerContainer}>
                        <Animated.View
                            style={[
                                styles.timerCircle,
                                { transform: [{ scale: pulseAnim }], backgroundColor: isDark ? colors.surface : '#FFF' },
                                !isRunning && styles.timerCirclePaused
                            ]}
                        >
                            <View style={styles.timerInner}>
                                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>This Session</Text>
                                <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
                                <Text style={[styles.statusText, { color: colors.primary }, !isRunning && styles.statusTextPaused]}>
                                    {isRunning ? 'Focusing...' : 'Paused'}
                                </Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Today's Total */}
                    <View style={[styles.todayTotal, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Today's Total:</Text>
                        <Text style={[styles.todayValue, { color: colors.primary }]}>{formatTime(totalSeconds)}</Text>
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
                </Animated.View>

                {/* Leave Warning Modal (No penalty, just informational) */}
                <Modal visible={showLeaveWarning} transparent animationType="fade">
                    <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <Text style={styles.modalEmoji}>📱</Text>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Welcome Back!</Text>
                            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                                Your timer continued while you were away. Try to stay focused for better results!
                            </Text>
                            <View style={styles.modalStats}>
                                <View style={[styles.modalStat, { backgroundColor: colors.primaryLight }]}>
                                    <Text style={[styles.modalStatValue, { color: colors.text }]}>{leaveCount}</Text>
                                    <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>Times Away</Text>
                                </View>
                                <View style={[styles.modalStat, { backgroundColor: colors.primaryLight }]}>
                                    <Text style={[styles.modalStatValue, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
                                    <Text style={[styles.modalStatLabel, { color: colors.textSecondary }]}>Session Time</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleContinueFocus}>
                                <Text style={styles.modalButtonText}>Continue Focusing</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Hen Earned Modal */}
                <Modal visible={showHenEarnedModal} transparent animationType="fade">
                    <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                        <View style={[styles.modalContent, styles.henEarnedModal, { backgroundColor: colors.surface }]}>
                            <Text style={styles.henEarnedEmoji}>🐔</Text>
                            <Text style={[styles.henEarnedTitle, { color: colors.primary }]}>Congratulations!</Text>
                            <Text style={[styles.henEarnedMessage, { color: colors.textSecondary }]}>
                                You've studied for 6 hours! A new hen has been added to your farm! 🎉
                            </Text>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleHenEarnedContinue}>
                                <Text style={styles.modalButtonText}>Keep Going!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    taskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 12,
    },
    taskText: {
        fontSize: 14,
        fontWeight: '600',
    },
    categoryText: {
        fontSize: 14,
    },
    leaveWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 12,
        gap: 8,
    },
    leaveWarningText: {
        fontSize: 13,
        fontWeight: '600',
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginHorizontal: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    quote: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },

    // Growing Chicken
    chickenContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    chickenCircle: {
        width: SCREEN_WIDTH * 0.5,
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    chickenEmoji: {
        textAlign: 'center',
    },
    chickenStage: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
    },
    progressBarContainer: {
        width: '80%',
        height: 8,
        borderRadius: 4,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    timeRemaining: {
        fontSize: 12,
        marginTop: 8,
    },

    // Timer
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
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
    timeLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 44,
        fontWeight: '200',
        letterSpacing: -2,
    },
    statusText: {
        fontSize: 14,
        marginTop: 8,
        fontWeight: '600',
    },
    statusTextPaused: {
        color: '#FF9800',
    },

    // Today's Total
    todayTotal: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 16,
        gap: 8,
    },
    todayLabel: {
        fontSize: 14,
    },
    todayValue: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Controls
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 30,
    },
    controlButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
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
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#000',
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

    // Modals
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
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
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    modalStatValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    modalStatLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    modalButton: {
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
    henEarnedModal: {
        borderWidth: 3,
        borderColor: '#4A7C23',
    },
    henEarnedEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    henEarnedTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    henEarnedMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
});
