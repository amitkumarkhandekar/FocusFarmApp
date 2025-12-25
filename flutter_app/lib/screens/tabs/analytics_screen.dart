import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/theme_provider.dart';
import '../../providers/farm_provider.dart';
import '../../models/study_session.dart';

/// Analytics screen - matches (tabs)/analytics.tsx
class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  String _timeframe = 'daily';
  List<StudySession> _sessions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    final sessions = await ref.read(farmProvider.notifier).getSessions(days: 30);
    setState(() {
      _sessions = sessions;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final farmState = ref.watch(farmProvider);

    // Calculate stats
    final totalMinutes = _sessions.fold<int>(0, (sum, s) => sum + s.durationMinutes);
    final totalHours = (totalMinutes / 60).toStringAsFixed(1);
    final avgSession = _sessions.isEmpty ? 0 : (totalMinutes / _sessions.length).round();
    final streakDays = _calculateStreak();

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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.barChart2, size: 28, color: colors.primary),
                      const SizedBox(width: 12),
                      Text(
                        'Analytics',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: colors.text,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: _loadSessions,
                    icon: Icon(LucideIcons.refreshCw, color: colors.textSecondary),
                  ),
                ],
              ),
            ),

            if (_isLoading)
              Expanded(
                child: Center(
                  child: CircularProgressIndicator(color: colors.primary),
                ),
              )
            else
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Timeframe Selector
                      Container(
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.all(4),
                        child: Row(
                          children: [
                            _TimeframeButton(
                              label: 'Daily',
                              isSelected: _timeframe == 'daily',
                              onTap: () => setState(() => _timeframe = 'daily'),
                              colors: colors,
                            ),
                            _TimeframeButton(
                              label: 'Weekly',
                              isSelected: _timeframe == 'weekly',
                              onTap: () => setState(() => _timeframe = 'weekly'),
                              colors: colors,
                            ),
                            _TimeframeButton(
                              label: 'Monthly',
                              isSelected: _timeframe == 'monthly',
                              onTap: () => setState(() => _timeframe = 'monthly'),
                              colors: colors,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Stats Row
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: LucideIcons.flame,
                              iconColor: Colors.orange,
                              value: '$streakDays',
                              label: 'Day Streak',
                              colors: colors,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: LucideIcons.clock,
                              iconColor: colors.primary,
                              value: '$totalHours hrs',
                              label: 'Total Focus',
                              colors: colors,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: LucideIcons.timer,
                              iconColor: Colors.blue,
                              value: '$avgSession min',
                              label: 'Avg Session',
                              colors: colors,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: LucideIcons.calendar,
                              iconColor: Colors.purple,
                              value: '${_sessions.length}',
                              label: 'Sessions',
                              colors: colors,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Chart
                      Text(
                        'Focus Overview',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: colors.text,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        height: 200,
                        padding: const EdgeInsets.all(16),
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
                        child: _buildChart(colors),
                      ),
                      const SizedBox(height: 24),

                      // Recent Sessions
                      Text(
                        'Recent Sessions',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: colors.text,
                        ),
                      ),
                      const SizedBox(height: 16),

                      if (_sessions.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: colors.surface,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(LucideIcons.clock, size: 48, color: colors.textMuted),
                                const SizedBox(height: 12),
                                Text(
                                  'No sessions yet',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  'Start a focus session to see your stats!',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: colors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ...(_sessions.take(5).map((session) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _SessionCard(session: session, colors: colors),
                        ))),

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

  int _calculateStreak() {
    if (_sessions.isEmpty) return 0;

    final now = DateTime.now();
    final dates = _sessions
        .map((s) => DateTime(s.startedAt.year, s.startedAt.month, s.startedAt.day))
        .toSet()
        .toList()
      ..sort((a, b) => b.compareTo(a));

    int streak = 0;
    DateTime? lastDate;

    for (final date in dates) {
      if (lastDate == null) {
        final today = DateTime(now.year, now.month, now.day);
        final yesterday = today.subtract(const Duration(days: 1));
        if (date == today || date == yesterday) {
          streak = 1;
          lastDate = date;
        } else {
          break;
        }
      } else {
        final expected = lastDate.subtract(const Duration(days: 1));
        if (date == expected) {
          streak++;
          lastDate = date;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  Widget _buildChart(dynamic colors) {
    final chartData = _getChartData();

    if (chartData.isEmpty) {
      return Center(
        child: Text(
          'No data for this period',
          style: TextStyle(color: colors.textSecondary),
        ),
      );
    }

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: (chartData.map((e) => e.value).reduce((a, b) => a > b ? a : b) + 1),
        barTouchData: BarTouchData(enabled: false),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) => Text(
                chartData[value.toInt()].label,
                style: TextStyle(
                  fontSize: 10,
                  color: colors.textSecondary,
                ),
              ),
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: FlGridData(show: false),
        barGroups: List.generate(chartData.length, (index) => BarChartGroupData(
          x: index,
          barRods: [
            BarChartRodData(
              toY: chartData[index].value,
              color: colors.primary,
              width: 20,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
            ),
          ],
        )),
      ),
    );
  }

  List<_ChartDataPoint> _getChartData() {
    final now = DateTime.now();
    
    switch (_timeframe) {
      case 'daily':
        return List.generate(7, (i) {
          final date = now.subtract(Duration(days: 6 - i));
          final dayMinutes = _sessions
              .where((s) =>
                  s.startedAt.year == date.year &&
                  s.startedAt.month == date.month &&
                  s.startedAt.day == date.day)
              .fold<int>(0, (sum, s) => sum + s.durationMinutes);
          final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return _ChartDataPoint(
            label: weekdays[date.weekday - 1],
            value: dayMinutes / 60,
          );
        });
      case 'weekly':
        return List.generate(4, (i) {
          final weekStart = now.subtract(Duration(days: now.weekday - 1 + (3 - i) * 7));
          final weekEnd = weekStart.add(const Duration(days: 6));
          final weekMinutes = _sessions
              .where((s) =>
                  s.startedAt.isAfter(weekStart.subtract(const Duration(days: 1))) &&
                  s.startedAt.isBefore(weekEnd.add(const Duration(days: 1))))
              .fold<int>(0, (sum, s) => sum + s.durationMinutes);
          return _ChartDataPoint(
            label: 'W${i + 1}',
            value: weekMinutes / 60,
          );
        }).reversed.toList();
      case 'monthly':
        return List.generate(6, (i) {
          final month = DateTime(now.year, now.month - (5 - i), 1);
          final monthMinutes = _sessions
              .where((s) =>
                  s.startedAt.year == month.year &&
                  s.startedAt.month == month.month)
              .fold<int>(0, (sum, s) => sum + s.durationMinutes);
          final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return _ChartDataPoint(
            label: months[month.month - 1],
            value: monthMinutes / 60,
          );
        });
      default:
        return [];
    }
  }
}

class _ChartDataPoint {
  final String label;
  final double value;

  _ChartDataPoint({required this.label, required this.value});
}

class _TimeframeButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final dynamic colors;

  const _TimeframeButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? colors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : colors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String value;
  final String label;
  final dynamic colors;

  const _StatCard({
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.label,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 24, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 18,
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
          ),
        ],
      ),
    );
  }
}

class _SessionCard extends StatelessWidget {
  final StudySession session;
  final dynamic colors;

  const _SessionCard({
    required this.session,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: colors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                '${session.durationMinutes}',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: colors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  session.taskName ?? 'Focus Session',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: colors.text,
                  ),
                ),
                Text(
                  _formatDate(session.startedAt),
                  style: TextStyle(
                    fontSize: 12,
                    color: colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (session.leaveCount > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${session.leaveCount}×',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.orange,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final sessionDate = DateTime(date.year, date.month, date.day);

    if (sessionDate == today) {
      return 'Today, ${_formatTime(date)}';
    } else if (sessionDate == yesterday) {
      return 'Yesterday, ${_formatTime(date)}';
    } else {
      return '${date.day}/${date.month}, ${_formatTime(date)}';
    }
  }

  String _formatTime(DateTime date) {
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
