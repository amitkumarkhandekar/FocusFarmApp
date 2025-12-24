---
description: How to run the FocusFarm application locally
---

To run the FocusFarm application and test the authentication flow, follow these steps:

### 1. Configure Supabase (Required)
Before running, you must provide your Supabase credentials in the `.env` file.
1. Open [.env](file:///d:/FocusFarm/.env).
2. Replace the placeholders with your **Project URL** and **Anon Key** from the Supabase Dashboard (Project Settings > API).

### 2. Start the Development Server
Run the following command in your terminal at the project root:
```bash
npm start
```
This will launch the **Expo Dev Tools** in your terminal.

### 3. View the App
You have three options to view the app:

#### A. Physical Device (Recommended)
1. Install the **Expo Go** app from the App Store or Google Play.
2. Ensure your phone is on the same Wi-Fi network as your computer.
3. Scan the QR code displayed in your terminal using the Expo Go app (Android) or the Camera app (iOS).

#### B. Android Emulator
1. Open **Android Studio** and start an AVD (Android Virtual Device).
2. Press `a` in the terminal where Expo is running.

#### C. iOS Simulator (Mac Only)
1. Ensure **Xcode** is installed.
2. Press `i` in the terminal where Expo is running.

#### D. Web Browser
1. Press `w` in the terminal.
> [!NOTE]
> Some native features like "App Blocking" will only work on physical devices or emulators.

### 4. Troubleshooting
- If you see dependency errors, run `npm install`.
- If the app doesn't connect, ensure your firewall allows connections on port `8081`.
