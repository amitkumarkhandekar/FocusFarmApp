import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase_service.dart';

/// Auth state
enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.loading,
    this.user,
    this.error,
  });

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }
}

/// Auth state notifier
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _initialize();
  }

  void _initialize() {
    // Check current auth state
    final user = SupabaseService.currentUser;
    if (user != null) {
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }

    // Listen for auth changes
    SupabaseService.authStateChanges.listen((authState) {
      if (authState.session?.user != null) {
        state = AuthState(
          status: AuthStatus.authenticated,
          user: authState.session!.user,
        );
      } else {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    });
  }

  /// Sign in with email and password
  Future<bool> signIn(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);

    try {
      final response = await SupabaseService.signInWithEmail(email, password);
      if (response.user != null) {
        state = AuthState(
          status: AuthStatus.authenticated,
          user: response.user,
        );
        return true;
      }
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Sign in failed',
      );
      return false;
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Sign up with email and password
  Future<(bool, bool)> signUp(
    String email,
    String password, {
    String? username,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);

    try {
      final response = await SupabaseService.signUpWithEmail(
        email,
        password,
        username: username,
      );

      if (response.user != null) {
        // Check if session exists (user is auto-logged in)
        final hasSession = response.session != null;
        if (hasSession) {
          state = AuthState(
            status: AuthStatus.authenticated,
            user: response.user,
          );
        } else {
          state = const AuthState(status: AuthStatus.unauthenticated);
        }
        return (true, hasSession);
      }
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Sign up failed',
      );
      return (false, false);
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.message,
      );
      return (false, false);
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
      return (false, false);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await SupabaseService.signOut();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Auth provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
