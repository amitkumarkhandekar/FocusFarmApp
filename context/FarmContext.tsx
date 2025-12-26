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
    createdAt: string;
    pauseOnLeave: boolean;
    showWarning: boolean;
    vibrateOnLeave: boolean;
    darkTheme: boolean;
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
    updateSettings: (settings: Partial<Pick<FarmState, 'pauseOnLeave' | 'showWarning' | 'vibrateOnLeave' | 'darkTheme'>>) => Promise<void>;
    logout: () => Promise<void>;
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
    createdAt: new Date().toISOString(),
    pauseOnLeave: true,
    showWarning: true,
    vibrateOnLeave: true,
    darkTheme: false,
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FarmState>(defaultState);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                // Handle refresh token errors
                if (error) {
                    console.log('Auth error during initialization:', error.message);
                    // If refresh token is invalid, sign out and clear session
                    if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
                        console.log('Invalid refresh token, clearing session...');
                        await supabase.auth.signOut();
                        await AsyncStorage.removeItem('focusSettings');
                    }
                    setState(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                if (user) {
                    setUserId(user.id);
                    await loadStateFromSupabase(user.id);
                    await loadCategories(user.id);
                    await loadGoalTargets();
                    await loadClaimStatuses();
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err: any) {
                console.error('Error initializing user:', err);
                // Handle any auth errors by clearing session
                if (err?.message?.includes('Refresh Token') || err?.message?.includes('refresh_token')) {
                    console.log('Clearing invalid session...');
                    await supabase.auth.signOut().catch(() => { });
                    await AsyncStorage.removeItem('focusSettings').catch(() => { });
                }
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Handle token refresh errors
            if (event === 'TOKEN_REFRESHED' && !session) {
                console.log('Token refresh failed, signing out...');
                setUserId(null);
                setState({ ...defaultState, isLoading: false });
                return;
            }

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
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email;
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
                        userName: newUser.user_name || (userEmail ? userEmail.split('@')[0].substring(0, 9) : 'Farmer'),
                        createdAt: newUser.created_at || prev.createdAt,
                        pauseOnLeave: newUser.pause_on_leave ?? prev.pauseOnLeave,
                        showWarning: newUser.show_warning ?? prev.showWarning,
                        vibrateOnLeave: newUser.vibrate_on_leave ?? prev.vibrateOnLeave,
                        darkTheme: newUser.dark_theme ?? prev.darkTheme,
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
                        userName: existingUser.user_name || prev.userName,
                        createdAt: existingUser.created_at || prev.createdAt,
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
                        userName: existingUser.user_name || (userEmail ? userEmail.split('@')[0].substring(0, 9) : 'Farmer'),
                        createdAt: existingUser.created_at || prev.createdAt,
                        pauseOnLeave: existingUser.pause_on_leave ?? prev.pauseOnLeave,
                        showWarning: existingUser.show_warning ?? prev.showWarning,
                        vibrateOnLeave: existingUser.vibrate_on_leave ?? prev.vibrateOnLeave,
                        darkTheme: existingUser.dark_theme ?? prev.darkTheme,
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
        user_name: string;
        pause_on_leave: boolean;
        show_warning: boolean;
        vibrate_on_leave: boolean;
        dark_theme: boolean;
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
        const targetMinutes = state.dailyGoalTarget * 60;
        if (state.todayMinutes >= targetMinutes && !state.dailyGoalClaimed) {
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

            // Sync to Supabase
            await saveToSupabase({ user_name: name });
        } catch (error) {
            console.error('Error saving user name:', error);
        }
    };

    const updateSettings = async (updates: Partial<Pick<FarmState, 'pauseOnLeave' | 'showWarning' | 'vibrateOnLeave' | 'darkTheme'>>) => {
        setState(prev => ({ ...prev, ...updates }));

        const dbUpdates: any = {};
        if (updates.pauseOnLeave !== undefined) dbUpdates.pause_on_leave = updates.pauseOnLeave;
        if (updates.showWarning !== undefined) dbUpdates.show_warning = updates.showWarning;
        if (updates.vibrateOnLeave !== undefined) dbUpdates.vibrate_on_leave = updates.vibrateOnLeave;
        if (updates.darkTheme !== undefined) dbUpdates.dark_theme = updates.darkTheme;

        await saveToSupabase(dbUpdates);
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            // Clear AsyncStorage keys that shouldn't persist
            const keysToClear = ['focusSettings'];
            await AsyncStorage.multiRemove(keysToClear);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUserId(null);
            setState({ ...defaultState, isLoading: false });
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
            updateSettings,
            logout,
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
