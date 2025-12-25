import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/theme_provider.dart';
import '../../providers/farm_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/storage_service.dart';
import '../../models/category.dart';

const List<String> categoryColors = [
  '#4A7C23', '#1976D2', '#9C27B0', '#FF5722', '#00BCD4', '#E91E63', '#FF9800', '#795548'
];

const List<String> categoryIcons = [
  '📚', '💼', '📖', '🏃', '🧘', '🎨', '💻', '🎵', '🧪', '📝',
  '📐', '🔬', '🌍', '💡', '🎯', '📊', '🏋️', '🎮', '📱', '🖥️',
];

/// Settings screen - matches (tabs)/settings.tsx
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pauseOnLeave = true;
  bool _showWarning = true;
  bool _vibrateOnLeave = true;
  bool _isSyncing = false;
  String _userName = 'Focus Farmer';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() {
      _pauseOnLeave = StorageService.pauseOnLeave;
      _showWarning = StorageService.showWarning;
      _vibrateOnLeave = StorageService.vibrateOnLeave;
      _userName = StorageService.userName;
    });
  }

  Future<void> _handleSync() async {
    setState(() => _isSyncing = true);
    await ref.read(farmProvider.notifier).refreshState();
    setState(() => _isSyncing = false);
  }

  Future<void> _showAddCategoryDialog() async {
    String name = '';
    String selectedColor = categoryColors[0];
    String selectedIcon = categoryIcons[0];

    await showDialog(
      context: context,
      builder: (context) {
        final colors = ref.read(appColorsProvider);
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('New Category'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      onChanged: (value) => name = value,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        hintText: 'e.g., Coding',
                      ),
                      maxLength: 20,
                    ),
                    const SizedBox(height: 16),
                    const Text('Icon', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: categoryIcons.map((icon) => GestureDetector(
                        onTap: () => setDialogState(() => selectedIcon = icon),
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: selectedIcon == icon ? colors.primaryLight : colors.surfaceSecondary,
                            borderRadius: BorderRadius.circular(12),
                            border: selectedIcon == icon
                                ? Border.all(color: colors.primary, width: 2)
                                : null,
                          ),
                          child: Center(child: Text(icon, style: const TextStyle(fontSize: 22))),
                        ),
                      )).toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text('Color', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 10,
                      children: categoryColors.map((color) => GestureDetector(
                        onTap: () => setDialogState(() => selectedColor = color),
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Color(int.parse(color.replaceFirst('#', '0xFF'))),
                            shape: BoxShape.circle,
                            border: selectedColor == color
                                ? Border.all(color: colors.text, width: 3)
                                : null,
                          ),
                        ),
                      )).toList(),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (name.trim().isNotEmpty) {
                      await ref.read(farmProvider.notifier).addCategory(
                        name.trim(),
                        selectedColor,
                        selectedIcon,
                      );
                      if (mounted) Navigator.pop(context);
                    }
                  },
                  child: const Text('Add'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _deleteCategory(Category category) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Category'),
        content: Text('Are you sure you want to delete "${category.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(farmProvider.notifier).deleteCategory(category.id);
    }
  }

  Future<void> _showEditNameDialog() async {
    String newName = _userName;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: TextField(
          controller: TextEditingController(text: _userName),
          onChanged: (value) => newName = value,
          decoration: const InputDecoration(
            labelText: 'Your Name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (newName.trim().isNotEmpty) {
                await StorageService.setUserName(newName.trim());
                setState(() => _userName = newName.trim());
              }
              if (mounted) Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authProvider.notifier).signOut();
      if (mounted) context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = ref.watch(appColorsProvider);
    final isDark = ref.watch(themeProvider);
    final farmState = ref.watch(farmProvider);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              color: colors.surface,
              child: Row(
                children: [
                  Icon(LucideIcons.settings, size: 28, color: colors.primary),
                  const SizedBox(width: 12),
                  Text(
                    'Settings',
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
                    const SizedBox(height: 24),

                    // Profile Section
                    _SectionTitle(title: 'Profile', colors: colors),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: colors.primaryLight,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(LucideIcons.user, size: 32, color: colors.primary),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _userName,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: colors.text,
                                  ),
                                ),
                                Text(
                                  'Focus Farmer since 2024',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: colors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: _showEditNameDialog,
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: colors.primaryLight,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(LucideIcons.edit2, size: 18, color: colors.primary),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Cloud Sync
                    _SectionTitle(title: 'Cloud Sync', colors: colors),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE3F2FD),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.cloud, size: 24, color: Color(0xFF1976D2)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Sync with Cloud',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF1565C0),
                                  ),
                                ),
                                Text(
                                  'Last synced: ${farmState.lastSyncTime ?? 'Never'}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF1976D2),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: _isSyncing ? null : _handleSync,
                            icon: _isSyncing
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(LucideIcons.refreshCw, size: 18),
                            label: const Text('Sync'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1976D2),
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
                    const SizedBox(height: 24),

                    // Categories
                    _SectionTitle(title: 'Task Categories', colors: colors),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          if (farmState.categories.isEmpty)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              child: Text(
                                'No custom categories yet',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: colors.textMuted,
                                ),
                              ),
                            )
                          else
                            ...farmState.categories.map((cat) => Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(color: colors.border),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Color(int.parse(cat.color.replaceFirst('#', '0xFF'))).withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Row(
                                      children: [
                                        Text(cat.icon, style: const TextStyle(fontSize: 18)),
                                        const SizedBox(width: 8),
                                        Text(
                                          cat.name,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: Color(int.parse(cat.color.replaceFirst('#', '0xFF'))),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Spacer(),
                                  GestureDetector(
                                    onTap: () => _deleteCategory(cat),
                                    child: const Icon(LucideIcons.trash2, size: 18, color: Color(0xFFD32F2F)),
                                  ),
                                ],
                              ),
                            )),
                          const SizedBox(height: 8),
                          GestureDetector(
                            onTap: _showAddCategoryDialog,
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: colors.primaryLight,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(LucideIcons.plus, size: 18, color: colors.primary),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Add Category',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: colors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Focus Mode Settings
                    _SectionTitle(title: 'Focus Mode', colors: colors),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          _SettingRow(
                            icon: LucideIcons.clock,
                            title: 'Pause on Leave',
                            subtitle: 'Pause timer when you leave the app',
                            value: _pauseOnLeave,
                            onChanged: (value) async {
                              setState(() => _pauseOnLeave = value);
                              await StorageService.setPauseOnLeave(value);
                            },
                            colors: colors,
                          ),
                          Divider(color: colors.border, height: 1),
                          _SettingRow(
                            icon: LucideIcons.bell,
                            title: 'Show Warning',
                            subtitle: 'Display reminder when returning to app',
                            value: _showWarning,
                            onChanged: (value) async {
                              setState(() => _showWarning = value);
                              await StorageService.setShowWarning(value);
                            },
                            colors: colors,
                          ),
                          Divider(color: colors.border, height: 1),
                          _SettingRow(
                            icon: LucideIcons.shield,
                            title: 'Vibrate on Leave',
                            subtitle: 'Vibrate when leaving during focus',
                            value: _vibrateOnLeave,
                            onChanged: (value) async {
                              setState(() => _vibrateOnLeave = value);
                              await StorageService.setVibrateOnLeave(value);
                            },
                            colors: colors,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Appearance
                    _SectionTitle(title: 'Appearance', colors: colors),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: _SettingRow(
                        icon: LucideIcons.moon,
                        title: 'Dark Theme',
                        subtitle: 'Use dark colors throughout the app',
                        value: isDark,
                        onChanged: (value) {
                          ref.read(themeProvider.notifier).setDarkTheme(value);
                        },
                        colors: colors,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Logout
                    GestureDetector(
                      onTap: _handleLogout,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: colors.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.logOut, size: 20, color: colors.error),
                            const SizedBox(width: 8),
                            Text(
                              'Log Out',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: colors.error,
                              ),
                            ),
                          ],
                        ),
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
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final dynamic colors;

  const _SectionTitle({required this.title, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: colors.text,
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final dynamic colors;

  const _SettingRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: colors.primary),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: colors.text,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: colors.primary,
            activeTrackColor: const Color(0xFFA5D6A7),
          ),
        ],
      ),
    );
  }
}
