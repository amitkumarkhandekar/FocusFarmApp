---
description: How to run the Flutter FocusFarm app
---

## Running the Flutter FocusFarm App

### Prerequisites
- Flutter SDK installed (3.x or later)
- Chrome browser for web testing
- Android Studio / Xcode for mobile testing

### Setup (First Time)

1. Navigate to the Flutter app directory:
```bash
cd d:\FocusFarm\flutter_app
```

2. Install dependencies:
// turbo
```bash
flutter pub get
```

3. Configure Supabase credentials in `lib/core/supabase_config.dart`:
```dart
static const String url = 'https://your-actual-project.supabase.co';
static const String anonKey = 'your-actual-anon-key';
```

### Running the App

#### Web (Chrome)
// turbo
```bash
flutter run -d chrome
```

#### Android
// turbo
```bash
flutter run -d android
```

#### iOS (macOS only)
// turbo
```bash
flutter run -d ios
```

### Building Release Versions

#### Web
// turbo
```bash
flutter build web --release
```
Output: `build/web/`

#### Android APK
// turbo
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

#### Android App Bundle
// turbo
```bash
flutter build appbundle --release
```
Output: `build/app/outputs/bundle/release/app-release.aab`

### Troubleshooting

If you encounter issues:

1. Clean the build:
```bash
flutter clean
flutter pub get
```

2. Check Flutter doctor:
```bash
flutter doctor
```
