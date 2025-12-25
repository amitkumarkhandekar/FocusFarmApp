import 'category.dart';

/// Farm state model matching the React Native FarmState
class FarmState {
  final int hens;
  final int goats;
  final int cows;
  final int todayMinutes;
  final String lastDayReset;
  final bool dailyGoalClaimed;
  final bool isLoading;
  final String? lastSyncTime;
  final List<Category> categories;

  const FarmState({
    this.hens = 0,
    this.goats = 0,
    this.cows = 0,
    this.todayMinutes = 0,
    required this.lastDayReset,
    this.dailyGoalClaimed = false,
    this.isLoading = true,
    this.lastSyncTime,
    this.categories = const [],
  });

  /// Default initial state
  factory FarmState.initial() {
    return FarmState(
      lastDayReset: DateTime.now().toString().split(' ')[0],
    );
  }

  /// Get total animal count
  int get totalAnimals => hens + goats + cows;

  /// Get today's hours
  double get todayHours => todayMinutes / 60;

  /// Check if daily goal is complete (6 hours)
  bool get isDailyGoalComplete => todayMinutes >= 360;

  /// Can claim daily reward
  bool get canClaimDailyReward => isDailyGoalComplete && !dailyGoalClaimed;

  /// Can convert hens to goat
  bool get canConvertToGoat => hens >= 6;

  /// Can convert hens to cow
  bool get canConvertToCow => hens >= 24;

  /// Create a copy with updated fields
  FarmState copyWith({
    int? hens,
    int? goats,
    int? cows,
    int? todayMinutes,
    String? lastDayReset,
    bool? dailyGoalClaimed,
    bool? isLoading,
    String? lastSyncTime,
    List<Category>? categories,
  }) {
    return FarmState(
      hens: hens ?? this.hens,
      goats: goats ?? this.goats,
      cows: cows ?? this.cows,
      todayMinutes: todayMinutes ?? this.todayMinutes,
      lastDayReset: lastDayReset ?? this.lastDayReset,
      dailyGoalClaimed: dailyGoalClaimed ?? this.dailyGoalClaimed,
      isLoading: isLoading ?? this.isLoading,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
      categories: categories ?? this.categories,
    );
  }

  factory FarmState.fromJson(Map<String, dynamic> json) {
    return FarmState(
      hens: json['hens'] as int? ?? 0,
      goats: json['goats'] as int? ?? 0,
      cows: json['cows'] as int? ?? 0,
      todayMinutes: json['today_minutes'] as int? ?? 0,
      lastDayReset: json['last_day_reset'] as String? ?? DateTime.now().toString().split(' ')[0],
      dailyGoalClaimed: json['daily_goal_claimed'] as bool? ?? false,
      isLoading: false,
      lastSyncTime: DateTime.now().toIso8601String(),
      categories: [],
    );
  }
}
