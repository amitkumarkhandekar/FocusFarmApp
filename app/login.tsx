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
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
            router.replace('/(tabs)/farm'); // Future home screen
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#2D4A22" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Enter your details to visit your farm</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#556B2F" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            autoCapitalize="none"
                            onChangeText={setEmail}
                            placeholderTextColor="#8B958B"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#556B2F" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            secureTextEntry
                            autoCapitalize="none"
                            onChangeText={setPassword}
                            placeholderTextColor="#8B958B"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={signInWithEmail}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to FocusFarm? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.linkText}>Create a Farm</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FBF9',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
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
        marginBottom: 48,
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
        marginBottom: 32,
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
