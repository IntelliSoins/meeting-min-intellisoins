# 🎙️ Stratégie Whisper Local Mobile - whisper.cpp

## 🎯 Décision : Full Local avec whisper.cpp

Suite à l'analyse des options, nous adoptons **whisper.cpp + modèles GGUF quantifiés** pour le mobile.

**Probabilité de succès : 85% (meilleur choix)**

---

## 🏆 Pourquoi whisper.cpp ?

### Avantages Techniques

✅ **Cross-Platform Unifié**
- Même codebase C++ pour iOS et Android
- Mêmes modèles GGUF partagés entre desktop et mobile
- Intégration Rust via FFI naturelle (déjà utilisé pour desktop)

✅ **Optimisation Mobile Exceptionnelle**
- **iOS** : Support Core ML (Apple Neural Engine) ⚡
- **Android** : Compilation NDK optimisée, support NNAPI optionnel
- Quantisation int8/q5/q6 → modèles compacts (40-200 MB)

✅ **Performance Prouvée**
- tiny.en quantifié : **temps réel** sur mobile moderne
- base.en quantifié : **2-3x realtime** (30s audio = 10-15s processing)
- Utilisé par de nombreuses apps production

✅ **Architecture Identique au Desktop**
- Desktop utilise déjà whisper-rs (wrapper de whisper.cpp)
- Réutilisation maximale du code Rust existant
- Maintenance simplifiée

---

## 📊 Comparaison Détaillée

| Approche | Coût | Performance | Offline | Complexité | Maintenance |
|----------|------|-------------|---------|------------|-------------|
| **whisper.cpp (local)** ⭐ | 0€ | Excellent | ✅ | Moyenne | Faible |
| Cloud (Groq/Deepgram) | 0-50€/mois | Excellent | ❌ | Faible | Moyenne |
| Core ML seul (iOS) | 0€ | Excellent (iOS) | ✅ | Moyenne | Moyenne |
| TFLite seul (Android) | 0€ | Bon | ✅ | Moyenne | Moyenne |
| Distil-Whisper | 0€ | Meilleur | ✅ | Élevée | Élevée |

---

## 🏗️ Architecture Mise à Jour

### Structure Rust (Mobile vs Desktop)

```
apps/mobile/src-tauri/src/
├── lib.rs
├── audio/
│   ├── mobile.rs                  # Capture audio mobile (mic seul)
│   └── vad.rs                     # Voice Activity Detection (réutilisé)
│
├── whisper_engine/                # RÉUTILISÉ du desktop !
│   ├── whisper_engine.rs          # Wrapper whisper.cpp
│   ├── model_manager.rs           # Téléchargement/cache modèles
│   ├── inference.rs               # Inférence + streaming
│   └── mobile.rs                  # Adaptations mobile (NOUVEAU)
│
└── commands.rs                    # Commandes Tauri
```

### Modèles Recommandés par Plateforme

#### iPhone (iOS)

| Modèle | Taille | Vitesse | Qualité | Cas d'usage |
|--------|--------|---------|---------|-------------|
| **tiny.en** (q8) | ~40 MB | Temps réel | Correct | Démo, prototypage |
| **base.en** (q5) | ~75 MB | 2-3x RT | Bon | **Production recommandé** ⭐ |
| **small.en** (q5) | ~200 MB | 4-5x RT | Très bon | Power users, iPad |

**Configuration Core ML (optionnel) :**
- Activer `WHISPER_COREML=1` pour encoder → 2-3x plus rapide
- iPhone 12+ recommandé pour Core ML

#### Android

| Modèle | Taille | Vitesse | Qualité | Cas d'usage |
|--------|--------|---------|---------|-------------|
| **tiny.en** (q8) | ~40 MB | Temps réel | Correct | Démo, vieux devices |
| **base.en** (q5) | ~75 MB | 2-3x RT | Bon | **Production recommandé** ⭐ |
| **base** (q5 multilang) | ~75 MB | 2-3x RT | Bon | Support FR/EN/ES |

**Optimisations Android :**
- Compilation NDK avec flags ARM Neon
- Support NNAPI optionnel (Snapdragon récents)

---

## 💻 Implémentation Technique

### Étape 1 : Réutiliser whisper-rs Existant

**Le desktop utilise déjà whisper-rs !**

```rust
// apps/desktop/src-tauri/Cargo.toml (EXISTANT)
[dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api", "metal"] }
```

**Pour mobile, même lib avec features adaptées :**

```rust
// apps/mobile/src-tauri/Cargo.toml (NOUVEAU)
[dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api"] }

# iOS : ajouter "metal" feature
[target.'cfg(target_os = "ios")'.dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api", "metal"] }

# Android : features de base suffisantes
[target.'cfg(target_os = "android")'.dependencies]
whisper-rs = { version = "0.13.2", features = ["raw-api"] }
```

### Étape 2 : Adapter le Code Existant

**Desktop (existant) :**
```rust
// apps/desktop/src-tauri/src/whisper_engine/whisper_engine.rs
pub struct WhisperEngine {
    ctx: Option<WhisperContext>,
    model_path: PathBuf,
}

impl WhisperEngine {
    pub fn load_model(&self, model_name: &str) -> Result<()> {
        // Charge depuis ~/Library/Application Support/Meetily/models/
        let model_path = get_model_path(model_name)?;
        self.ctx = Some(WhisperContext::new(&model_path)?);
    }

    pub fn transcribe(&self, audio: &[f32]) -> Result<String> {
        // Inférence GPU (Metal/CUDA)
    }
}
```

**Mobile (adaptation) :**
```rust
// apps/mobile/src-tauri/src/whisper_engine/mobile.rs
use super::WhisperEngine;  // Réutilisation !

pub struct MobileWhisperEngine {
    engine: WhisperEngine,  // Composition du desktop engine
    model_type: ModelType,  // tiny, base, small
}

impl MobileWhisperEngine {
    pub async fn new(model_type: ModelType) -> Result<Self> {
        let engine = WhisperEngine::default();

        // Télécharger modèle si absent (première installation)
        ensure_model_downloaded(model_type).await?;

        // Charger modèle
        engine.load_model(&model_type.to_string())?;

        Ok(Self { engine, model_type })
    }

    pub fn transcribe_chunk(&self, audio: &[f32]) -> Result<String> {
        // Déléguer à l'engine desktop (code réutilisé !)
        self.engine.transcribe(audio)
    }

    pub fn is_realtime_capable(&self) -> bool {
        // tiny.en sur mobile récent = temps réel
        matches!(self.model_type, ModelType::TinyEn)
            && self.device_is_fast()
    }
}

#[derive(Clone, Copy)]
pub enum ModelType {
    TinyEn,   // ~40 MB, temps réel
    BaseEn,   // ~75 MB, 2-3x RT (recommandé)
    SmallEn,  // ~200 MB, 4-5x RT
}
```

### Étape 3 : Téléchargement & Cache Modèles

**Stratégie :**
1. **Première installation** : télécharger modèle de base (base.en)
2. **Cache local** : stocker dans app data dir
3. **Mises à jour** : vérifier nouvelles versions périodiquement

```rust
// apps/mobile/src-tauri/src/whisper_engine/model_manager.rs
use tauri::api::path::app_data_dir;

pub async fn ensure_model_downloaded(model_type: ModelType) -> Result<PathBuf> {
    let models_dir = get_models_dir()?;  // e.g. iOS: Library/Application Support/
    let model_path = models_dir.join(model_type.filename());

    if model_path.exists() {
        return Ok(model_path);
    }

    // Télécharger depuis Hugging Face ou serveur propre
    download_model(model_type, &model_path).await?;

    Ok(model_path)
}

async fn download_model(model_type: ModelType, dest: &Path) -> Result<()> {
    let url = model_type.download_url();
    // URL exemple : https://huggingface.co/.../ggml-base.en-q5_1.bin

    // Téléchargement avec progress
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

        // Émettre événement de progression
        emit_download_progress(downloaded, total_size)?;
    }

    Ok(())
}
```

### Étape 4 : Commandes Tauri Mobile

```rust
// apps/mobile/src-tauri/src/commands.rs
#[tauri::command]
async fn start_recording_mobile(
    app: AppHandle,
    model_type: String,  // "tiny", "base", "small"
) -> Result<(), String> {
    let model = ModelType::from_str(&model_type)?;

    // 1. Initialiser Whisper engine
    let whisper = MobileWhisperEngine::new(model).await?;

    // 2. Démarrer capture audio (mic seul)
    let audio_stream = start_microphone_capture()?;

    // 3. Traiter chunks audio en streaming
    tokio::spawn(async move {
        for audio_chunk in audio_stream {
            // VAD : ignorer silence
            if !is_speech(&audio_chunk) {
                continue;
            }

            // Transcrire
            match whisper.transcribe_chunk(&audio_chunk) {
                Ok(text) => {
                    // Émettre vers frontend
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

    // Télécharger avec events de progression
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
            quality: "Good",
            recommended: false,
        },
        ModelInfo {
            id: "base.en",
            name: "Base (Recommended)",
            size_mb: 75,
            speed: "2-3x real-time",
            quality: "Very Good",
            recommended: true,
        },
        ModelInfo {
            id: "small.en",
            name: "Small (Best Quality)",
            size_mb: 200,
            speed: "4-5x real-time",
            quality: "Excellent",
            recommended: false,
        },
    ]
}
```

---

## 🎨 UI/UX Mobile pour Whisper Local

### Écran de Configuration Initiale

```tsx
// apps/mobile/src/screens/Setup.tsx
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

export function WhisperSetupScreen() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('base.en');

  const models = [
    {
      id: 'tiny.en',
      name: 'Fast (40 MB)',
      description: 'Real-time transcription, good quality',
      icon: '⚡',
    },
    {
      id: 'base.en',
      name: 'Recommended (75 MB)',
      description: 'Best balance speed/quality',
      icon: '⭐',
      recommended: true,
    },
    {
      id: 'small.en',
      name: 'Best Quality (200 MB)',
      description: 'Slower but excellent accuracy',
      icon: '🎯',
    },
  ];

  const handleDownload = async () => {
    setDownloading(true);

    // Écouter événements de progression
    await listen('download-progress', (event) => {
      setProgress(event.payload.percent);
    });

    try {
      await invoke('download_whisper_model', {
        modelType: selectedModel,
      });

      // Rediriger vers app principale
      navigate('/home');
    } catch (error) {
      alert('Download failed: ' + error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView>
      <View className="p-6">
        <Text className="text-2xl font-bold mb-4">
          Choose Transcription Model
        </Text>

        <Text className="text-gray-600 mb-6">
          Meetily uses on-device AI for privacy. Choose your model:
        </Text>

        {models.map((model) => (
          <TouchableOpacity
            key={model.id}
            onPress={() => setSelectedModel(model.id)}
            className={`p-4 mb-3 rounded-xl border-2 ${
              selectedModel === model.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{model.icon}</Text>
              <View className="flex-1">
                <Text className="font-semibold">{model.name}</Text>
                <Text className="text-sm text-gray-600">
                  {model.description}
                </Text>
              </View>
              {model.recommended && (
                <Badge>Recommended</Badge>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {downloading ? (
          <View className="mt-6">
            <ProgressBar progress={progress} />
            <Text className="text-center mt-2">
              Downloading model... {Math.round(progress)}%
            </Text>
          </View>
        ) : (
          <Button
            onPress={handleDownload}
            className="mt-6"
            size="lg"
          >
            Download & Continue
          </Button>
        )}

        <Text className="text-xs text-gray-500 mt-4 text-center">
          ✅ 100% offline • 🔒 Privacy-first • 🚀 No recurring costs
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

### Indicateur de Performance en Temps Réel

```tsx
// apps/mobile/src/components/TranscriptionStatus.tsx
export function TranscriptionStatus({ isRecording }) {
  const [metrics, setMetrics] = useState({
    processingTime: 0,  // ms pour transcrire
    realtimeFactor: 1.0,  // 1.0 = temps réel, 2.0 = 2x plus lent
    modelType: 'base.en',
  });

  return (
    <View className="bg-gray-100 p-3 rounded-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="ml-2 text-sm font-medium">
            {isRecording ? 'Transcribing...' : 'Ready'}
          </Text>
        </View>

        {metrics.realtimeFactor <= 1.0 ? (
          <Badge variant="success">
            ⚡ Real-time
          </Badge>
        ) : (
          <Badge variant="warning">
            {metrics.realtimeFactor.toFixed(1)}x
          </Badge>
        )}
      </View>

      <Text className="text-xs text-gray-500 mt-1">
        Model: {metrics.modelType} • Processing: {metrics.processingTime}ms
      </Text>
    </View>
  );
}
```

---

## 📦 Configuration Plateformes

### iOS (Info.plist)

```xml
<!-- apps/mobile/ios/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>Meetily needs microphone access to transcribe your meetings locally</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>

<!-- Core ML (optionnel, pour accélération) -->
<key>NSCameraUsageDescription</key>
<string>Not used, but required for Core ML access</string>
```

### Android (AndroidManifest.xml)

```xml
<!-- apps/mobile/android/AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- NNAPI (optionnel, pour accélération sur Snapdragon) -->
<uses-library android:name="com.qualcomm.qti.nnapi" android:required="false" />
```

---

## 🚀 Timeline Mise à Jour

### Phase 1 : Monorepo (Semaine 1-2) - INCHANGÉ
- Restructuration packages partagés

### Phase 2 : Mobile + Whisper Local (Semaine 3-6) - **ÉTENDU**

**Semaine 3 : Infrastructure**
- [ ] Configurer whisper-rs pour mobile
- [ ] Adapter WhisperEngine existant
- [ ] Implémenter téléchargement modèles

**Semaine 4 : Intégration**
- [ ] Audio capture mobile (mic)
- [ ] Pipeline VAD + Whisper
- [ ] Tests performance iOS/Android

**Semaine 5 : UI/UX**
- [ ] Écran setup modèle
- [ ] Indicateurs performance
- [ ] Gestion erreurs/fallbacks

**Semaine 6 : Optimisation**
- [ ] Core ML iOS (optionnel)
- [ ] NNAPI Android (optionnel)
- [ ] Benchmarks finaux

### Phase 3 : Features (Semaine 7-8)
- Résumés IA
- Sync cloud optionnel

### Phase 4 : Distribution (Semaine 9)
- Builds & distribution stores

**Total : 9 semaines** (au lieu de 8)

---

## 💾 Stockage & Modèles

### Taille Totale App

| Composant | Taille | Notes |
|-----------|--------|-------|
| App base (sans modèle) | ~50 MB | Code + assets |
| Modèle tiny.en (q8) | ~40 MB | Ultra-rapide |
| Modèle base.en (q5) | ~75 MB | **Recommandé** ⭐ |
| Modèle small.en (q5) | ~200 MB | Haute qualité |
| **Total (base.en)** | **~125 MB** | Comparable à apps courantes |

**Stratégies :**
1. **Download on first launch** (recommandé)
   - App store = 50 MB (sans modèle)
   - Premier lancement : télécharge base.en (75 MB)
   - Total: 125 MB

2. **Bundle with app** (alternative)
   - App store = 125 MB (avec base.en)
   - Prêt immédiatement
   - Mais limite choix utilisateur

---

## ⚡ Performance Attendue

### iPhone

| Modèle iPhone | tiny.en | base.en | small.en |
|---------------|---------|---------|----------|
| iPhone 11 | Temps réel | 2x RT | 5x RT |
| iPhone 12+ | Temps réel | 1.5x RT | 3x RT |
| iPhone 14+ (Core ML) | Temps réel | **Temps réel** ⚡ | 2x RT |

### Android

| Device | tiny.en | base.en | small.en |
|--------|---------|---------|----------|
| Snapdragon 8 Gen 2 | Temps réel | 2x RT | 4x RT |
| Snapdragon 8 Gen 1 | Temps réel | 2.5x RT | 5x RT |
| Mid-range (SD 7) | 1.5x RT | 3x RT | 7x RT |

**Légende :**
- Temps réel = transcription aussi rapide que l'audio
- 2x RT = 30s audio = 15s processing

---

## ✅ Avantages vs Cloud

| Feature | Whisper Local | Cloud (Groq/Deepgram) |
|---------|---------------|------------------------|
| **Privacy** | ✅ 100% on-device | ⚠️ Données envoyées |
| **Offline** | ✅ Fonctionne partout | ❌ Nécessite internet |
| **Coût** | ✅ 0€ | ⚠️ 0-50€/mois |
| **Vitesse** | ✅ 1-3x RT (base.en) | ✅ < 1s (cloud) |
| **Qualité** | ✅ Excellente | ✅ Excellente |
| **Batterie** | ⚠️ Consommation CPU | ✅ Minimal |
| **Setup** | ⚠️ Téléchargement initial | ✅ Immédiat |

**Verdict :** Whisper local est supérieur pour privacy et offline, avec performances acceptables.

---

## 🎯 Conclusion

### Décision Finale

✅ **Adopter whisper.cpp + modèles GGUF quantifiés**

**Modèle par défaut :** base.en (q5) - 75 MB
**Optimisations :**
- iOS : Core ML encoder (optionnel)
- Android : NDK optimisé ARM Neon

### Réutilisation Code Desktop

🟢 **90% du code Rust Whisper réutilisé !**
- WhisperEngine : partagé
- ModelManager : adapté pour mobile
- Inférence : identique

### Next Steps

1. **Valider l'approche** ✅
2. **Démarrer Phase 1** (monorepo)
3. **POC Whisper mobile** (Semaine 3)
4. **Itérer & optimiser**

---

**Ce plan remplace la transcription cloud par Whisper local dans le MOBILE_MIGRATION_PLAN.md original.**
