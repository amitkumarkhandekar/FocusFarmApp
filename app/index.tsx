import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Cloud, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Redirect } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();
    const { state } = useFarm();

    // If session is already loaded and user is logged in, redirect immediately
    // state.isLoading is true until supabase.auth.getUser() completes in FarmContext
    if (!state.isLoading && state.userName !== 'Focus Farmer') {
        return <Redirect href="/(tabs)/farm" />;
    }

    // While loading auth state, show a clean background or custom splash
    if (state.isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ width: 100, height: 100, marginBottom: 16 }}
                    resizeMode="contain"
                />
                <Text style={[styles.logoText, { fontSize: 32, marginLeft: 0 }]}>FocusFarm</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/Logo.png')}
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>FocusFarm</Text>
                    </View>

                    <View style={styles.visualContainer}>
                        <Image
                            source={require('../assets/Logo.png')}
                            style={styles.heroLogo}
                            resizeMode="contain"
                        />
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
                        <ArrowRight size={20} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.secondaryButtonText}>Already have a farm? Log in</Text>
                    </TouchableOpacity>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    heroSection: {
        flex: 1,
        paddingTop: 40,
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
        marginVertical: 20,
    },
    heroLogo: {
        width: width * 0.55,
        height: width * 0.55,
        // Subtle drop shadow for the logo
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
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
