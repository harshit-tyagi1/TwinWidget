# 📱 TwinWidget Native Android APK & Widget Setup

This directory contains the production Android files for building **TwinWidget** into a standalone Android APK with Home Screen Widget support.

---

## 🏗️ Architecture

1. **AppWidget (`TwinWidgetProvider.kt`)**:
   - Implements native Android `AppWidgetProvider`.
   - Reads the decrypted image from app-private storage (`filesDir/latest_decrypted_widget.png`).
   - Handles tap events to immediately launch the app directly into Reply / Canvas mode.

2. **Silent Wake-up Push (`TwinMessagingService.kt`)**:
   - Listens for Firebase Cloud Messaging (FCM) background data messages.
   - Decrypts incoming AES-256-GCM ciphertext on the phone.
   - Refreshes all active home screen widgets instantly.

3. **Zero-Leak Security**:
   - `FLAG_SECURE` prevents screenshots and screen recording.
   - Hardware-backed Android Keystore stores the private pairing key.
   - Decrypted photos are saved **only** in private app internal storage, never in `DCIM` or public storage.

---

## 🚀 How to Build Standalone APK

### Option 1: Direct Web / PWA (Zero Build Required)
1. Run `npm run dev` in the project root.
2. Open on your phone browser.
3. Tap **Add to Home Screen** (Installs as a standalone PWA with full camera, drawing, and offline capabilities).

### Option 2: Build Native Android APK with Capacitor / Android Studio
1. In `TwinWidget/`, install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init TwinWidget com.twinwidget.app
   npx cap add android
   ```
2. Build the web assets:
   ```bash
   npm run build
   npx cap copy
   ```
3. Open `android/` in Android Studio and build the release APK (`Build > Build Bundle(s) / APK(s) > Build APK(s)`).
4. Send the APK to your friend via WhatsApp / Telegram / Drive and install!
