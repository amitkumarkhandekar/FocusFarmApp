import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

/// Storage service for local persistence using SharedPreferences
class StorageService {
  static SharedPreferences? _prefs;

  /// Initialize SharedPreferences
  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Get SharedPreferences instance
  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw Exception('StorageService not initialized. Call initialize() first.');
    }
    return _prefs!;
  }

  // Focus Settings Keys
  static const String _focusSettingsKey = 'focusSettings';

  /// Get focus settings
  static Map<String, dynamic> getFocusSettings() {
    final String? saved = prefs.getString(_focusSettingsKey);
    if (saved != null) {
      return json.decode(saved) as Map<String, dynamic>;
    }
    return {};
  }

  /// Save focus settings
  static Future<void> saveFocusSettings(Map<String, dynamic> settings) async {
    await prefs.setString(_focusSettingsKey, json.encode(settings));
  }

  /// Get specific setting with default value
  static T getSetting<T>(String key, T defaultValue) {
    final settings = getFocusSettings();
    return settings[key] as T? ?? defaultValue;
  }

  /// Set specific setting
  static Future<void> setSetting(String key, dynamic value) async {
    final settings = getFocusSettings();
    settings[key] = value;
    await saveFocusSettings(settings);
  }

  // Theme Settings
  static bool get isDarkTheme => getSetting<bool>('darkTheme', false);
  static Future<void> setDarkTheme(bool value) => setSetting('darkTheme', value);

  // Focus Mode Settings
  static bool get pauseOnLeave => getSetting<bool>('pauseOnLeave', true);
  static Future<void> setPauseOnLeave(bool value) => setSetting('pauseOnLeave', value);

  static bool get showWarning => getSetting<bool>('showWarning', true);
  static Future<void> setShowWarning(bool value) => setSetting('showWarning', value);

  static bool get vibrateOnLeave => getSetting<bool>('vibrateOnLeave', true);
  static Future<void> setVibrateOnLeave(bool value) => setSetting('vibrateOnLeave', value);

  // User Profile
  static String get userName => getSetting<String>('userName', 'Focus Farmer');
  static Future<void> setUserName(String value) => setSetting('userName', value);
}
