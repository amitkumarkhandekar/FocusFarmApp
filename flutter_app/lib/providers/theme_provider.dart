import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../app/theme.dart';
import '../core/storage_service.dart';

/// Theme state notifier
class ThemeNotifier extends StateNotifier<bool> {
  ThemeNotifier() : super(false) {
    _loadTheme();
  }

  /// Load theme from storage
  Future<void> _loadTheme() async {
    state = StorageService.isDarkTheme;
  }

  /// Toggle between light and dark theme
  Future<void> toggleTheme() async {
    state = !state;
    await StorageService.setDarkTheme(state);
  }

  /// Set specific theme
  Future<void> setDarkTheme(bool isDark) async {
    state = isDark;
    await StorageService.setDarkTheme(isDark);
  }
}

/// Theme state provider
final themeProvider = StateNotifierProvider<ThemeNotifier, bool>((ref) {
  return ThemeNotifier();
});

/// App colors based on current theme
final appColorsProvider = Provider<AppColors>((ref) {
  final isDark = ref.watch(themeProvider);
  return isDark ? AppColors.dark : AppColors.light;
});
