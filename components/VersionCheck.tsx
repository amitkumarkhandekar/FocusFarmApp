import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

// Get current app version from app.json
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// App store URLs (update these with your actual store URLs)
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.amitkumarkhandekar.focusfarm';
const APP_STORE_URL = 'https://apps.apple.com/app/focusfarm/id123456789'; // Update with actual ID

interface VersionCheckProps {
    children: React.ReactNode;
}

export default function VersionCheck({ children }: VersionCheckProps) {
    const { colors } = useTheme();
    const [isDeprecated, setIsDeprecated] = useState(false);
    const [deprecationMessage, setDeprecationMessage] = useState('');

    useEffect(() => {
        checkVersion();
    }, []);

    const checkVersion = async () => {
        try {
            console.log('🔍 Checking app version:', APP_VERSION);

            const { data, error } = await supabase
                .from('app_versions')
                .select('version_name, is_deprecated, message')
                .eq('version_name', APP_VERSION)
                .single();

            if (error) {
                console.log('⚠️ Version check error (likely new version):', error.message);
                return;
            }

            if (data && data.is_deprecated) {
                console.log('🚫 Version is DEPRECATED:', data);
                setIsDeprecated(true);
                setDeprecationMessage(data.message || 'Please update to the latest version to continue using FocusFarm.');
            }
        } catch (err) {
            console.error('❌ Version check error:', err);
        }
    };

    const openStore = () => {
        const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
        Linking.openURL(url).catch(() => {
            if (Platform.OS === 'android') {
                Linking.openURL('market://details?id=com.amitkumarkhandekar.focusfarm').catch(() => { });
            }
        });
    };

    return (
        <View style={styles.container}>
            {children}

            <Modal
                visible={isDeprecated}
                transparent={true}
                animationType="fade"
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        {/* Update Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                            <Text style={styles.iconEmoji}>🔄</Text>
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, { color: colors.text }]}>
                            Update Required
                        </Text>

                        {/* Version Info */}
                        <Text style={[styles.versionText, { color: colors.textMuted }]}>
                            Current Version: {APP_VERSION}
                        </Text>

                        {/* Message */}
                        <Text style={[styles.message, { color: colors.textSecondary }]}>
                            {deprecationMessage}
                        </Text>

                        {/* Update Button */}
                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: colors.primary }]}
                            onPress={openStore}
                        >
                            <Text style={styles.updateButtonText}>
                                Update Now
                            </Text>
                        </TouchableOpacity>

                        {/* Note */}
                        <Text style={[styles.note, { color: colors.textMuted }]}>
                            🐔 Your farm progress is safe and will be available after updating!
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    versionText: {
        fontSize: 12,
        marginBottom: 16,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    updateButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 16,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
