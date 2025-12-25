import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Landing screen - matches index.tsx
class LandingScreen extends ConsumerWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final size = MediaQuery.of(context).size;
    // Make circle size responsive
    final circleSize = (size.width * 0.45).clamp(120.0, 280.0);

    return Scaffold(
      backgroundColor: const Color(0xFFF9FBF9),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: size.height - MediaQuery.of(context).padding.top - MediaQuery.of(context).padding.bottom - 48,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Hero Section
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Logo
                    Row(
                      children: [
                        Icon(
                          LucideIcons.cloud,
                          size: 36,
                          color: const Color(0xFF6B8E23),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'FocusFarm',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2D4A22),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Visual - Cow Illustration
                    Center(
                      child: Container(
                        width: circleSize,
                        height: circleSize,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2D4A22).withValues(alpha: 0.1),
                              offset: const Offset(0, 10),
                              blurRadius: 20,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            '🐄',
                            style: TextStyle(fontSize: circleSize * 0.4),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Title and Subtitle
                    const Text(
                      'Grow your farm by growing your focus.',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2D4A22),
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Transform study sessions into a playful journey. Collect animals, unlock rewards, and build your dream farm.',
                      style: TextStyle(
                        fontSize: 15,
                        color: const Color(0xFF556B2F).withValues(alpha: 0.8),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Buttons
                Column(
                  children: [
                    // Primary Button - Get Started
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => context.push('/signup'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6B8E23),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 3,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Get Started',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(LucideIcons.arrowRight, size: 20),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Secondary Button - Login
                    TextButton(
                      onPressed: () => context.push('/login'),
                      child: const Text(
                        'Already have a farm? Log in',
                        style: TextStyle(
                          color: Color(0xFF2D4A22),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
