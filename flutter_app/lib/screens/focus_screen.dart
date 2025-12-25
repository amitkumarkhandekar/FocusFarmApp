import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../providers/theme_provider.dart';
import '../providers/farm_provider.dart';

const List<String> motivationalQuotes = [
  "Stay focused, your farm is growing! 🌱",
  "Every minute counts towards your goals! 🎯",
  "Your animals are cheering you on! 🐔",
  "Great things take time... keep going! 💪",
  "Focus now, celebrate later! 🎉",
];

/// Focus screen - matches focus.tsx
class FocusScreen extends ConsumerStatefulWidget {
  final String? taskName;
  final String? categoryId;
  final String? categoryName;

  const FocusScreen({
    super.key,
    this.taskName,
    this.categoryId,
    this.categoryName,
  });

  @override
  ConsumerState<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends ConsumerState<FocusScreen>
    with WidgetsBindingObserver {
  bool _isRunning = true;
  int _elapsedSeconds = 0;
  int _leaveCount = 0;
  late DateTime _sessionStartTime;
  late String _quote;
  Timer? _timer;

  bool _showLeaveWarning = false;
  DateTime? _backgroundTime;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _sessionStartTime = DateTime.now();
    _quote = motivationalQuotes[DateTime.now().millisecond % motivationalQuotes.length];
    _startTimer();
    WakelockPlus.enable();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    WakelockPlus.disable();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      // App went to background
      if (_isRunning) {
        _backgroundTime = DateTime.now();
        _leaveCount++;
        HapticFeedback.vibrate();
      }
    } else if (state == AppLifecycleState.resumed) {
      // App came back
      if (_backgroundTime != null && _isRunning) {
        final timeAway = DateTime.now().difference(_backgroundTime!).inSeconds;
        if (timeAway > 5) {
          setState(() {
            _elapsedSeconds += timeAway;
            _showLeaveWarning = true;
          });
        }
        _backgroundTime = null;
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isRunning) {
        setState(() => _elapsedSeconds++);
      }
    });
  }

  String _formatTime(int seconds) {
    final hrs = seconds ~/ 3600;
    final mins = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;

    if (hrs > 0) {
      return '${hrs.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    }
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _togglePause() {
    setState(() => _isRunning = !_isRunning);
  }

  Future<void> _handleStop() async {
    final minutes = _elapsedSeconds ~/ 60;

    if (_elapsedSeconds < 60) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text("Too Short! ⏱️"),
          content: const Text("You need to focus for at least 1 minute to save progress."),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text("Keep Focusing"),
            ),
            TextButton(
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              onPressed: () => Navigator.pop(context, true),
              child: const Text("Exit Anyway"),
            ),
          ],
        ),
      );

      if (confirm == true && mounted) {
        context.go('/farm');
      }
      return;
    }

    final leaveMessage = _leaveCount > 0
        ? '\n\n⚠️ You left the app $_leaveCount time(s).'
        : '\n\n✨ Perfect focus session!';

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Great Work! 🎉"),
        content: Text(
          'You focused for ${_formatTime(_elapsedSeconds)}!$leaveMessage\n\nThis time will be added to your goals.',
        ),
        actions: [
          ElevatedButton(
            onPressed: () async {
              ref.read(farmProvider.notifier).addStudyTime(minutes);
              await ref.read(farmProvider.notifier).saveSession(
                durationMinutes: minutes,
                startedAt: _sessionStartTime,
                leaveCount: _leaveCount,
                taskName: widget.taskName,
                categoryId: widget.categoryId,
              );
              if (mounted) {
                Navigator.pop(context);
                context.go('/farm');
              }
            },
            child: const Text("Save & Exit"),
          ),
        ],
      ),
    );
  }

  Future<void> _handleFinish() async {
    final minutes = _elapsedSeconds ~/ 60;

    ref.read(farmProvider.notifier).addStudyTime(minutes);
    await ref.read(farmProvider.notifier).saveSession(
      durationMinutes: minutes,
      startedAt: _sessionStartTime,
      leaveCount: _leaveCount,
      taskName: widget.taskName,
      categoryId: widget.categoryId,
    );

    if (mounted) {
      final leaveMessage = _leaveCount > 0 ? '\n\n⚠️ You left $_leaveCount time(s).' : '';

      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text("Session Saved! 🌟"),
          content: Text('$minutes minutes added to your goals.$leaveMessage'),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.go('/farm');
              },
              child: const Text("Back to Farm"),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final isDark = ref.watch(themeProvider);
    final size = MediaQuery.of(context).size;
    final circleSize = size.width * 0.65;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: _handleStop,
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: colors.surface,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(LucideIcons.x, size: 24, color: colors.textSecondary),
                        ),
                      ),
                      Text(
                        'Focus Session',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: colors.text,
                        ),
                      ),
                      const SizedBox(width: 44),
                    ],
                  ),
                ),

                // Task Badge
                if (widget.taskName != null)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: colors.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '📝 ${widget.taskName}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: colors.primary,
                          ),
                        ),
                        if (widget.categoryName != null) ...[
                          Text(
                            ' • ${widget.categoryName}',
                            style: TextStyle(
                              fontSize: 14,
                              color: colors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                // Leave Warning
                if (_leaveCount > 0)
                  Container(
                    margin: const EdgeInsets.only(top: 12, left: 24, right: 24),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: _leaveCount >= 3
                          ? const Color(0xFFFFEBEE)
                          : const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.alertTriangle,
                          size: 16,
                          color: _leaveCount >= 3
                              ? const Color(0xFFD32F2F)
                              : const Color(0xFFFF6B00),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Left app ${_leaveCount}x${_leaveCount >= 3 ? ' - Penalty applied!' : ' - Stay focused!'}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _leaveCount >= 3
                                ? const Color(0xFFD32F2F)
                                : const Color(0xFFE65100),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Quote
                Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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
                      Icon(LucideIcons.leaf, size: 20, color: colors.textSecondary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _quote,
                          style: TextStyle(
                            fontSize: 13,
                            color: colors.textSecondary,
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Timer Circle
                Container(
                  width: circleSize,
                  height: circleSize,
                  decoration: BoxDecoration(
                    color: isDark ? colors.primary : const Color(0xFF4A7C23),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _isRunning
                          ? const Color(0xFF4A7C23)
                          : const Color(0xFFFF9800),
                      width: 6,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF2D4A22).withOpacity(0.15),
                        offset: const Offset(0, 10),
                        blurRadius: 30,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _formatTime(_elapsedSeconds),
                        style: const TextStyle(
                          fontSize: 52,
                          fontWeight: FontWeight.w200,
                          color: Color(0xFF2D4A22),
                          letterSpacing: -2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _isRunning ? 'Focusing...' : 'Paused',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: _isRunning
                              ? const Color(0xFF4A7C23)
                              : const Color(0xFFFF9800),
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Tip
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: colors.accentLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '⚠️ Leaving the app will pause timer & count as distraction',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isDark ? colors.accent : const Color(0xFF8B6B00),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Controls
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Pause/Play Button
                    GestureDetector(
                      onTap: _togglePause,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: _isRunning
                              ? const Color(0xFFFF6B00)
                              : colors.primary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2D4A22).withOpacity(0.3),
                              offset: const Offset(0, 6),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: Icon(
                          _isRunning ? LucideIcons.pause : LucideIcons.play,
                          size: 32,
                          color: Colors.white,
                        ),
                      ),
                    ),

                    // Finish Button (appears after 1 minute)
                    if (_elapsedSeconds >= 60) ...[
                      const SizedBox(width: 20),
                      GestureDetector(
                        onTap: _handleFinish,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            color: colors.primary,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF2D4A22).withOpacity(0.2),
                                offset: const Offset(0, 4),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.check, size: 24, color: Colors.white),
                              const SizedBox(width: 8),
                              const Text(
                                'Finish',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 20),

                // Progress Info
                Text(
                  _elapsedSeconds >= 60
                      ? '${_elapsedSeconds ~/ 60} min will be saved'
                      : 'Focus for at least 1 min to save',
                  style: TextStyle(
                    fontSize: 14,
                    color: colors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 30),
              ],
            ),

            // Leave Warning Modal
            if (_showLeaveWarning)
              Container(
                color: colors.background.withOpacity(0.95),
                child: Center(
                  child: Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('😔', style: TextStyle(fontSize: 56)),
                        const SizedBox(height: 16),
                        Text(
                          'You left the app!',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: colors.text,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Your timer was paused. Each time you leave counts as a distraction.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: colors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _LeaveStatBox(
                              value: '$_leaveCount',
                              label: 'Times Left',
                              colors: colors,
                            ),
                            const SizedBox(width: 32),
                            _LeaveStatBox(
                              value: _formatTime(_elapsedSeconds),
                              label: 'Total Time',
                              colors: colors,
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _showLeaveWarning = false;
                                _isRunning = true;
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: colors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(25),
                              ),
                            ),
                            child: const Text(
                              'Continue Focusing',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
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
    );
  }
}

class _LeaveStatBox extends StatelessWidget {
  final String value;
  final String label;
  final dynamic colors;

  const _LeaveStatBox({
    required this.value,
    required this.label,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colors.primaryLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: colors.text,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: colors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
