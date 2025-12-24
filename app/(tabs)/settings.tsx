import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Bell, Clock, Shield, Cloud, RefreshCw, Tag, Plus, X, Trash2, Moon, User, Edit2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFarm, Category } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_COLORS = [
    '#4A7C23', '#1976D2', '#9C27B0', '#FF5722', '#00BCD4', '#E91E63', '#FF9800', '#795548'
];

const CATEGORY_ICONS = [
    '📚', '💼', '📖', '🏃', '🧘', '🎨', '💻', '🎵', '🧪', '📝',
    '📐', '🔬', '🌍', '💡', '🎯', '📊', '🏋️', '🎮', '📱', '🖥️',
    '✏️', '🧠', '🎓', '📈', '🔧', '🌱', '⚽', '🎸', '📷', '✨',
];

export default function SettingsScreen() {
    const { state, refreshState, addCategory, deleteCategory } = useFarm();
    const { colors, isDark, setDarkTheme: setGlobalDarkTheme } = useTheme();

    const [pauseOnLeave, setPauseOnLeave] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [vibrateOnLeave, setVibrateOnLeave] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Profile state
    const [userName, setUserName] = useState('Focus Farmer');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editingName, setEditingName] = useState('');

    // Category modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem('focusSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    setPauseOnLeave(settings.pauseOnLeave ?? true);
                    setShowWarning(settings.showWarning ?? true);
                    setVibrateOnLeave(settings.vibrateOnLeave ?? true);
                    setDarkTheme(settings.darkTheme ?? false);
                    setUserName(settings.userName ?? 'Focus Farmer');
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    const saveSettings = async (newSettings: any) => {
        try {
            await AsyncStorage.setItem('focusSettings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const toggleSetting = (setting: string, value: boolean) => {
        const newSettings = {
            pauseOnLeave: setting === 'pauseOnLeave' ? value : pauseOnLeave,
            showWarning: setting === 'showWarning' ? value : showWarning,
            vibrateOnLeave: setting === 'vibrateOnLeave' ? value : vibrateOnLeave,
            darkTheme: setting === 'darkTheme' ? value : darkTheme,
            userName,
        };

        if (setting === 'pauseOnLeave') setPauseOnLeave(value);
        if (setting === 'showWarning') setShowWarning(value);
        if (setting === 'vibrateOnLeave') setVibrateOnLeave(value);
        if (setting === 'darkTheme') {
            setDarkTheme(value);
            setGlobalDarkTheme(value); // Apply theme globally
        }

        saveSettings(newSettings);
    };

    const handleSaveProfile = async () => {
        if (editingName.trim()) {
            setUserName(editingName.trim());
            const saved = await AsyncStorage.getItem('focusSettings');
            const settings = saved ? JSON.parse(saved) : {};
            settings.userName = editingName.trim();
            await AsyncStorage.setItem('focusSettings', JSON.stringify(settings));
        }
        setShowProfileModal(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await refreshState();
        } catch (error) {
            console.error('Sync error:', error);
        }
        setIsSyncing(false);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setIsAddingCategory(true);
        const result = await addCategory(newCategoryName.trim(), selectedColor, selectedIcon);
        setIsAddingCategory(false);

        if (result) {
            setShowCategoryModal(false);
            setNewCategoryName('');
            Alert.alert('Success', `Category "${result.name}" added!`);
        } else {
            Alert.alert('Error', 'Failed to add category. Please try again.');
        }
    };

    const handleDeleteCategory = (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCategory(category.id),
                },
            ]
        );
    };

    const formatLastSync = () => {
        if (!state.lastSyncTime) return 'Never';
        const date = new Date(state.lastSyncTime);
        return date.toLocaleString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Settings size={28} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>

                <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
                    <View style={[styles.profileAvatar, { backgroundColor: colors.primaryLight }]}>
                        <User size={32} color={colors.primary} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>
                        <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>Focus Farmer since 2024</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.primaryLight }]}
                        onPress={() => {
                            setEditingName(userName);
                            setShowProfileModal(true);
                        }}
                    >
                        <Edit2 size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Sync Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cloud Sync</Text>

                <View style={styles.syncCard}>
                    <View style={styles.syncInfo}>
                        <Cloud size={24} color="#1976D2" />
                        <View style={styles.syncText}>
                            <Text style={styles.syncLabel}>Sync with Cloud</Text>
                            <Text style={styles.syncDesc}>Last synced: {formatLastSync()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                        onPress={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <RefreshCw size={18} color="#FFF" />
                                <Text style={styles.syncButtonText}>Sync</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Categories Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Categories</Text>

                <View style={[styles.categoriesCard, { backgroundColor: colors.surface }]}>
                    {state.categories.length === 0 ? (
                        <Text style={[styles.noCategoriesText, { color: colors.textSecondary }]}>No custom categories yet</Text>
                    ) : (
                        state.categories.map((cat) => (
                            <View key={cat.id} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.categoryBadge, { backgroundColor: `${cat.color}20` }]}>
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteCategory(cat)}>
                                    <Trash2 size={18} color="#D32F2F" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    <TouchableOpacity
                        style={[styles.addCategoryButton, { backgroundColor: colors.primaryLight }]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Plus size={18} color={colors.primary} />
                        <Text style={[styles.addCategoryText, { color: colors.primary }]}>Add Category</Text>
                    </TouchableOpacity>
                </View>

                {/* Focus Mode Settings */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus Mode</Text>

                <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Clock size={20} color={colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Pause on Leave</Text>
                                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Pause timer when you leave the app</Text>
                            </View>
                        </View>
                        <Switch
                            value={pauseOnLeave}
                            onValueChange={(value) => toggleSetting('pauseOnLeave', value)}
                            trackColor={{ false: colors.border, true: '#A5D6A7' }}
                            thumbColor={pauseOnLeave ? colors.primary : colors.textMuted}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Bell size={20} color={colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Show Warning</Text>
                                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Display reminder when returning to app</Text>
                            </View>
                        </View>
                        <Switch
                            value={showWarning}
                            onValueChange={(value) => toggleSetting('showWarning', value)}
                            trackColor={{ false: colors.border, true: '#A5D6A7' }}
                            thumbColor={showWarning ? colors.primary : colors.textMuted}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Shield size={20} color={colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Vibrate on Leave</Text>
                                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Vibrate when leaving during focus</Text>
                            </View>
                        </View>
                        <Switch
                            value={vibrateOnLeave}
                            onValueChange={(value) => toggleSetting('vibrateOnLeave', value)}
                            trackColor={{ false: colors.border, true: '#A5D6A7' }}
                            thumbColor={vibrateOnLeave ? colors.primary : colors.textMuted}
                        />
                    </View>
                </View>

                {/* Appearance Settings */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

                <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Moon size={20} color={colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Theme</Text>
                                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Use dark colors throughout the app</Text>
                            </View>
                        </View>
                        <Switch
                            value={darkTheme}
                            onValueChange={(value) => toggleSetting('darkTheme', value)}
                            trackColor={{ false: colors.border, true: '#A5D6A7' }}
                            thumbColor={darkTheme ? colors.primary : colors.textMuted}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Profile Edit Modal */}
            <Modal visible={showProfileModal} transparent animationType="fade">
                <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Your Name</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                            value={editingName}
                            onChangeText={setEditingName}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.textMuted}
                        />

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.primary }]}
                            onPress={handleSaveProfile}
                        >
                            <Text style={styles.modalButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X size={24} color="#6B8E6B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g., Coding"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            maxLength={20}
                        />

                        <Text style={styles.modalLabel}>Icon</Text>
                        <View style={styles.iconGrid}>
                            {CATEGORY_ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[styles.iconOption, selectedIcon === icon && styles.iconSelected]}
                                    onPress={() => setSelectedIcon(icon)}
                                >
                                    <Text style={styles.iconText}>{icon}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>Color</Text>
                        <View style={styles.colorGrid}>
                            {CATEGORY_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.colorSelected,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.modalButton, isAddingCategory && styles.modalButtonDisabled]}
                            onPress={handleAddCategory}
                            disabled={isAddingCategory}
                        >
                            {isAddingCategory ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.modalButtonText}>Add Category</Text>
                            )}
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
        backgroundColor: '#F9FBF9',
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#556B2F',
        marginTop: 24,
    },
    syncCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
    },
    syncInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    syncText: {
        flex: 1,
    },
    syncLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1565C0',
    },
    syncDesc: {
        fontSize: 12,
        color: '#1976D2',
        marginTop: 2,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1976D2',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    syncButtonDisabled: {
        backgroundColor: '#90CAF9',
    },
    syncButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    categoriesCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    noCategoriesText: {
        fontSize: 14,
        color: '#9CA89C',
        textAlign: 'center',
        paddingVertical: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F5E9',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
    },
    categoryIcon: {
        fontSize: 18,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
    },
    addCategoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        marginTop: 8,
    },
    addCategoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A7C23',
    },
    settingCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 4,
        marginTop: 12,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D4A22',
    },
    settingDesc: {
        fontSize: 12,
        color: '#6B8E6B',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#E8F5E9',
        marginHorizontal: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2D4A22',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#556B2F',
        marginTop: 16,
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#2D4A22',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconOption: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSelected: {
        backgroundColor: '#E8F5E9',
        borderWidth: 2,
        borderColor: '#4A7C23',
    },
    iconText: {
        fontSize: 22,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: '#2D4A22',
    },
    modalButton: {
        backgroundColor: '#4A7C23',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'center',
    },
    modalButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    // Profile styles
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        gap: 14,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
    },
    profileSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
});
