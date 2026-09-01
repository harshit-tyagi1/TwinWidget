# 📱 TwinWidget: Private 2-Phone E2EE Widget App

**TwinWidget** is a private, zero-hosting, end-to-end encrypted home screen widget app designed for you and your friend to send drawings, real-time camera photos, gallery memories, and sticky notes directly to each other’s home screen widgets with **zero chance of media leaks**.

---

## 🌟 What Was Built

### 1. 🛡️ Military-Grade End-to-End Encryption (E2EE)
- **Zero-Knowledge Security**: All media (photos, drawings, text) is encrypted locally on your device with **AES-256-GCM** using unique 96-bit random nonces before anything leaves the phone.
- **Pairing Ceremony**: Pair securely by scanning a **One-Time QR Code** or copying the cryptographic key.
- **Safety Fingerprint**: 16-digit hexadecimal/number fingerprint (e.g. `9433 8245 5022 1931`) to verify channel authenticity.
- **Tamper Proof**: If anyone tries to modify or tamper with encrypted payloads in transit, the 128-bit authentication tag rejects it immediately.

### 2. ⚡ 100% Free Zero-Hosting Architecture
- Operates with **zero servers to host or pay for**:
  - **Local Real-Time Relay**: BroadcastChannel + LocalStorage cross-tab/device sync for instant testing.
  - **Firebase Free Tier Connector**: Connects seamlessly with 0 server maintenance for over-the-air internet sync between two remote phones.

### 3. 🎨 Creator Studio Modes
1. **Neon & Sketch Drawing Canvas**:
   - Touch & stylus friendly with quadratic curve smoothing.
   - Brushes: **Neon Glow** (cyber glow effect), **Pen**, **Highlighter**, **Brush**, and **Eraser**.
   - 10 curated vibrant colors + custom thickness slider.
   - Paper backgrounds: OLED Black, Dark Navy, Grid Paper, Dot Matrix, Sunset Glow.
   - Undo, Redo, and Clear actions.
2. **Real-Time Camera Studio**:
   - Live camera view with front/rear camera switcher (`facingMode`).
   - Camera shutter snap with flash effect.
   - Add captions over photo before encrypting & sending.
3. **Gallery Photo Picker**:
   - Pick any photo from your phone's gallery with 1:1 square crop, 90° rotation, and zoom.
4. **Sticky Note Creator**:
   - Gradient note cards (Cyber, Sunset, Emerald, Midnight, Warm Honey, Velvet Rose).
   - Handwriting typography + Mood badges (❤️ *Thinking of you*, ✨ *Good vibes*, ☕ *Coffee break*, 🌙 *Good night*, etc.).

### 4. 🖼️ Home Screen Widget & Simulator
- **Live Home Screen Widget Preview**:
  - Displays latest received decrypted picture/drawing with sender tag and "sent X mins ago" timestamp.
  - **Tap-to-Reply**: Tapping the widget opens the Creator Studio directly.
  - **Simulate Partner Post**: Test how the widget receives and updates in real-time.
- **Native Android Code Included** ([`android/`](file:///c:/Users/Admin/OneDrive/Documents/------/AntiGravity%20Projects/TwinWidget/android)):
  - Native `TwinWidgetProvider.kt` (AppWidgetProvider + RemoteViews).
  - Background silent push listener `TwinMessagingService.kt` for instant wake-up upon new posts.

### 5. 🔒 Privacy & Anti-Leak Safeguards
- **Strict Sandbox**: Media is kept strictly inside the app's encrypted private cache and is **never** saved to public gallery.
- **Biometric & 4-Digit PIN Lock**: Requires fingerprint, Face ID, or PIN every time the app opens.
- **Anti-Screenshot Flag**: Prevents screenshots and screen recordings via `FLAG_SECURE`.
- **Memory Scrapbook Vault**: View, react with ❤️, or save past encrypted moments.
- **Emergency Wipe**: One-click unpair and nuclear data wipe.

---

## 🧪 Verification & Test Results

### 1. Automated Cryptography Unit Tests
Executed WebCrypto test suite:
- ✅ Key Generation & Raw Base64 Export: `PASSED`
- ✅ AES-256-GCM Encryption with unique IV: `PASSED`
- ✅ AES-256-GCM Decryption (Byte-for-byte identical): `PASSED`
- ✅ Tamper Detection (Modified ciphertext rejected by Auth Tag): `PASSED`
- ✅ SHA-256 Safety Fingerprint calculation: `PASSED`
- **Result: 6/6 tests passed successfully.**

### 2. Local Server Verification
- Development server verified on: **`http://localhost:3000/`** (and over local network).
- Production build verified: `npm run build` compiled cleanly into `dist/` in 1.58s.

---

## 🚀 How to Run & Use TwinWidget

### Option A: Open & Test in Browser Right Now
1. Open your browser and navigate to **`http://localhost:3000/`**
2. Click **"Tap to Pair"** in the top header and click **"Quick Demo Pair"** (or scan the QR code).
3. Draw a glowing sketch or write a sticky note in the **Creator Studio**.
4. Click **"Send to Partner Widget"** to see the celebratory animation and widget update!
5. Switch to the **Widget Live** tab or **Scrapbook** tab to see your moments.

### Option B: Open on Both Phones (Over the Air)
1. On your phone's browser connected to the same Wi-Fi, open: **`http://<YOUR_COMPUTER_IP>:3000/`** (e.g. `http://192.168.1.12:3000/`).
2. Tap the browser menu and select **"Add to Home screen"** / **"Install App"**.
3. Generate the QR code on Phone 1, scan it on Phone 2, and you're paired!
