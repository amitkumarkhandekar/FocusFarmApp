import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/landing_screen.dart';
import '../screens/login_screen.dart';
import '../screens/signup_screen.dart';
import '../screens/focus_start_screen.dart';
import '../screens/focus_screen.dart';
import '../screens/main_shell.dart';
import '../screens/tabs/farm_screen.dart';
import '../screens/tabs/goals_screen.dart';
import '../screens/tabs/analytics_screen.dart';
import '../screens/tabs/inventory_screen.dart';
import '../screens/tabs/settings_screen.dart';

/// Navigation keys
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final isOnAuthPage = state.matchedLocation == '/' ||
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup';

      // Still loading, don't redirect
      if (isLoading) return null;

      // Not authenticated and not on auth page, go to landing
      if (!isAuth && !isOnAuthPage) return '/';

      // Authenticated and on auth page, go to farm
      if (isAuth && isOnAuthPage) return '/farm';

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),

      // Focus routes
      GoRoute(
        path: '/focus-start',
        builder: (context, state) => const FocusStartScreen(),
      ),
      GoRoute(
        path: '/focus',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return FocusScreen(
            taskName: extra?['taskName'] as String?,
            categoryId: extra?['categoryId'] as String?,
            categoryName: extra?['categoryName'] as String?,
          );
        },
      ),

      // Main app shell with tabs
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/farm',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: FarmScreen(),
            ),
          ),
          GoRoute(
            path: '/goals',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GoalsScreen(),
            ),
          ),
          GoRoute(
            path: '/analytics',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: AnalyticsScreen(),
            ),
          ),
          GoRoute(
            path: '/inventory',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: InventoryScreen(),
            ),
          ),
          GoRoute(
            path: '/settings',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SettingsScreen(),
            ),
          ),
        ],
      ),
    ],
  );
});
