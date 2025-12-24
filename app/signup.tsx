import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        if (!username || !email || !password) {
            Alert.alert('Missing Fields', 'Please fill in all fields to create your farm.');
            return;
        }

        setLoading(true);
        const {
            data: { session },
            error
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (error) {
            Alert.alert('Registration Failed', error.message);
        } else {
            if (!session) {
                Alert.alert('Farmer Registered!', 'Please check your email for verification before signing in.');
                router.replace('/login');
            } else {
                router.replace('/(tabs)/farm');
            }
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Feather name="chevron-left" size={24} color="#2D4A22" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Start Your Farm</Text>
                        <Text style={styles.subtitle}>Create an account to track your study progress</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={20} color="#556B2F" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Farmer Name (Username)"
                                value={username}
                                onChangeText={setUsername}
                                placeholderTextColor="#8B958B"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={20} color="#556B2F" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                value={email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholderTextColor="#8B958B"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color="#556B2F" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Secure Password"
                                value={password}
                                secureTextEntry
                                autoCapitalize="none"
                                onChangeText={setPassword}
                                placeholderTextColor="#8B958B"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={signUpWithEmail}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create My Farm</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have a farm? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.linkText}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    flex: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backButton: {
        marginTop: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2D4A22',
    },
    subtitle: {
        fontSize: 16,
        color: '#556B2F',
        marginTop: 8,
        opacity: 0.8,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0EAE0',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D4A22',
    },
    primaryButton: {
        backgroundColor: '#6B8E23',
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: '#2D4A22',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#556B2F',
        fontSize: 15,
    },
    linkText: {
        color: '#6B8E23',
        fontSize: 15,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
