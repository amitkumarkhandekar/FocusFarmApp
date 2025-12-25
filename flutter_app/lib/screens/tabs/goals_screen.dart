import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/theme_provider.dart';
import '../../providers/farm_provider.dart';

/// Goals screen - matches (tabs)/goals.tsx
class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = ref.watch(appColorsProvider);
    final farmState = ref.watch(farmProvider);

    if (farmState.isLoading) {
      return Scaffold(
        backgroundColor: colors.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: colors.primary),
              const SizedBox(height: 16),
              Text(
                'Loading your progress...',
                style: TextStyle(color: colors.textSecondary, fontSize: 16),
              ),
            ],
          ),
        ),
      );
    }

    final todayHours = farmState.todayHours;
    const dailyTarget = 6.0;
    final dailyProgress = (todayHours / dailyTarget * 100).clamp(0.0, 100.0);
    final canClaimDaily = todayHours >= dailyTarget && !farmState.dailyGoalClaimed;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  Icon(LucideIcons.target, size: 28, color: colors.primary),
                  const SizedBox(width: 12),
                  Text(
                    'Goals',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: colors.text,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: colors.primaryLight,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        children: [
                          Text(
                            "Today's Focus",
                            style: TextStyle(
                              fontSize: 14,
                              color: colors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatHours(todayHours),
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.w800,
                              color: colors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Daily Goal Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            offset: const Offset(0, 2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Text('🌅', style: TextStyle(fontSize: 32)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Daily Goal',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: colors.text,
                                      ),
                                    ),
                                    Text(
                                      'Focus for 6 hours today',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: colors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (farmState.dailyGoalClaimed)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: colors.primaryLight,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(LucideIcons.checkCircle, size: 16, color: colors.primary),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Claimed',
                                        style: TextStyle(
                                          color: colors.primary,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              else if (canClaimDaily)
                                ElevatedButton.icon(
                                  onPressed: () => _claimDailyReward(context, ref),
                                  icon: const Icon(LucideIcons.gift, size: 16),
                                  label: const Text('Claim'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: colors.primary,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Progress Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(5),
                            child: LinearProgressIndicator(
                              value: dailyProgress / 100,
                              backgroundColor: colors.border,
                              valueColor: AlwaysStoppedAnimation(colors.primary),
                              minHeight: 10,
                            ),
                          ),
                          const SizedBox(height: 12),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${_formatHours(todayHours)}${todayHours >= dailyTarget ? ' 🎉' : ' / 6 hrs'}',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: colors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: colors.accentLight,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    const Text('🐔', style: TextStyle(fontSize: 18)),
                                    const SizedBox(width: 6),
                                    Text(
                                      '+1 Hen',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: colors.accent,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Animal Converter Section
                    Text(
                      '🔄 Animal Converter',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: colors.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Combine hens to upgrade your farm animals!',
                      style: TextStyle(
                        fontSize: 13,
                        color: colors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Current Animals
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.accentLight,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _AnimalCount(emoji: '🐔', count: farmState.hens, label: 'Hens', colors: colors),
                          _AnimalCount(emoji: '🐐', count: farmState.goats, label: 'Goats', colors: colors),
                          _AnimalCount(emoji: '🐄', count: farmState.cows, label: 'Cows', colors: colors),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Converter Buttons
                    _ConverterCard(
                      fromEmoji: '🐔',
                      fromCount: 6,
                      toEmoji: '🐐',
                      toCount: 1,
                      enabled: farmState.canConvertToGoat,
                      onConvert: () => _convertToGoat(context, ref),
                      colors: colors,
                    ),
                    const SizedBox(height: 12),
                    _ConverterCard(
                      fromEmoji: '🐔',
                      fromCount: 24,
                      toEmoji: '🐄',
                      toCount: 1,
                      enabled: farmState.canConvertToCow,
                      onConvert: () => _convertToCow(context, ref),
                      colors: colors,
                    ),
                    const SizedBox(height: 24),

                    // Info Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.accentLight,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(LucideIcons.trophy, size: 24, color: const Color(0xFFFFB800)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'How it works',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: colors.text,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Complete 6 hours of focus daily to earn Hens. Combine 6 Hens for a Goat, or 24 Hens for a Cow! Goals reset at midnight.',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: colors.textSecondary,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatHours(double hours) {
    if (hours < 1) {
      return '${(hours * 60).round()} min';
    }
    return '${hours.toStringAsFixed(1)} hrs';
  }

  void _claimDailyReward(BuildContext context, WidgetRef ref) {
    ref.read(farmProvider.notifier).claimDailyReward();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("🎉 New Hen Unlocked! Check your farm."),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _convertToGoat(BuildContext context, WidgetRef ref) async {
    final success = await ref.read(farmProvider.notifier).convertHensToGoat();
    if (success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("🐐 Goat Unlocked! You now have a new Goat on your farm!"),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _convertToCow(BuildContext context, WidgetRef ref) async {
    final success = await ref.read(farmProvider.notifier).convertHensToCow();
    if (success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("🐄 Cow Unlocked! You now have a new Cow on your farm!"),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}

class _AnimalCount extends StatelessWidget {
  final String emoji;
  final int count;
  final String label;
  final dynamic colors;

  const _AnimalCount({
    required this.emoji,
    required this.count,
    required this.label,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 32)),
        const SizedBox(height: 4),
        Text(
          '$count',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: colors.text,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _ConverterCard extends StatelessWidget {
  final String fromEmoji;
  final int fromCount;
  final String toEmoji;
  final int toCount;
  final bool enabled;
  final VoidCallback onConvert;
  final dynamic colors;

  const _ConverterCard({
    required this.fromEmoji,
    required this.fromCount,
    required this.toEmoji,
    required this.toCount,
    required this.enabled,
    required this.onConvert,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              offset: const Offset(0, 2),
              blurRadius: 8,
            ),
          ],
        ),
        child: Row(
          children: [
            Column(
              children: [
                Text(fromEmoji, style: const TextStyle(fontSize: 28)),
                Text(
                  '×$fromCount',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: colors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Icon(
              LucideIcons.arrowRight,
              size: 20,
              color: enabled ? colors.primary : colors.textMuted,
            ),
            const SizedBox(width: 12),
            Column(
              children: [
                Text(toEmoji, style: const TextStyle(fontSize: 28)),
                Text(
                  '×$toCount',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: colors.textSecondary,
                  ),
                ),
              ],
            ),
            const Spacer(),
            ElevatedButton.icon(
              onPressed: enabled ? onConvert : null,
              icon: const Icon(LucideIcons.repeat, size: 16),
              label: const Text('Convert'),
              style: ElevatedButton.styleFrom(
                backgroundColor: enabled ? colors.primary : colors.textMuted,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
