import 'package:flutter/material.dart';

/// Light theme colors matching the original React Native app
class LightThemeColors {
  static const background = Color(0xFFF5F5F0);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSecondary = Color(0xFFF9FBF7);
  static const text = Color(0xFF2D4A22);
  static const textSecondary = Color(0xFF6B8E6B);
  static const textMuted = Color(0xFF9E9E9E);
  static const primary = Color(0xFF4A7C23);
  static const primaryLight = Color(0xFFE8F5E9);
  static const accent = Color(0xFFFFB800);
  static const accentLight = Color(0xFFFFF8E1);
  static const border = Color(0xFFE0E0E0);
  static const divider = Color(0xFFEEEEEE);
  static const card = Color(0xFFFFFFFF);
  static const error = Color(0xFFE53935);
  static const success = Color(0xFF43A047);
  static const warning = Color(0xFFFB8C00);
  static const tabBar = Color(0xFFFFFFFF);
  static const tabBarBorder = Color(0xFFE8E8E8);
}

/// Dark theme colors matching the original React Native app
class DarkThemeColors {
  static const background = Color(0xFF121212);
  static const surface = Color(0xFF1E1E1E);
  static const surfaceSecondary = Color(0xFF2A2A2A);
  static const text = Color(0xFFE0E0E0);
  static const textSecondary = Color(0xFFA0A0A0);
  static const textMuted = Color(0xFF6E6E6E);
  static const primary = Color(0xFF6AAF3D);
  static const primaryLight = Color(0xFF1E3A1A);
  static const accent = Color(0xFFFFB800);
  static const accentLight = Color(0xFF3A3020);
  static const border = Color(0xFF3A3A3A);
  static const divider = Color(0xFF2E2E2E);
  static const card = Color(0xFF1E1E1E);
  static const error = Color(0xFFEF5350);
  static const success = Color(0xFF66BB6A);
  static const warning = Color(0xFFFFA726);
  static const tabBar = Color(0xFF1E1E1E);
  static const tabBarBorder = Color(0xFF2E2E2E);
}

/// App theme colors interface
class AppColors {
  final Color background;
  final Color surface;
  final Color surfaceSecondary;
  final Color text;
  final Color textSecondary;
  final Color textMuted;
  final Color primary;
  final Color primaryLight;
  final Color accent;
  final Color accentLight;
  final Color border;
  final Color divider;
  final Color card;
  final Color error;
  final Color success;
  final Color warning;
  final Color tabBar;
  final Color tabBarBorder;

  const AppColors({
    required this.background,
    required this.surface,
    required this.surfaceSecondary,
    required this.text,
    required this.textSecondary,
    required this.textMuted,
    required this.primary,
    required this.primaryLight,
    required this.accent,
    required this.accentLight,
    required this.border,
    required this.divider,
    required this.card,
    required this.error,
    required this.success,
    required this.warning,
    required this.tabBar,
    required this.tabBarBorder,
  });

  static const light = AppColors(
    background: LightThemeColors.background,
    surface: LightThemeColors.surface,
    surfaceSecondary: LightThemeColors.surfaceSecondary,
    text: LightThemeColors.text,
    textSecondary: LightThemeColors.textSecondary,
    textMuted: LightThemeColors.textMuted,
    primary: LightThemeColors.primary,
    primaryLight: LightThemeColors.primaryLight,
    accent: LightThemeColors.accent,
    accentLight: LightThemeColors.accentLight,
    border: LightThemeColors.border,
    divider: LightThemeColors.divider,
    card: LightThemeColors.card,
    error: LightThemeColors.error,
    success: LightThemeColors.success,
    warning: LightThemeColors.warning,
    tabBar: LightThemeColors.tabBar,
    tabBarBorder: LightThemeColors.tabBarBorder,
  );

  static const dark = AppColors(
    background: DarkThemeColors.background,
    surface: DarkThemeColors.surface,
    surfaceSecondary: DarkThemeColors.surfaceSecondary,
    text: DarkThemeColors.text,
    textSecondary: DarkThemeColors.textSecondary,
    textMuted: DarkThemeColors.textMuted,
    primary: DarkThemeColors.primary,
    primaryLight: DarkThemeColors.primaryLight,
    accent: DarkThemeColors.accent,
    accentLight: DarkThemeColors.accentLight,
    border: DarkThemeColors.border,
    divider: DarkThemeColors.divider,
    card: DarkThemeColors.card,
    error: DarkThemeColors.error,
    success: DarkThemeColors.success,
    warning: DarkThemeColors.warning,
    tabBar: DarkThemeColors.tabBar,
    tabBarBorder: DarkThemeColors.tabBarBorder,
  );
}

/// Create Flutter ThemeData from AppColors
ThemeData createThemeData(AppColors colors, bool isDark) {
  return ThemeData(
    useMaterial3: true,
    brightness: isDark ? Brightness.dark : Brightness.light,
    scaffoldBackgroundColor: colors.background,
    primaryColor: colors.primary,
    colorScheme: ColorScheme(
      brightness: isDark ? Brightness.dark : Brightness.light,
      primary: colors.primary,
      onPrimary: Colors.white,
      secondary: colors.accent,
      onSecondary: Colors.black,
      error: colors.error,
      onError: Colors.white,
      surface: colors.surface,
      onSurface: colors.text,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: colors.surface,
      foregroundColor: colors.text,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      color: colors.card,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: colors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: colors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: colors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: colors.primary, width: 2),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: colors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: colors.primary,
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: colors.tabBar,
      selectedItemColor: colors.primary,
      unselectedItemColor: colors.textMuted,
    ),
    dividerTheme: DividerThemeData(
      color: colors.divider,
    ),
  );
}
