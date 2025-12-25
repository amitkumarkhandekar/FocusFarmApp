import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/theme_provider.dart';
import '../../providers/farm_provider.dart';
import '../../widgets/farm_scene/farm_view.dart';

/// Farm screen - matches (tabs)/farm.tsx
class FarmScreen extends ConsumerStatefulWidget {
  const FarmScreen({super.key});

  @override
  ConsumerState<FarmScreen> createState() => _FarmScreenState();
}

class _FarmScreenState extends ConsumerState<FarmScreen> {
  bool _isNight = false;
  bool _showConvertReminder = true;
  double _zoomLevel = 1.0;

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final isDark = ref.watch(themeProvider);
    final farmState = ref.watch(farmProvider);

    final todayHours = (farmState.todayMinutes / 60).toStringAsFixed(1);

    return Scaffold(
      backgroundColor: _isNight ? const Color(0xFF0F0F2A) : const Color(0xFF87CEEB),
      body: Stack(
        children: [
          // Farm View (3D on web, 2D on mobile)
          Positioned.fill(
            child: FarmView(
              hens: farmState.hens,
              goats: farmState.goats,
              cows: farmState.cows,
              isNight: _isNight,
              zoomLevel: _zoomLevel,
            ),
          ),

          // UI Overlay
          SafeArea(
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.black.withValues(alpha: 0.9)
                          : Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          offset: const Offset(0, 2),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Your Farm',
                              style: TextStyle(
                                fontSize: 12,
                                color: colors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              '🏡 Farm',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: colors.text,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            _StatBadge(
                              emoji: '🐾',
                              value: '${farmState.totalAnimals}',
                              colors: colors,
                              isDark: isDark,
                            ),
                            const SizedBox(width: 8),
                            _StatBadge(
                              icon: LucideIcons.sparkles,
                              value: '${todayHours}h',
                              colors: colors,
                              isDark: isDark,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Hen Conversion Reminder
                if (farmState.hens >= 10 && _showConvertReminder)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? colors.surfaceSecondary
                            : const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            offset: const Offset(0, 2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => context.go('/goals'),
                              child: Row(
                                children: [
                                  const Text('🐔→🐐', style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Convert your hens!',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: isDark
                                                ? colors.accent
                                                : const Color(0xFFE65100),
                                          ),
                                        ),
                                        Text(
                                          'You have ${farmState.hens} hens. Tap to convert!',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: isDark
                                                ? colors.textSecondary
                                                : const Color(0xFF8B6B00),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _showConvertReminder = false),
                            child: Padding(
                              padding: const EdgeInsets.all(6),
                              child: Icon(
                                LucideIcons.x,
                                size: 18,
                                color: isDark
                                    ? colors.textSecondary
                                    : const Color(0xFF8B6B00),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                const Spacer(),

                // Start Focus FAB
                Padding(
                  padding: const EdgeInsets.only(bottom: 100),
                  child: GestureDetector(
                    onTap: () => context.push('/focus-start'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                      decoration: BoxDecoration(
                        color: colors.primary,
                        borderRadius: BorderRadius.circular(50),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2D4A22).withValues(alpha: 0.4),
                            offset: const Offset(0, 8),
                            blurRadius: 16,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.play, size: 28, color: Colors.white),
                          const SizedBox(width: 10),
                          const Text(
                            'Start Focus',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Controls (Right side) - moved to Stack
          Positioned(
            right: 16,
            top: 140,
            child: SafeArea(
              child: Column(
                children: [
                  // Day/Night Toggle
                  GestureDetector(
                    onTap: () => setState(() => _isNight = !_isNight),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _isNight
                            ? const Color(0xFF1a1a2e)
                            : (isDark ? colors.surface : Colors.white.withValues(alpha: 0.95)),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            offset: const Offset(0, 2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _isNight ? LucideIcons.moon : LucideIcons.sun,
                            size: 20,
                            color: const Color(0xFFFFD700),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isNight ? 'Night' : 'Day',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: _isNight
                                  ? const Color(0xFFFFD700)
                                  : colors.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Zoom Controls
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: isDark
                          ? colors.surface
                          : Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          offset: const Offset(0, 2),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _ZoomButton(
                          icon: LucideIcons.zoomIn,
                          onTap: () => setState(() => _zoomLevel = (_zoomLevel + 0.2).clamp(0.5, 2.0)),
                          colors: colors,
                        ),
                        const SizedBox(height: 6),
                        _ZoomButton(
                          icon: LucideIcons.zoomOut,
                          onTap: () => setState(() => _zoomLevel = (_zoomLevel - 0.2).clamp(0.5, 2.0)),
                          colors: colors,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String? emoji;
  final IconData? icon;
  final String value;
  final dynamic colors;
  final bool isDark;

  const _StatBadge({
    this.emoji,
    this.icon,
    required this.value,
    required this.colors,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? colors.surfaceSecondary : const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          if (emoji != null) Text(emoji!, style: const TextStyle(fontSize: 14)),
          if (icon != null) Icon(icon!, size: 14, color: const Color(0xFFFFB800)),
          const SizedBox(width: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: isDark ? colors.text : const Color(0xFF8B6B00),
            ),
          ),
        ],
      ),
    );
  }
}

class _ZoomButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final dynamic colors;

  const _ZoomButton({
    required this.icon,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: colors.primaryLight,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(icon, size: 22, color: colors.primary),
      ),
    );
  }
}
