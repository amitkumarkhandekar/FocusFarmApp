import 'package:flutter/material.dart';
import 'dart:math' as math;

/// 2D Isometric Farm View - fallback for 3D rendering
class Farm2DView extends StatefulWidget {
  final int hens;
  final int goats;
  final int cows;
  final bool isNight;
  final double zoomLevel;

  const Farm2DView({
    super.key,
    required this.hens,
    required this.goats,
    required this.cows,
    required this.isNight,
    this.zoomLevel = 1.0,
  });

  @override
  State<Farm2DView> createState() => _Farm2DViewState();
}

class _Farm2DViewState extends State<Farm2DView> with TickerProviderStateMixin {
  late AnimationController _animationController;
  final List<_Animal> _animals = [];
  final math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
    _generateAnimals();
  }

  @override
  void didUpdateWidget(Farm2DView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.hens != widget.hens ||
        oldWidget.goats != widget.goats ||
        oldWidget.cows != widget.cows) {
      _generateAnimals();
    }
  }

  void _generateAnimals() {
    _animals.clear();
    
    // Generate hens
    for (int i = 0; i < math.min(widget.hens, 15); i++) {
      _animals.add(_Animal(
        type: AnimalType.hen,
        x: 0.3 + _random.nextDouble() * 0.4,
        y: 0.5 + _random.nextDouble() * 0.3,
        animationOffset: _random.nextDouble(),
      ));
    }
    
    // Generate goats
    for (int i = 0; i < math.min(widget.goats, 10); i++) {
      _animals.add(_Animal(
        type: AnimalType.goat,
        x: 0.2 + _random.nextDouble() * 0.3,
        y: 0.3 + _random.nextDouble() * 0.3,
        animationOffset: _random.nextDouble(),
      ));
    }
    
    // Generate cows
    for (int i = 0; i < math.min(widget.cows, 8); i++) {
      _animals.add(_Animal(
        type: AnimalType.cow,
        x: 0.5 + _random.nextDouble() * 0.3,
        y: 0.2 + _random.nextDouble() * 0.3,
        animationOffset: _random.nextDouble(),
      ));
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return CustomPaint(
          painter: _FarmPainter(
            animals: _animals,
            isNight: widget.isNight,
            zoomLevel: widget.zoomLevel,
            animationValue: _animationController.value,
          ),
          size: Size.infinite,
        );
      },
    );
  }
}

enum AnimalType { hen, goat, cow }

class _Animal {
  final AnimalType type;
  final double x;
  final double y;
  final double animationOffset;

  _Animal({
    required this.type,
    required this.x,
    required this.y,
    required this.animationOffset,
  });
}

class _FarmPainter extends CustomPainter {
  final List<_Animal> animals;
  final bool isNight;
  final double zoomLevel;
  final double animationValue;

  _FarmPainter({
    required this.animals,
    required this.isNight,
    required this.zoomLevel,
    required this.animationValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Sky gradient
    final skyGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: isNight
          ? [const Color(0xFF0F1B2E), const Color(0xFF1A2744)]
          : [const Color(0xFF87CEEB), const Color(0xFFB6E0F5)],
    );
    
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height * 0.6),
      Paint()..shader = skyGradient.createShader(Rect.fromLTWH(0, 0, size.width, size.height * 0.6)),
    );

    // Sun or Moon
    final celestialPaint = Paint()
      ..color = isNight ? const Color(0xFFFFFACD) : const Color(0xFFFFD700);
    canvas.drawCircle(
      Offset(isNight ? size.width * 0.8 : size.width * 0.2, size.height * 0.15),
      isNight ? 25 : 35,
      celestialPaint,
    );

    // Stars (night only)
    if (isNight) {
      final starPaint = Paint()..color = Colors.white;
      for (int i = 0; i < 50; i++) {
        final x = (i * 37 % 100) / 100 * size.width;
        final y = (i * 23 % 50) / 50 * size.height * 0.4;
        canvas.drawCircle(Offset(x, y), 1 + (i % 3) * 0.5, starPaint);
      }
    }

    // Clouds
    _drawCloud(canvas, Offset(size.width * 0.25, size.height * 0.12), 40, isNight);
    _drawCloud(canvas, Offset(size.width * 0.65, size.height * 0.08), 50, isNight);
    _drawCloud(canvas, Offset(size.width * 0.85, size.height * 0.18), 35, isNight);

    // Ground
    final groundGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: isNight
          ? [const Color(0xFF2D4A22), const Color(0xFF1E3618)]
          : [const Color(0xFF4A9D2F), const Color(0xFF3D8526)],
    );
    
    final groundPath = Path();
    groundPath.moveTo(0, size.height * 0.5);
    groundPath.lineTo(size.width, size.height * 0.5);
    groundPath.lineTo(size.width, size.height);
    groundPath.lineTo(0, size.height);
    groundPath.close();
    
    canvas.drawPath(
      groundPath,
      Paint()..shader = groundGradient.createShader(Rect.fromLTWH(0, size.height * 0.5, size.width, size.height * 0.5)),
    );

    // Barn
    _drawBarn(canvas, Offset(size.width * 0.15, size.height * 0.35), size.width * 0.15);

    // Farmhouse
    _drawFarmhouse(canvas, Offset(size.width * 0.75, size.height * 0.4), size.width * 0.12);

    // Fence
    _drawFence(canvas, size);

    // Trees
    _drawTree(canvas, Offset(size.width * 0.05, size.height * 0.45), 30);
    _drawTree(canvas, Offset(size.width * 0.92, size.height * 0.38), 35);
    _drawTree(canvas, Offset(size.width * 0.35, size.height * 0.32), 25);

    // Draw animals
    for (final animal in animals) {
      final bounce = math.sin((animationValue + animal.animationOffset) * 2 * math.pi) * 3;
      final x = animal.x * size.width * zoomLevel;
      final y = animal.y * size.height + bounce;
      
      switch (animal.type) {
        case AnimalType.hen:
          _drawHen(canvas, Offset(x, y));
          break;
        case AnimalType.goat:
          _drawGoat(canvas, Offset(x, y));
          break;
        case AnimalType.cow:
          _drawCow(canvas, Offset(x, y));
          break;
      }
    }

    // Farmer
    _drawFarmer(canvas, Offset(size.width * 0.5, size.height * 0.55));
  }

  void _drawCloud(Canvas canvas, Offset position, double size, bool isNight) {
    final paint = Paint()
      ..color = isNight ? Colors.grey.shade700 : Colors.white;
    
    canvas.drawCircle(position, size * 0.6, paint);
    canvas.drawCircle(Offset(position.dx - size * 0.5, position.dy + size * 0.1), size * 0.4, paint);
    canvas.drawCircle(Offset(position.dx + size * 0.5, position.dy + size * 0.1), size * 0.45, paint);
  }

  void _drawBarn(Canvas canvas, Offset position, double width) {
    final height = width * 1.2;
    
    // Main barn body
    final barnPaint = Paint()..color = const Color(0xFF8B0000);
    canvas.drawRect(
      Rect.fromCenter(center: position, width: width, height: height * 0.7),
      barnPaint,
    );
    
    // Roof
    final roofPath = Path();
    roofPath.moveTo(position.dx - width * 0.6, position.dy - height * 0.35);
    roofPath.lineTo(position.dx, position.dy - height * 0.65);
    roofPath.lineTo(position.dx + width * 0.6, position.dy - height * 0.35);
    roofPath.close();
    
    canvas.drawPath(
      roofPath,
      Paint()..color = const Color(0xFF654321),
    );
    
    // Door
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx, position.dy + height * 0.2),
        width: width * 0.3,
        height: height * 0.4,
      ),
      Paint()..color = const Color(0xFF4A2511),
    );
  }

  void _drawFarmhouse(Canvas canvas, Offset position, double width) {
    final height = width * 1.0;
    
    // House body
    canvas.drawRect(
      Rect.fromCenter(center: position, width: width, height: height * 0.6),
      Paint()..color = const Color(0xFFD2691E),
    );
    
    // Roof
    final roofPath = Path();
    roofPath.moveTo(position.dx - width * 0.55, position.dy - height * 0.3);
    roofPath.lineTo(position.dx, position.dy - height * 0.6);
    roofPath.lineTo(position.dx + width * 0.55, position.dy - height * 0.3);
    roofPath.close();
    
    canvas.drawPath(
      roofPath,
      Paint()..color = const Color(0xFF8B4513),
    );
    
    // Window
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx, position.dy - height * 0.1),
        width: width * 0.2,
        height: width * 0.2,
      ),
      Paint()..color = const Color(0xFF87CEEB),
    );
    
    // Door
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx, position.dy + height * 0.15),
        width: width * 0.25,
        height: height * 0.35,
      ),
      Paint()..color = const Color(0xFF4A2511),
    );
  }

  void _drawFence(Canvas canvas, Size size) {
    final fencePaint = Paint()
      ..color = const Color(0xFF8B6914)
      ..strokeWidth = 3;
    
    // Bottom fence
    for (double x = size.width * 0.1; x < size.width * 0.9; x += 25) {
      // Post
      canvas.drawLine(
        Offset(x, size.height * 0.7),
        Offset(x, size.height * 0.7 - 20),
        fencePaint,
      );
    }
    // Rails
    canvas.drawLine(
      Offset(size.width * 0.1, size.height * 0.68),
      Offset(size.width * 0.9, size.height * 0.68),
      fencePaint,
    );
    canvas.drawLine(
      Offset(size.width * 0.1, size.height * 0.66),
      Offset(size.width * 0.9, size.height * 0.66),
      fencePaint,
    );
  }

  void _drawTree(Canvas canvas, Offset position, double size) {
    // Trunk
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx, position.dy + size * 0.5),
        width: size * 0.3,
        height: size * 1.2,
      ),
      Paint()..color = const Color(0xFF654321),
    );
    
    // Foliage
    canvas.drawCircle(
      Offset(position.dx, position.dy - size * 0.2),
      size * 0.8,
      Paint()..color = const Color(0xFF228B22),
    );
  }

  void _drawHen(Canvas canvas, Offset position) {
    // Body
    canvas.drawOval(
      Rect.fromCenter(center: position, width: 20, height: 15),
      Paint()..color = const Color(0xFFDC4C2C),
    );
    // Head
    canvas.drawCircle(
      Offset(position.dx + 8, position.dy - 5),
      6,
      Paint()..color = const Color(0xFFDC4C2C),
    );
    // Comb
    canvas.drawCircle(
      Offset(position.dx + 8, position.dy - 12),
      4,
      Paint()..color = Colors.red,
    );
    // Beak
    final beakPath = Path();
    beakPath.moveTo(position.dx + 14, position.dy - 5);
    beakPath.lineTo(position.dx + 18, position.dy - 4);
    beakPath.lineTo(position.dx + 14, position.dy - 3);
    beakPath.close();
    canvas.drawPath(beakPath, Paint()..color = const Color(0xFFFFAA00));
  }

  void _drawGoat(Canvas canvas, Offset position) {
    // Body
    canvas.drawOval(
      Rect.fromCenter(center: position, width: 30, height: 22),
      Paint()..color = const Color(0xFFB8956A),
    );
    // Head
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(position.dx + 15, position.dy - 8),
        width: 15,
        height: 12,
      ),
      Paint()..color = const Color(0xFFB8956A),
    );
    // Horns
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(position.dx + 18, position.dy - 18),
        width: 8,
        height: 12,
      ),
      0, math.pi, false,
      Paint()..color = const Color(0xFF3A3A3A)..style = PaintingStyle.stroke..strokeWidth = 2,
    );
    // Legs
    final legPaint = Paint()
      ..color = const Color(0xFF8D6E63)
      ..strokeWidth = 3;
    canvas.drawLine(
      Offset(position.dx - 8, position.dy + 8),
      Offset(position.dx - 8, position.dy + 20),
      legPaint,
    );
    canvas.drawLine(
      Offset(position.dx + 8, position.dy + 8),
      Offset(position.dx + 8, position.dy + 20),
      legPaint,
    );
  }

  void _drawCow(Canvas canvas, Offset position) {
    // Body
    canvas.drawOval(
      Rect.fromCenter(center: position, width: 45, height: 30),
      Paint()..color = Colors.white,
    );
    // Spots
    canvas.drawCircle(Offset(position.dx - 8, position.dy - 5), 8, Paint()..color = Colors.black);
    canvas.drawCircle(Offset(position.dx + 10, position.dy + 3), 6, Paint()..color = Colors.black);
    // Head
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(position.dx + 22, position.dy - 8),
        width: 18,
        height: 14,
      ),
      Paint()..color = Colors.white,
    );
    // Snout
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(position.dx + 28, position.dy - 5),
        width: 10,
        height: 8,
      ),
      Paint()..color = const Color(0xFFFFCCBB),
    );
    // Legs
    final legPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 4;
    canvas.drawLine(
      Offset(position.dx - 12, position.dy + 12),
      Offset(position.dx - 12, position.dy + 28),
      legPaint,
    );
    canvas.drawLine(
      Offset(position.dx + 12, position.dy + 12),
      Offset(position.dx + 12, position.dy + 28),
      legPaint,
    );
  }

  void _drawFarmer(Canvas canvas, Offset position) {
    // Body/Shirt
    canvas.drawRect(
      Rect.fromCenter(center: position, width: 18, height: 25),
      Paint()..color = const Color(0xFF8B4513),
    );
    // Head
    canvas.drawCircle(
      Offset(position.dx, position.dy - 20),
      10,
      Paint()..color = const Color(0xFFFFDBAC),
    );
    // Hat
    final hatPath = Path();
    hatPath.moveTo(position.dx - 12, position.dy - 28);
    hatPath.lineTo(position.dx, position.dy - 40);
    hatPath.lineTo(position.dx + 12, position.dy - 28);
    hatPath.close();
    canvas.drawPath(hatPath, Paint()..color = const Color(0xFF654321));
    // Legs
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx - 4, position.dy + 20),
        width: 5,
        height: 15,
      ),
      Paint()..color = const Color(0xFF2C2C2C),
    );
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(position.dx + 4, position.dy + 20),
        width: 5,
        height: 15,
      ),
      Paint()..color = const Color(0xFF2C2C2C),
    );
  }

  @override
  bool shouldRepaint(covariant _FarmPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.isNight != isNight ||
        oldDelegate.zoomLevel != zoomLevel ||
        oldDelegate.animals.length != animals.length;
  }
}
