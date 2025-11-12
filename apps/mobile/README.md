# Meetily Mobile

Privacy-first meeting assistant for iOS and Android with local Whisper transcription.

## 🎯 Features

- **100% Local Transcription**: Uses whisper.cpp (via whisper-rs) for on-device speech-to-text
- **No Cloud Dependencies**: All processing happens on your device
- **Privacy First**: Your meetings never leave your phone
- **Offline Ready**: Works without internet connection
- **Multiple Models**: Choose between speed (tiny, base) and accuracy (small)

## 🏗️ Architecture

This mobile app is part of the Meetily monorepo and shares code with the desktop app:

```
apps/mobile/
├── src/                    # React UI (Vite + TypeScript)
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main Tauri entry point
│   │   ├── whisper_engine/ # Whisper transcription
│   │   └── audio/         # Audio capture
│   └── Cargo.toml
└── package.json
```

## 📦 Dependencies

### Shared Packages

- `@meetily/shared-ui` - Reusable React components and hooks
- `@meetily/shared-logic` - Business logic, types, and API clients
- `@meetily/i18n` - Internationalization (EN/FR)

### Mobile-Specific

- **Tauri 2.1+**: Cross-platform mobile framework
- **whisper-rs 0.13.2**: Rust bindings for Whisper
- **cpal**: Cross-platform audio library
- **React 18**: UI framework

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Rust 1.70+
- **For iOS**:
  - macOS with Xcode 14+
  - iOS SDK
- **For Android**:
  - Android Studio
  - Android SDK (API 24+)
  - NDK

### Installation

From the monorepo root:

```bash
# Install all dependencies
pnpm install

# Navigate to mobile app
cd apps/mobile
```

### Development

#### Desktop Testing (Quick Testing)

```bash
pnpm run tauri:dev
```

This runs the mobile app on your development machine (not a real mobile device, but useful for quick UI testing).

#### iOS Development

```bash
# First time: Initialize iOS project
pnpm run tauri ios init

# Run on iOS simulator
pnpm run tauri:ios

# Build for iOS device
pnpm run tauri:ios:build
```

#### Android Development

```bash
# First time: Initialize Android project
pnpm run tauri android init

# Run on Android emulator/device
pnpm run tauri:android

# Build APK
pnpm run tauri:android:build
```

## 📱 Platform-Specific Configuration

### iOS Permissions

The app requires microphone access. Add to `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Meetily needs microphone access to transcribe your meetings locally</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

### Android Permissions

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

## 🤖 Whisper Models

The app supports three Whisper models:

| Model   | Size | Speed         | Accuracy | Recommended |
|---------|------|---------------|----------|-------------|
| Tiny    | 40MB | Real-time     | Good     | No          |
| **Base**| 75MB | 2-3x realtime | Better   | **Yes**     |
| Small   | 200MB| 4-5x realtime | Best     | No          |

Models are downloaded on first use from Hugging Face and stored locally.

### Model Storage

- **iOS**: `~/Documents/models/`
- **Android**: `/data/models/`

## 🔧 Development Status

This is **Phase 2 of the mobile migration** (currently in progress).

### ✅ Completed (Phase 2, Week 3)

- [x] Basic Tauri mobile app structure
- [x] MobileWhisperEngine wrapper
- [x] Model download system
- [x] Basic audio capture
- [x] Placeholder UI

### 🚧 In Progress (Phase 2, Weeks 4-6)

- [ ] Full audio capture with VAD
- [ ] Whisper integration and transcription
- [ ] Complete UI/UX (Setup + Recording screens)
- [ ] Performance optimization
- [ ] iOS Core ML acceleration
- [ ] Android NNAPI acceleration

### 📅 Future (Phase 3-4)

- [ ] Backend sync
- [ ] TestFlight deployment
- [ ] Google Play deployment

## 🐛 Troubleshooting

### Model Download Fails

- Check internet connection
- Verify storage space (75-200MB needed)
- Check logs for specific error

### Audio Not Capturing

- **iOS**: Grant microphone permission in Settings
- **Android**: Grant RECORD_AUDIO permission

### Build Fails

- Ensure all prerequisites are installed
- Run `pnpm install` from monorepo root
- Check Rust version: `rustc --version` (need 1.70+)
- For iOS: Verify Xcode installation
- For Android: Verify Android SDK/NDK paths

## 📚 Related Documentation

- [IMPLEMENTATION_GUIDE_PHASES_2-4.md](../../IMPLEMENTATION_GUIDE_PHASES_2-4.md) - Full implementation guide
- [MOBILE_WHISPER_LOCAL_STRATEGY.md](../../MOBILE_WHISPER_LOCAL_STRATEGY.md) - Whisper strategy details
- [MOBILE_ARCHITECTURE.md](../../MOBILE_ARCHITECTURE.md) - Architecture overview
- [Desktop README](../desktop/README.md) - Desktop app documentation

## 🤝 Contributing

See the main [monorepo README](../../README.md) for contribution guidelines.

## 📄 License

Same as main Meetily project.
