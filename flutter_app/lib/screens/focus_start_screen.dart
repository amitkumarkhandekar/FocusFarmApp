import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/theme_provider.dart';
import '../providers/farm_provider.dart';

/// Focus start screen - matches focus-start.tsx
class FocusStartScreen extends ConsumerStatefulWidget {
  const FocusStartScreen({super.key});

  @override
  ConsumerState<FocusStartScreen> createState() => _FocusStartScreenState();
}

class _FocusStartScreenState extends ConsumerState<FocusStartScreen> {
  final _taskController = TextEditingController();
  String? _selectedCategoryId;
  String? _selectedCategoryName;

  @override
  void dispose() {
    _taskController.dispose();
    super.dispose();
  }

  void _startFocus({bool quickStart = false}) {
    if (quickStart) {
      context.push('/focus', extra: {
        'taskName': 'Quick Focus',
        'categoryId': null,
        'categoryName': null,
      });
    } else {
      final taskName = _taskController.text.trim();
      if (taskName.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Please enter a task name."),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      context.push('/focus', extra: {
        'taskName': taskName,
        'categoryId': _selectedCategoryId,
        'categoryName': _selectedCategoryName,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final farmState = ref.watch(farmProvider);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // Header
              Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(LucideIcons.chevronLeft, size: 24, color: colors.text),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Start Focus',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: colors.text,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Emoji Header
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: colors.primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('🎯', style: TextStyle(fontSize: 50)),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Center(
                child: Text(
                  "What are you working on?",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: colors.text,
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Task Name Input
              Text(
                'Task Name',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
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
                child: TextField(
                  controller: _taskController,
                  decoration: InputDecoration(
                    hintText: 'e.g., "Chapter 5 Notes"',
                    hintStyle: TextStyle(color: colors.textMuted),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(16),
                    prefixIcon: Icon(LucideIcons.pencil, color: colors.textSecondary),
                  ),
                  style: TextStyle(fontSize: 16, color: colors.text),
                ),
              ),
              const SizedBox(height: 24),

              // Category Selection
              if (farmState.categories.isNotEmpty) ...[
                Text(
                  'Category (optional)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: colors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ...farmState.categories.map((cat) => GestureDetector(
                      onTap: () {
                        setState(() {
                          if (_selectedCategoryId == cat.id) {
                            _selectedCategoryId = null;
                            _selectedCategoryName = null;
                          } else {
                            _selectedCategoryId = cat.id;
                            _selectedCategoryName = cat.name;
                          }
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedCategoryId == cat.id
                              ? Color(int.parse(cat.color.replaceFirst('#', '0xFF')))
                              : colors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _selectedCategoryId == cat.id
                                ? Colors.transparent
                                : colors.border,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(cat.icon, style: const TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Text(
                              cat.name,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _selectedCategoryId == cat.id
                                    ? Colors.white
                                    : colors.text,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )),
                  ],
                ),
                const SizedBox(height: 32),
              ],

              const Spacer(),

              // Start Buttons
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton.icon(
                  onPressed: () => _startFocus(),
                  icon: const Icon(LucideIcons.play, size: 24),
                  label: const Text('Start Session'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Quick Start
              SizedBox(
                width: double.infinity,
                height: 50,
                child: TextButton.icon(
                  onPressed: () => _startFocus(quickStart: true),
                  icon: Icon(LucideIcons.zap, size: 20, color: colors.accent),
                  label: Text(
                    'Quick Start',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: colors.textSecondary,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
