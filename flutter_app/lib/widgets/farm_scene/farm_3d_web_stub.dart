import 'package:flutter/material.dart';

/// Stub for non-web platforms
class Farm3DWebView extends StatelessWidget {
  final int hens;
  final int goats;
  final int cows;
  final bool isNight;

  const Farm3DWebView({
    super.key,
    required this.hens,
    required this.goats,
    required this.cows,
    required this.isNight,
  });

  @override
  Widget build(BuildContext context) {
    // This should never be called on non-web platforms
    return const SizedBox.shrink();
  }
}
