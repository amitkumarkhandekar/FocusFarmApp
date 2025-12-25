import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/theme_provider.dart';

/// Main shell with bottom navigation for tab routes
class MainShell extends ConsumerWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = ref.watch(appColorsProvider);
    final isDark = ref.watch(themeProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: colors.tabBar,
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : const Color(0xFF2D4A22).withOpacity(0.1),
              offset: const Offset(0, -4),
              blurRadius: 12,
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: LucideIcons.home,
                  label: 'Farm',
                  path: '/farm',
                  colors: colors,
                ),
                _NavItem(
                  icon: LucideIcons.target,
                  label: 'Goals',
                  path: '/goals',
                  colors: colors,
                ),
                _NavItem(
                  icon: LucideIcons.barChart2,
                  label: 'Analytics',
                  path: '/analytics',
                  colors: colors,
                ),
                _NavItem(
                  icon: LucideIcons.package,
                  label: 'Inventory',
                  path: '/inventory',
                  colors: colors,
                ),
                _NavItem(
                  icon: LucideIcons.settings,
                  label: 'Settings',
                  path: '/settings',
                  colors: colors,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String path;
  final dynamic colors;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.path,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    final isSelected = currentPath == path;

    return InkWell(
      onTap: () => context.go(path),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 24,
              color: isSelected ? colors.primary : colors.textMuted,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isSelected ? colors.primary : colors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
