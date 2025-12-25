import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase_service.dart';
import '../models/farm_state.dart';
import '../models/category.dart';
import '../models/study_session.dart';

/// Farm state notifier - equivalent to React Native FarmContext
class FarmNotifier extends StateNotifier<FarmState> {
  FarmNotifier() : super(FarmState.initial()) {
    _initialize();
  }

  String? _userId;

  /// Initialize and load user data
  Future<void> _initialize() async {
    final user = SupabaseService.currentUser;
    if (user != null) {
      _userId = user.id;
      await _loadStateFromSupabase(user.id);
      await _loadCategories(user.id);
    } else {
      state = state.copyWith(isLoading: false);
    }

    // Listen for auth changes
    SupabaseService.authStateChanges.listen((authState) async {
      if (authState.session?.user != null) {
        _userId = authState.session!.user.id;
        await _loadStateFromSupabase(_userId!);
        await _loadCategories(_userId!);
      } else {
        _userId = null;
        state = FarmState.initial().copyWith(isLoading: false);
      }
    });
  }

  /// Load categories from Supabase
  Future<void> _loadCategories(String uid) async {
    try {
      final response = await SupabaseService.client
          .from('categories')
          .select()
          .eq('user_id', uid)
          .order('created_at', ascending: true);

      final categories = (response as List)
          .map((json) => Category.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(categories: categories);
    } catch (e) {
      print('Error loading categories: $e');
    }
  }

  /// Load state from Supabase
  Future<void> _loadStateFromSupabase(String uid) async {
    try {
      final today = DateTime.now().toString().split(' ')[0];

      // Check if user exists
      final existingUserResponse = await SupabaseService.client
          .from('user_progress')
          .select()
          .eq('user_id', uid)
          .maybeSingle();

      if (existingUserResponse == null) {
        // Create new user with starter gifts
        final newUserResponse = await SupabaseService.client
            .from('user_progress')
            .insert({
              'user_id': uid,
              'hens': 1, // Starter gift
              'goats': 1, // Starter gift
              'cows': 1, // Starter gift
              'today_minutes': 0,
              'last_day_reset': today,
              'daily_goal_claimed': false,
            })
            .select()
            .single();

        state = FarmState.fromJson(newUserResponse).copyWith(
          isLoading: false,
          hens: 1,
          goats: 1,
          cows: 1,
        );
        print('🎁 Welcome gift given to new user: 1 Hen, 1 Goat, 1 Cow!');
        return;
      }

      // Existing user - check for day reset
      final existingUser = existingUserResponse as Map<String, dynamic>;
      final needsReset = existingUser['last_day_reset'] != today;

      if (needsReset) {
        await SupabaseService.client
            .from('user_progress')
            .update({
              'today_minutes': 0,
              'last_day_reset': today,
              'daily_goal_claimed': false,
            })
            .eq('user_id', uid);

        state = FarmState.fromJson(existingUser).copyWith(
          todayMinutes: 0,
          lastDayReset: today,
          dailyGoalClaimed: false,
          isLoading: false,
        );
      } else {
        state = FarmState.fromJson(existingUser).copyWith(isLoading: false);
      }
    } catch (e) {
      print('Error in loadStateFromSupabase: $e');
      state = state.copyWith(isLoading: false);
    }
  }

  /// Save updates to Supabase
  Future<void> _saveToSupabase(Map<String, dynamic> updates) async {
    if (_userId == null) return;

    try {
      await SupabaseService.client
          .from('user_progress')
          .update(updates)
          .eq('user_id', _userId!);
    } catch (e) {
      print('Error saving to Supabase: $e');
    }
  }

  /// Refresh state from Supabase
  Future<void> refreshState() async {
    if (_userId != null) {
      await _loadStateFromSupabase(_userId!);
      await _loadCategories(_userId!);
    }
  }

  /// Add study time
  void addStudyTime(int minutes) {
    final newTodayMinutes = state.todayMinutes + minutes;
    state = state.copyWith(todayMinutes: newTodayMinutes);
    _saveToSupabase({'today_minutes': newTodayMinutes});
  }

  /// Claim daily reward
  void claimDailyReward() {
    if (state.todayMinutes >= 360 && !state.dailyGoalClaimed) {
      final newHens = state.hens + 1;
      state = state.copyWith(hens: newHens, dailyGoalClaimed: true);
      _saveToSupabase({'hens': newHens, 'daily_goal_claimed': true});
    }
  }

  /// Convert 6 hens to 1 goat
  Future<bool> convertHensToGoat() async {
    if (state.hens >= 6) {
      final newHens = state.hens - 6;
      final newGoats = state.goats + 1;
      state = state.copyWith(hens: newHens, goats: newGoats);
      await _saveToSupabase({'hens': newHens, 'goats': newGoats});
      return true;
    }
    return false;
  }

  /// Convert 24 hens to 1 cow
  Future<bool> convertHensToCow() async {
    if (state.hens >= 24) {
      final newHens = state.hens - 24;
      final newCows = state.cows + 1;
      state = state.copyWith(hens: newHens, cows: newCows);
      await _saveToSupabase({'hens': newHens, 'cows': newCows});
      return true;
    }
    return false;
  }

  /// Apply penalty (lose hens)
  void applyPenalty(int hensToLose) {
    final newHens = (state.hens - hensToLose).clamp(0, state.hens);
    state = state.copyWith(hens: newHens);
    _saveToSupabase({'hens': newHens});
  }

  /// Save focus session
  Future<void> saveSession({
    required int durationMinutes,
    required DateTime startedAt,
    required int leaveCount,
    String? taskName,
    String? categoryId,
  }) async {
    if (_userId == null) return;

    try {
      await SupabaseService.client.from('study_sessions').insert({
        'user_id': _userId,
        'duration_minutes': durationMinutes,
        'started_at': startedAt.toIso8601String(),
        'ended_at': DateTime.now().toIso8601String(),
        'leave_count': leaveCount,
        'task_name': taskName,
        'category_id': categoryId,
      });

      state = state.copyWith(lastSyncTime: DateTime.now().toIso8601String());
    } catch (e) {
      print('Error saving session: $e');
    }
  }

  /// Get sessions for analytics
  Future<List<StudySession>> getSessions({int days = 30}) async {
    if (_userId == null) return [];

    try {
      final startDate = DateTime.now().subtract(Duration(days: days));

      final response = await SupabaseService.client
          .from('study_sessions')
          .select()
          .eq('user_id', _userId!)
          .gte('started_at', startDate.toIso8601String())
          .order('started_at', ascending: false);

      return (response as List)
          .map((json) => StudySession.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error fetching sessions: $e');
      return [];
    }
  }

  /// Add new category
  Future<Category?> addCategory(String name, String color, String icon) async {
    if (_userId == null) return null;

    try {
      final response = await SupabaseService.client
          .from('categories')
          .insert({
            'user_id': _userId,
            'name': name,
            'color': color,
            'icon': icon,
          })
          .select()
          .single();

      final category = Category.fromJson(response as Map<String, dynamic>);
      state = state.copyWith(categories: [...state.categories, category]);
      return category;
    } catch (e) {
      print('Error adding category: $e');
      return null;
    }
  }

  /// Delete category
  Future<void> deleteCategory(String id) async {
    if (_userId == null) return;

    try {
      await SupabaseService.client.from('categories').delete().eq('id', id);

      state = state.copyWith(
        categories: state.categories.where((c) => c.id != id).toList(),
      );
    } catch (e) {
      print('Error deleting category: $e');
    }
  }
}

/// Farm provider
final farmProvider = StateNotifierProvider<FarmNotifier, FarmState>((ref) {
  return FarmNotifier();
});
