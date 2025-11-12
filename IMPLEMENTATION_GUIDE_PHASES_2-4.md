# 🚀 Guide d'Implémentation Phases 2-4

## ✅ Phase 1 : Terminée

La structure monorepo de base a été créée :

```
meeting-min-intellisoins/
├── packages/
│   ├── shared-ui/          ✅ Créé (structure hooks de base)
│   ├── shared-logic/       ✅ Créé (API, types, utils, services)
│   └── i18n/               ✅ Créé (messages EN/FR migrés)
│
├── apps/
│   └── desktop/            ✅ Migré (frontend → apps/desktop)
│
├── pnpm-workspace.yaml     ✅ Créé
└── package.json           ✅ Configuré (monorepo root)
```

### Ce qui reste (raffinements Phase 1)

1. **Mettre à jour imports desktop** (optionnel, progressif)
   - Remplacer imports `../../messages/` par `@meetily/i18n/messages/`
   - Utiliser `@meetily/shared-logic` pour types/API
   - Utiliser `@meetily/shared-ui` pour hooks

2. **Installer dépendances**
   ```bash
   pnpm install
   ```

3. **Tester que desktop fonctionne**
   ```bash
   cd apps/desktop
   pnpm run tauri:dev
   ```

---

## 📱 Phase 2 : Mobile + Whisper Local (4 semaines)

### Semaine 3 : Infrastructure Whisper

#### 2.1 : Initialiser Tauri Mobile

```bash
cd apps
pnpm create tauri-app mobile

# Sélectionner:
# - Template: React + TypeScript
# - Package manager: pnpm
```

#### 2.2 : Configurer whisper-rs Mobile

**apps/mobile/src-tauri/Cargo.toml :**
```toml
[dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api"] }

# iOS
[target.'cfg(target_os = "ios")'.dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api", "metal"] }

# Android
[target.'cfg(target_os = "android")'.dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api"] }
```

#### 2.3 : Créer Lien Symbolique vers whisper_engine Desktop

**Option A : Lien symbolique (recommandé)**
```bash
cd apps/mobile/src-tauri/src
ln -s ../../../desktop/src-tauri/src/whisper_engine whisper_engine
```

**Option B : Copier le code**
```bash
cp -r apps/desktop/src-tauri/src/whisper_engine apps/mobile/src-tauri/src/
```

#### 2.4 : Créer MobileWhisperEngine

**apps/mobile/src-tauri/src/whisper_engine/mobile.rs :**
```rust
use super::whisper_engine::WhisperEngine;
use anyhow::Result;

pub struct MobileWhisperEngine {
    engine: WhisperEngine,
    model_type: ModelType,
}

#[derive(Clone, Copy)]
pub enum ModelType {
    TinyEn,   // 40 MB
    BaseEn,   // 75 MB
    SmallEn,  // 200 MB
}

impl MobileWhisperEngine {
    pub async fn new(model_type: ModelType) -> Result<Self> {
        let mut engine = WhisperEngine::default();

        // Télécharger modèle si absent
        ensure_model_downloaded(model_type).await?;

        // Charger
        engine.load_model(&model_type.to_string())?;

        Ok(Self { engine, model_type })
    }

    pub fn transcribe_chunk(&self, audio: &[f32]) -> Result<String> {
        // Déléguer au desktop engine
        self.engine.transcribe(audio)
    }
}

async fn ensure_model_downloaded(model_type: ModelType) -> Result<PathBuf> {
    let models_dir = get_models_dir()?;
    let model_path = models_dir.join(model_type.filename());

    if !model_path.exists() {
        download_model(model_type, &model_path).await?;
    }

    Ok(model_path)
}

async fn download_model(model_type: ModelType, dest: &Path) -> Result<()> {
    let url = model_type.download_url();
    // URL: https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en-q5_1.bin

    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;
    let total_size = response.content_length().unwrap_or(0);

    let mut file = File::create(dest)?;
    let mut downloaded = 0u64;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        file.write_all(&chunk)?;
        downloaded += chunk.len() as u64;

        emit_download_progress(downloaded, total_size)?;
    }

    Ok(())
}
```

#### 2.5 : Commandes Tauri Mobile

**apps/mobile/src-tauri/src/commands.rs :**
```rust
#[tauri::command]
async fn start_recording_mobile(
    app: AppHandle,
    model_type: String,  // "tiny", "base", "small"
) -> Result<(), String> {
    let model = ModelType::from_str(&model_type)?;

    // 1. Init Whisper
    let whisper = MobileWhisperEngine::new(model).await?;

    // 2. Capture audio (mic seul)
    let audio_stream = start_microphone_capture()?;

    // 3. Transcrire
    tokio::spawn(async move {
        for audio_chunk in audio_stream {
            if !is_speech(&audio_chunk) { continue; }

            match whisper.transcribe_chunk(&audio_chunk) {
                Ok(text) => {
                    app.emit("transcript-update", TranscriptUpdate {
                        text,
                        timestamp: Utc::now(),
                        is_final: true,
                    }).ok();
                }
                Err(e) => log::error!("Transcription error: {}", e),
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn download_whisper_model(
    app: AppHandle,
    model_type: String,
) -> Result<(), String> {
    let model = ModelType::from_str(&model_type)?;
    ensure_model_downloaded(model).await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_available_models() -> Vec<ModelInfo> {
    vec![
        ModelInfo {
            id: "tiny.en",
            name: "Tiny (Fast)",
            size_mb: 40,
            speed: "Real-time",
            recommended: false,
        },
        ModelInfo {
            id: "base.en",
            name: "Base (Recommended)",
            size_mb: 75,
            speed: "2-3x real-time",
            recommended: true,
        },
        ModelInfo {
            id: "small.en",
            name: "Small (Best Quality)",
            size_mb: 200,
            speed: "4-5x real-time",
            recommended: false,
        },
    ]
}
```

### Semaine 4 : Intégration Audio

#### 2.6 : Audio Capture Mobile

**apps/mobile/src-tauri/src/audio/mobile.rs :**
```rust
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

pub fn start_microphone_capture() -> Result<AudioStream> {
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or("No microphone found")?;

    let config = device.default_input_config()?;

    let stream = device.build_input_stream(
        &config.into(),
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // Envoyer vers pipeline VAD + Whisper
            process_audio_chunk(data);
        },
        |err| log::error!("Audio error: {}", err),
        None,
    )?;

    stream.play()?;
    Ok(AudioStream { stream })
}

fn process_audio_chunk(data: &[f32]) {
    // VAD : ignorer silence
    if !is_speech(data) {
        return;
    }

    // Buffer jusqu'à 30s
    // Puis envoyer vers Whisper
}
```

#### 2.7 : Configuration Permissions

**iOS (apps/mobile/ios/Info.plist) :**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Meetily needs microphone access to transcribe your meetings locally</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

**Android (apps/mobile/android/AndroidManifest.xml) :**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

### Semaine 5 : UI/UX Mobile

#### 2.8 : Écran Setup Modèle

**apps/mobile/src/screens/Setup.tsx :**
```tsx
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function WhisperSetupScreen() {
  const t = useTranslations('settings');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('base.en');

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await invoke('download_whisper_model', {
        modelType: selectedModel,
      });
      navigate('/home');
    } catch (error) {
      alert('Download failed: ' + error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView>
      <Text className="text-2xl font-bold">
        {t('chooseModel')}
      </Text>

      {/* Liste modèles avec sélection */}

      {downloading ? (
        <ProgressBar progress={progress} />
      ) : (
        <Button onPress={handleDownload}>
          {t('downloadContinue')}
        </Button>
      )}
    </SafeAreaView>
  );
}
```

#### 2.9 : Écran Enregistrement

**apps/mobile/src/screens/Recording.tsx :**
```tsx
import { RecordingControls } from '@meetily/shared-ui';
import { useRecording } from '@meetily/shared-ui';

export function RecordingScreen() {
  const { isRecording, start, stop } = useRecording('local');
  const [transcripts, setTranscripts] = useState([]);

  useEffect(() => {
    const unlisten = listen('transcript-update', (event) => {
      setTranscripts(prev => [...prev, event.payload]);
    });

    return () => { unlisten.then(fn => fn()); };
  }, []);

  return (
    <SafeAreaView>
      <RecordingControls
        variant="mobile"
        onStart={start}
        onStop={stop}
      />

      <TranscriptView transcripts={transcripts} />
    </SafeAreaView>
  );
}
```

### Semaine 6 : Optimisation

#### 2.10 : Core ML iOS (Optionnel)

**Activer dans Cargo.toml :**
```toml
[target.'cfg(target_os = "ios")'.dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api", "metal", "coreml"] }
```

**Build avec Core ML :**
```bash
WHISPER_COREML=1 pnpm tauri ios build
```

#### 2.11 : NNAPI Android (Optionnel)

**AndroidManifest.xml :**
```xml
<uses-library android:name="com.qualcomm.qti.nnapi" android:required="false" />
```

---

## 🔄 Phase 3 : Features (2 semaines)

### Semaine 7-8 : Backend & Sync

#### 3.1 : Backend Endpoint Résumés

**backend/app/routers/summary.py :**
```python
@router.post("/api/meetings/{meeting_id}/summary")
async def generate_summary(
    meeting_id: str,
    provider: str = "ollama",
    model: str = "llama3.2"
):
    meeting = await db.get_meeting(meeting_id)
    transcript = meeting.transcript

    if provider == "ollama":
        summary = await ollama_summarize(transcript, model)
    elif provider == "claude":
        summary = await claude_summarize(transcript, model)

    await db.update_meeting(meeting_id, {"summary": summary})
    return {"summary": summary}
```

#### 3.2 : Sync Cloud (Optionnel)

**packages/shared-logic/src/services/sync.service.ts :**
```typescript
export class SyncService {
  async syncMeetings(): Promise<void> {
    // Upload meetings locaux vers cloud
    // Download meetings cloud vers local
    // Résoudre conflits
  }
}
```

---

## 🚀 Phase 4 : Distribution (1 semaine)

### Semaine 9 : Builds & CI/CD

#### 4.1 : Build iOS

```bash
cd apps/mobile
pnpm tauri ios build

# Output: gen/apple/Meetily.ipa
```

**TestFlight :**
1. Xcode → Product → Archive
2. Distribute → TestFlight
3. Upload

#### 4.2 : Build Android

```bash
pnpm tauri android build --release

# Output: gen/android/app/build/outputs/apk/release/app-release.apk
```

**Google Play :**
1. Play Console → Create App
2. Upload APK/AAB
3. Internal testing → Production

#### 4.3 : CI/CD GitHub Actions

**Créer .github/workflows/build-mobile.yml :**
```yaml
name: Build Mobile Apps

on:
  push:
    branches: [main, 'mobile/**']

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Build iOS
        run: |
          cd apps/mobile
          pnpm install
          pnpm tauri ios build
      - uses: actions/upload-artifact@v4
        with:
          name: meetily-ios
          path: apps/mobile/gen/apple/*.ipa

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Build Android
        run: |
          cd apps/mobile
          pnpm install
          pnpm tauri android build --release
      - uses: actions/upload-artifact@v4
        with:
          name: meetily-android
          path: apps/mobile/gen/android/app/build/outputs/apk/release/*.apk
```

---

## 📝 Checklist Complète

### Phase 1 (Complétée)
- [x] Structure monorepo
- [x] Packages shared-ui/shared-logic/i18n
- [x] Migration desktop vers apps/
- [ ] Raffiner imports (optionnel)

### Phase 2 (À faire)
- [ ] Init Tauri mobile
- [ ] Config whisper-rs mobile
- [ ] Audio capture mobile
- [ ] MobileWhisperEngine
- [ ] Téléchargement modèles
- [ ] UI setup & recording
- [ ] Optimisations (Core ML/NNAPI)

### Phase 3 (À faire)
- [ ] Backend endpoints résumés
- [ ] Sync cloud (optionnel)

### Phase 4 (À faire)
- [ ] Builds iOS/Android
- [ ] TestFlight + Google Play
- [ ] CI/CD mobile

---

## 🎯 Prochaines Actions Immédiates

1. **Tester Phase 1** : `cd apps/desktop && pnpm install && pnpm run tauri:dev`
2. **Committer Phase 1** : Structure monorepo de base
3. **Démarrer Phase 2** : Initialiser apps/mobile avec Tauri

**Timeline estimée totale : 9 semaines**
- Phase 1 : ✅ Terminée (structure)
- Phase 2 : 4 semaines (mobile + Whisper)
- Phase 3 : 2 semaines (features)
- Phase 4 : 1 semaine (distribution)

---

Voir aussi :
- MOBILE_MIGRATION_PLAN_V2.md - Plan général
- MOBILE_WHISPER_LOCAL_STRATEGY.md - Détails Whisper
- MOBILE_ARCHITECTURE.md - Architecture technique
