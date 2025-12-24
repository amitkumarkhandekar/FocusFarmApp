import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.heroSection}>
                <View style={styles.logoContainer}>
                    <Feather name="cloud" size={40} color="#6B8E23" />
                    <Text style={styles.logoText}>FocusFarm</Text>
                </View>

                <View style={styles.visualContainer}>
                    {/* Placeholder for Animal Illustration */}
                    <View style={styles.illustration}>
                        <Text style={styles.emoji}>🐄</Text>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Grow your farm by growing your focus.</Text>
                    <Text style={styles.subtitle}>
                        Transform study sessions into a playful journey. Collect animals, unlock rewards, and build your dream farm.
                    </Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/signup')}
                >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <Feather name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.secondaryButtonText}>Already have a farm? Log in</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    heroSection: {
        flex: 1,
        marginTop: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2D4A22',
        marginLeft: 12,
    },
    visualContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
    },
    illustration: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: (width * 0.6) / 2,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    emoji: {
        fontSize: 80,
    },
    textContainer: {
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2D4A22',
        lineHeight: 40,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#556B2F',
        lineHeight: 24,
        opacity: 0.8,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#6B8E23', // Olive Drab / Grass Green
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        marginBottom: 16,
        // Shadow
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 8,
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: '#2D4A22',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
