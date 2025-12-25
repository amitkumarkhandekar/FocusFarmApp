import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'farm_2d_view.dart';

// Conditional import for web
import 'farm_3d_web_stub.dart'
    if (dart.library.html) 'farm_3d_web.dart';

/// Platform-aware farm view that uses 3D on web and 2D on mobile
class FarmView extends StatelessWidget {
  final int hens;
  final int goats;
  final int cows;
  final bool isNight;
  final double zoomLevel;

  const FarmView({
    super.key,
    required this.hens,
    required this.goats,
    required this.cows,
    required this.isNight,
    this.zoomLevel = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      // Use 3D Three.js on web
      return Farm3DWebView(
        hens: hens,
        goats: goats,
        cows: cows,
        isNight: isNight,
      );
    } else {
      // Use 2D on mobile
      return Farm2DView(
        hens: hens,
        goats: goats,
        cows: cows,
        isNight: isNight,
        zoomLevel: zoomLevel,
      );
    }
  }
}
