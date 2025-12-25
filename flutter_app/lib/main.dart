import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/router.dart';
import 'app/theme.dart';
import 'core/supabase_service.dart';
import 'core/storage_service.dart';
import 'providers/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  await StorageService.initialize();
  await SupabaseService.initialize();

  runApp(
    const ProviderScope(
      child: FocusFarmApp(),
    ),
  );
}

class FocusFarmApp extends ConsumerWidget {
  const FocusFarmApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final isDark = ref.watch(themeProvider);
    final colors = ref.watch(appColorsProvider);

    return MaterialApp.router(
      title: 'FocusFarm',
      debugShowCheckedModeBanner: false,
      theme: createThemeData(colors, isDark),
      routerConfig: router,
    );
  }
}
