import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StudySession {
    id: string;
    duration_minutes: number;
    started_at: string;
    ended_at: string;
    leave_count: number;
    task_name?: string;
    category_id?: string;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface FarmState {
    hens: number;
    goats: number;
    cows: number;
    todayMinutes: number;
    lastDayReset: string;
    dailyGoalClaimed: boolean;
    isLoading: boolean;
    lastSyncTime: string | null;
    categories: Category[];
    dailyGoalTarget: number;
    weeklyGoalTarget: number;
    monthlyGoalTarget: number;
    weeklyGoalClaimed: boolean;
    monthlyGoalClaimed: boolean;
    userName: string;
}

interface FarmContextType {
    state: FarmState;
    addStudyTime: (minutes: number) => void;
    claimDailyReward: () => void;
    claimWeeklyReward: () => Promise<void>;
    claimMonthlyReward: () => Promise<void>;
    convertHensToGoat: () => Promise<boolean>;
    convertHensToCow: () => Promise<boolean>;
    applyPenalty: (hensToLose: number) => void;
    getTotalAnimals: () => number;
    refreshState: () => Promise<void>;
    saveSession: (params: {
        durationMinutes: number;
        startedAt: Date;
        leaveCount: number;
        taskName?: string;
        categoryId?: string;
    }) => Promise<void>;
    getSessions: (days?: number) => Promise<StudySession[]>;
    getCategories: () => Promise<Category[]>;
    addCategory: (name: string, color: string, icon: string) => Promise<Category | null>;
    deleteCategory: (id: string) => Promise<void>;
    updateGoalTargets: (daily: number, weekly: number, monthly: number) => Promise<void>;
    setUserName: (name: string) => Promise<void>;
}

const defaultState: FarmState = {
    hens: 0,
    goats: 0,
    cows: 0,
    todayMinutes: 0,
    lastDayReset: new Date().toDateString(),
    dailyGoalClaimed: false,
    isLoading: true,
    lastSyncTime: null,
    categories: [],
    dailyGoalTarget: 6, // 6 hours default
    weeklyGoalTarget: 40, // 40 hours default
    monthlyGoalTarget: 160, // 160 hours default
    weeklyGoalClaimed: false,
    monthlyGoalClaimed: false,
    userName: 'Focus Farmer',
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FarmState>(defaultState);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const initializeUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                await loadStateFromSupabase(user.id);
                await loadCategories(user.id);
                await loadGoalTargets();
                await loadClaimStatuses();
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                await loadStateFromSupabase(session.user.id);
                await loadCategories(session.user.id);
                await loadGoalTargets();
                await loadClaimStatuses();
            } else {
                setUserId(null);
                setState({ ...defaultState, isLoading: false });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadCategories = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', uid)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setState(prev => ({ ...prev, categories: data }));
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadGoalTargets = async () => {
        try {
            const saved = await AsyncStorage.getItem('focusSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                setState(prev => ({
                    ...prev,
                    dailyGoalTarget: settings.dailyGoalTarget ?? 6,
                    weeklyGoalTarget: settings.weeklyGoalTarget ?? 40,
                    monthlyGoalTarget: settings.monthlyGoalTarget ?? 160,
                    userName: settings.userName ?? 'Focus Farmer',
                }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const loadClaimStatuses = async () => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const week = Math.floor(now.getDate() / 7); // Simple week estimation

            const weeklyKey = `weeklyGoalClaimed_${year}_${week}`;
            const monthlyKey = `monthlyGoalClaimed_${year}_${month}`;

            const weeklyClaimed = await AsyncStorage.getItem(weeklyKey);
            const monthlyClaimed = await AsyncStorage.getItem(monthlyKey);

            setState(prev => ({
                ...prev,
                weeklyGoalClaimed: !!weeklyClaimed,
                monthlyGoalClaimed: !!monthlyClaimed,
            }));
        } catch (error) {
            console.error('Error loading claim statuses:', error);
        }
    };

    const loadStateFromSupabase = async (uid: string) => {
        try {
            const today = new Date().toDateString();

            // First, check if user exists
            const { data: existingUser } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', uid)
                .single();

            // If no existing user, create new one with starter gifts
            if (!existingUser) {
                const { data: newUser, error: insertError } = await supabase
                    .from('user_progress')
                    .insert({
                        user_id: uid,
                        hens: 1,      // Starter gift: 1 Hen
                        goats: 1,     // Starter gift: 1 Goat
                        cows: 1,      // Starter gift: 1 Cow
                        today_minutes: 0,
                        last_day_reset: today,
                        daily_goal_claimed: false,
                    })
                    .select()
                    .single();

                if (newUser) {
                    setState(prev => ({
                        ...prev,
                        hens: newUser.hens,
                        goats: newUser.goats,
                        cows: newUser.cows,
                        todayMinutes: 0,
                        lastDayReset: today,
                        dailyGoalClaimed: false,
                        isLoading: false,
                        lastSyncTime: new Date().toISOString(),
                    }));
                    console.log('🎁 Welcome gift given to new user: 1 Hen, 1 Goat, 1 Cow!');
                    return;
                }
            }

            // Existing user - load their data
            if (existingUser) {
                let needsReset = existingUser.last_day_reset !== today;

                if (needsReset) {
                    await supabase
                        .from('user_progress')
                        .update({
                            today_minutes: 0,
                            last_day_reset: today,
                            daily_goal_claimed: false,
                        })
                        .eq('user_id', uid);

                    setState(prev => ({
                        ...prev,
                        hens: existingUser.hens,
                        goats: existingUser.goats,
                        cows: existingUser.cows,
                        todayMinutes: 0,
                        lastDayReset: today,
                        dailyGoalClaimed: false,
                        isLoading: false,
                        lastSyncTime: new Date().toISOString(),
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        hens: existingUser.hens,
                        goats: existingUser.goats,
                        cows: existingUser.cows,
                        todayMinutes: existingUser.today_minutes,
                        lastDayReset: existingUser.last_day_reset,
                        dailyGoalClaimed: existingUser.daily_goal_claimed,
                        isLoading: false,
                        lastSyncTime: new Date().toISOString(),
                    }));
                }
                return;
            }

            // Fallback - set loading to false
            setState(prev => ({ ...prev, isLoading: false }));
        } catch (error) {
            console.error('Error in loadStateFromSupabase:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const saveToSupabase = async (updates: Partial<{
        hens: number;
        goats: number;
        cows: number;
        today_minutes: number;
        last_day_reset: string;
        daily_goal_claimed: boolean;
    }>) => {
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('user_progress')
                .update(updates)
                .eq('user_id', userId);

            if (error) {
                console.error('Error saving to Supabase:', error);
            }
        } catch (error) {
            console.error('Error saving to Supabase:', error);
        }
    };

    const refreshState = async () => {
        if (userId) {
            await loadStateFromSupabase(userId);
            await loadCategories(userId);
        }
    };

    const addStudyTime = (minutes: number) => {
        const newTodayMinutes = state.todayMinutes + minutes;
        setState(prev => ({
            ...prev,
            todayMinutes: newTodayMinutes,
        }));
        saveToSupabase({ today_minutes: newTodayMinutes });
    };

    const claimDailyReward = () => {
        if (state.todayMinutes >= 360 && !state.dailyGoalClaimed) {
            const newHens = state.hens + 1;
            setState(prev => ({
                ...prev,
                hens: newHens,
                dailyGoalClaimed: true,
            }));
            saveToSupabase({ hens: newHens, daily_goal_claimed: true });
        }
    };

    const convertHensToGoat = async (): Promise<boolean> => {
        if (state.hens >= 6) {
            const newHens = state.hens - 6;
            const newGoats = state.goats + 1;
            setState(prev => ({
                ...prev,
                hens: newHens,
                goats: newGoats,
            }));
            await saveToSupabase({ hens: newHens, goats: newGoats });
            return true;
        }
        return false;
    };

    const convertHensToCow = async (): Promise<boolean> => {
        if (state.hens >= 24) {
            const newHens = state.hens - 24;
            const newCows = state.cows + 1;
            setState(prev => ({
                ...prev,
                hens: newHens,
                cows: newCows,
            }));
            await saveToSupabase({ hens: newHens, cows: newCows });
            return true;
        }
        return false;
    };

    const applyPenalty = (hensToLose: number) => {
        const newHens = Math.max(0, state.hens - hensToLose);
        setState(prev => ({
            ...prev,
            hens: newHens,
        }));
        saveToSupabase({ hens: newHens });
    };

    const getTotalAnimals = () => {
        return state.hens + state.goats + state.cows;
    };

    const saveSession = async (params: {
        durationMinutes: number;
        startedAt: Date;
        leaveCount: number;
        taskName?: string;
        categoryId?: string;
    }) => {
        if (!userId) return;

        try {
            await supabase
                .from('study_sessions')
                .insert({
                    user_id: userId,
                    duration_minutes: params.durationMinutes,
                    started_at: params.startedAt.toISOString(),
                    ended_at: new Date().toISOString(),
                    leave_count: params.leaveCount,
                    task_name: params.taskName || null,
                    category_id: params.categoryId || null,
                });

            setState(prev => ({ ...prev, lastSyncTime: new Date().toISOString() }));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    };

    const getSessions = async (days: number = 30): Promise<StudySession[]> => {
        if (!userId) return [];

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', userId)
                .gte('started_at', startDate.toISOString())
                .order('started_at', { ascending: false });

            if (error) {
                console.error('Error fetching sessions:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getSessions:', error);
            return [];
        }
    };

    const getCategories = async (): Promise<Category[]> => {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching categories:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    };

    const addCategory = async (name: string, color: string, icon: string): Promise<Category | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: userId,
                    name,
                    color,
                    icon,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding category:', error);
                return null;
            }

            setState(prev => ({
                ...prev,
                categories: [...prev.categories, data],
            }));

            return data;
        } catch (error) {
            console.error('Error in addCategory:', error);
            return null;
        }
    };

    const deleteCategory = async (id: string): Promise<void> => {
        if (!userId) return;

        try {
            await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            setState(prev => ({
                ...prev,
                categories: prev.categories.filter(c => c.id !== id),
            }));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const updateGoalTargets = async (daily: number, weekly: number, monthly: number) => {
        setState(prev => ({
            ...prev,
            dailyGoalTarget: daily,
            weeklyGoalTarget: weekly,
            monthlyGoalTarget: monthly,
        }));

        try {
            const saved = await AsyncStorage.getItem('focusSettings');
            const settings = saved ? JSON.parse(saved) : {};
            settings.dailyGoalTarget = daily;
            settings.weeklyGoalTarget = weekly;
            settings.monthlyGoalTarget = monthly;
            await AsyncStorage.setItem('focusSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving goal targets:', error);
        }
    };

    const claimWeeklyReward = async () => {
        if (state.weeklyGoalClaimed) return;

        const now = new Date();
        const year = now.getFullYear();
        const week = Math.floor(now.getDate() / 7);
        const weeklyKey = `weeklyGoalClaimed_${year}_${week}`;

        const newGoats = state.goats + 1;
        setState(prev => ({
            ...prev,
            goats: newGoats,
            weeklyGoalClaimed: true,
        }));

        await AsyncStorage.setItem(weeklyKey, 'true');
        await saveToSupabase({ goats: newGoats });
    };

    const claimMonthlyReward = async () => {
        if (state.monthlyGoalClaimed) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthlyKey = `monthlyGoalClaimed_${year}_${month}`;

        const newCows = state.cows + 1;
        setState(prev => ({
            ...prev,
            cows: newCows,
            monthlyGoalClaimed: true,
        }));

        await AsyncStorage.setItem(monthlyKey, 'true');
        await saveToSupabase({ cows: newCows });
    };

    const setUserName = async (name: string) => {
        setState(prev => ({ ...prev, userName: name }));
        try {
            const saved = await AsyncStorage.getItem('focusSettings');
            const settings = saved ? JSON.parse(saved) : {};
            settings.userName = name;
            await AsyncStorage.setItem('focusSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving user name:', error);
        }
    };

    return (
        <FarmContext.Provider value={{
            state,
            addStudyTime,
            claimDailyReward,
            claimWeeklyReward,
            claimMonthlyReward,
            convertHensToGoat,
            convertHensToCow,
            applyPenalty,
            getTotalAnimals,
            refreshState,
            saveSession,
            getSessions,
            getCategories,
            addCategory,
            deleteCategory,
            updateGoalTargets,
            setUserName,
        }}>
            {children}
        </FarmContext.Provider>
    );
}

export function useFarm() {
    const context = useContext(FarmContext);
    if (!context) {
        throw new Error('useFarm must be used within a FarmProvider');
    }
    return context;
}
