# 📱 Plan de Migration Mobile V2 : iOS & Android avec Whisper Local

> **Mise à jour majeure :** Ce document remplace la stratégie cloud par **Whisper local (whisper.cpp)**.

## 🎯 Changement de Stratégie : Full Local

### Décision

❌ ~~Transcription cloud (Groq/Deepgram)~~
✅ **Whisper local avec whisper.cpp + modèles GGUF**

**Raisons :**
1. 🔒 **Privacy-first** : 100% on-device, données jamais envoyées
2. 📡 **Offline-ready** : Fonctionne sans internet
3. 💰 **Zero cost** : Pas de frais cloud récurrents
4. ♻️ **Réutilisation code** : 90% du Rust desktop partagé
5. ⚡ **Performance** : 1-3x realtime avec modèles quantifiés

---

## 📊 Comparaison Mise à Jour

### Option 1 : Tauri Mobile + Whisper Local ⭐⭐⭐ (SÉLECTIONNÉ)

**Score global : 95/100**

| Critère | Score | Détails |
|---------|-------|---------|
| Réutilisation code | 🟢 90% | Frontend React + Rust Whisper partagés |
| Privacy | 🟢 100% | Full on-device, aucune donnée externe |
| Performance | 🟢 95% | base.en = 2-3x RT, tiny.en = temps réel |
| Offline | 🟢 100% | Fonctionne partout |
| Coût | 🟢 100% | 0€ récurrent |
| Complexité | 🟡 60% | whisper.cpp + optimisations plateformes |
| Stabilité | 🟡 75% | Tauri Mobile beta, whisper.cpp stable |

**Effort total : 9 semaines** (au lieu de 8)

---

### Option 2 : Tauri Mobile + Cloud (Précédent plan)

**Score global : 75/100**

| Critère | Score | Détails |
|---------|-------|---------|
| Réutilisation code | 🟢 85% | Frontend React + API backend |
| Privacy | 🔴 50% | Données envoyées à Groq/Deepgram |
| Performance | 🟢 100% | < 1s cloud |
| Offline | 🔴 0% | Nécessite internet |
| Coût | 🟡 80% | Groq gratuit, mais limites |
| Complexité | 🟢 90% | Simple, API calls |
| Stabilité | 🟢 95% | Groq/Deepgram production-ready |

**Effort total : 8 semaines**

---

## 🏗️ Architecture Mise à Jour

### Flux de Données Mobile (Whisper Local)

```
┌─────────────┐
│   Micro     │ (System audio ❌ impossible OS)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Mobile Audio    │
│  (Tauri Plugin)  │
│  - Mic capture   │
│  - VAD filtering │
└─────────┬────────┘
          │
          │ Audio chunks (30s)
          ▼
┌──────────────────┐
│  whisper.cpp     │
│  (Local Rust)    │
│  - base.en (75MB)│
│  - 2-3x realtime │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│  Transcription   │
│  Temps Réel      │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│  SQLite Local    │
│  + Backend API   │
│  (Résumés IA)    │
└──────────────────┘
```

**Différence clé vs Desktop :**
- Desktop : Whisper GPU (Metal/CUDA) = ultra rapide
- Mobile : Whisper CPU quantifié = 2-3x realtime (acceptable)

---

## 📦 Structure Monorepo (Inchangée)

```
meeting-min-intellisoins/
├── packages/
│   ├── shared-ui/              # Composants React
│   ├── shared-logic/           # API, types, utils
│   └── i18n/                   # Traductions EN/FR
│
├── apps/
│   ├── desktop/                # Tauri Desktop (existant)
│   │   └── src-tauri/
│   │       └── src/
│   │           └── whisper_engine/  # ← Code réutilisé !
│   │
│   └── mobile/                 # Tauri Mobile (nouveau)
│       ├── src/                # React
│       └── src-tauri/
│           └── src/
│               ├── audio/
│               │   └── mobile.rs           # Audio capture mobile
│               └── whisper_engine/         # ← Lien symbolique ou copie
│                   ├── whisper_engine.rs   # RÉUTILISÉ
│                   ├── model_manager.rs    # RÉUTILISÉ
│                   └── mobile.rs           # NOUVEAU (adaptations)
│
└── backend/                    # FastAPI (existant)
```

---

## 📅 Timeline Mise à Jour : 9 Semaines

### Phase 1 : Monorepo (Semaine 1-2) - INCHANGÉ
**Effort : 80h**

- [ ] Créer structure packages/
- [ ] Extraire shared-ui
- [ ] Extraire shared-logic
- [ ] Migrer i18n
- [ ] Tester desktop (no regression)

**Livrable :** Monorepo fonctionnel

---

### Phase 2 : Mobile + Whisper Local (Semaine 3-6) - **MODIFIÉ**
**Effort : 160h (au lieu de 120h)**

#### Semaine 3 : Infrastructure Whisper
- [ ] Configurer whisper-rs pour mobile (iOS + Android)
- [ ] Créer MobileWhisperEngine (wrapper)
- [ ] Implémenter téléchargement modèles GGUF
- [ ] Tests download base.en (75 MB)

#### Semaine 4 : Intégration Audio
- [ ] Audio capture mobile (mic seul)
- [ ] Pipeline VAD + Whisper
- [ ] Streaming transcription
- [ ] Tests performance devices

#### Semaine 5 : UI/UX Mobile
- [ ] Écran setup modèle (tiny/base/small)
- [ ] Progress bar téléchargement
- [ ] Indicateurs performance temps réel
- [ ] Gestion erreurs

#### Semaine 6 : Optimisation
- [ ] Core ML iOS (optionnel, +50% vitesse)
- [ ] NNAPI Android (optionnel)
- [ ] Benchmarks finaux
- [ ] Ajustements modèles

**Livrable :** App mobile avec Whisper local fonctionnel

---

### Phase 3 : Features (Semaine 7-8) - INCHANGÉ
**Effort : 80h**

- [ ] Résumés IA (backend)
- [ ] Sync cloud optionnel
- [ ] Partage meetings (optionnel)

**Livrable :** Features complètes

---

### Phase 4 : Distribution (Semaine 9) - INCHANGÉ
**Effort : 40h**

- [ ] Builds iOS (TestFlight)
- [ ] Builds Android (Google Play)
- [ ] CI/CD mobile
- [ ] Documentation

**Livrable :** Apps sur stores

---

## 💻 Implémentation Détaillée

### Réutilisation Code Desktop

**Desktop utilise déjà whisper-rs :**
```rust
// apps/desktop/src-tauri/src/whisper_engine/whisper_engine.rs
pub struct WhisperEngine {
    ctx: Option<WhisperContext>,
    model_path: PathBuf,
}

impl WhisperEngine {
    pub fn load_model(&self, model_name: &str) -> Result<()> {
        // GPU (Metal/CUDA)
    }

    pub fn transcribe(&self, audio: &[f32]) -> Result<String> {
        // Inférence rapide
    }
}
```

**Mobile réutilise en adaptant :**
```rust
// apps/mobile/src-tauri/src/whisper_engine/mobile.rs
use super::WhisperEngine;  // Import du desktop !

pub struct MobileWhisperEngine {
    engine: WhisperEngine,      // Composition
    model_type: ModelType,
}

impl MobileWhisperEngine {
    pub async fn new(model_type: ModelType) -> Result<Self> {
        let mut engine = WhisperEngine::default();

        // Télécharger modèle si nécessaire
        let model_path = ensure_model_downloaded(model_type).await?;

        // Charger (même code que desktop !)
        engine.load_model(&model_path)?;

        Ok(Self { engine, model_type })
    }

    pub fn transcribe_chunk(&self, audio: &[f32]) -> Result<String> {
        // Déléguer à l'engine desktop
        self.engine.transcribe(audio)
    }
}
```

**Réutilisation : ~90% du code Whisper !**

---

### Modèles Recommandés

| Modèle | Taille | Vitesse | Qualité | Recommandation |
|--------|--------|---------|---------|----------------|
| **tiny.en** (q8) | 40 MB | Temps réel | Correct | Dev/proto |
| **base.en** (q5) | 75 MB | 2-3x RT | Très bon | **Production ⭐** |
| **small.en** (q5) | 200 MB | 4-5x RT | Excellent | Power users |

**Stratégie par défaut :**
- Premier lancement : télécharger **base.en** (75 MB)
- Option utilisateur : changer vers tiny (plus rapide) ou small (meilleure qualité)

---

### Commandes Tauri Mobile

```rust
#[tauri::command]
async fn start_recording_mobile(
    app: AppHandle,
    model_type: String,  // "tiny", "base", "small"
) -> Result<(), String> {
    // 1. Charger Whisper (local !)
    let whisper = MobileWhisperEngine::new(
        ModelType::from_str(&model_type)?
    ).await?;

    // 2. Capture audio
    let audio_stream = start_microphone_capture()?;

    // 3. Transcrire localement
    tokio::spawn(async move {
        for chunk in audio_stream {
            if !is_speech(&chunk) { continue; }

            // Transcription locale
            match whisper.transcribe_chunk(&chunk) {
                Ok(text) => {
                    app.emit("transcript-update", TranscriptUpdate {
                        text,
                        timestamp: Utc::now(),
                    }).ok();
                }
                Err(e) => log::error!("Error: {}", e),
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

    // Télécharger depuis Hugging Face
    ensure_model_downloaded(model).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
```

---

## 💰 Coûts Mise à Jour

### Développement
| Phase | Durée | Effort |
|-------|-------|--------|
| Phase 1: Monorepo | 2 sem | ~80h |
| Phase 2: Mobile + Whisper | **4 sem** | ~160h (+40h vs cloud) |
| Phase 3: Features | 2 sem | ~80h |
| Phase 4: Distribution | 1 sem | ~40h |
| **Total** | **9 sem** | **~360h** |

**Augmentation : +40h (1 semaine) pour Whisper local vs cloud**

### Running Costs
| Service | Cloud | Local |
|---------|-------|-------|
| Transcription | 0-50€/mois | **0€** ✅ |
| Backend | 5-10€/mois | 5-10€/mois |
| Stores | 124€/an | 124€/an |
| **Total an 1** | 124-724€ | **124-244€** ✅ |

**Économie : 0-600€/an en restant local !**

---

## ⚡ Performance Attendue

### iPhone (avec base.en q5)

| Device | Vitesse | Qualité | Batterie |
|--------|---------|---------|----------|
| iPhone 11 | 2x RT | Très bon | ~2h recording |
| iPhone 12+ | 1.5x RT | Très bon | ~3h recording |
| iPhone 14+ (Core ML) | **Temps réel** ⚡ | Très bon | ~4h recording |

### Android (avec base.en q5)

| Device | Vitesse | Qualité | Batterie |
|--------|---------|---------|----------|
| Snapdragon 8 Gen 2 | 2x RT | Très bon | ~2h recording |
| Snapdragon 8 Gen 1 | 2.5x RT | Très bon | ~1.5h recording |
| Mid-range (SD 7) | 3x RT | Très bon | ~1h recording |

**Légende :** RT = realtime (1x = transcription aussi rapide que l'audio)

---

## ✅ Avantages vs Cloud (Précédent Plan)

| Feature | Whisper Local ⭐ | Cloud (Groq) |
|---------|-----------------|--------------|
| **Privacy** | 🟢 100% on-device | 🔴 Données envoyées |
| **Offline** | 🟢 Fonctionne partout | 🔴 Nécessite internet |
| **Coût** | 🟢 0€ | 🟡 Groq gratuit (limites) |
| **Setup** | 🟡 Download 75 MB | 🟢 Immédiat |
| **Vitesse** | 🟢 2-3x RT | 🟢 < 1s |
| **Qualité** | 🟢 Excellente | 🟢 Excellente |
| **Batterie** | 🟡 CPU intensif | 🟢 Minimal |
| **Code shared** | 🟢 90% (vs desktop) | 🟡 70% |

**Verdict : Whisper local supérieur pour privacy + offline + coûts**

---

## 🎯 MVP Mobile (5 Semaines)

### Fonctionnalités Minimales
1. ✅ Setup modèle (télécharger base.en)
2. ✅ Enregistrement audio (micro)
3. ✅ Transcription locale temps réel
4. ✅ Liste réunions
5. ✅ Interface FR/EN

### Exclusions MVP
- ❌ Résumés IA (Phase 3)
- ❌ Sync cloud (Phase 3)
- ❌ Optimisations Core ML/NNAPI (Phase 2, semaine 6)

**Timeline MVP : Semaines 1-5 (Phases 1-2 incomplète)**

---

## 📝 Décisions Clés

### ✅ Adoptées

1. **whisper.cpp + GGUF** (vs cloud)
2. **base.en q5 par défaut** (75 MB)
3. **Tauri Mobile** (vs React Native)
4. **Monorepo** (code partagé)

### ⏳ Reportées à Plus Tard

1. **Core ML iOS** (Phase 2, semaine 6 - optionnel)
2. **NNAPI Android** (Phase 2, semaine 6 - optionnel)
3. **Distil-Whisper** (optimisation future)
4. **Sync cloud** (Phase 3 - optionnel)

---

## 🚧 Risques Mise à Jour

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Performance mobile insuffisante | 🔴 Élevé | 🟡 Moyen | Tests précoces (semaine 4), fallback tiny.en |
| Batterie drainée trop vite | 🟡 Moyen | 🟡 Moyen | Optimisations VAD, pauses automatiques |
| Taille app trop grande (>150 MB) | 🟡 Moyen | 🟢 Faible | base.en = 75 MB acceptable |
| Tauri Mobile beta instable | 🔴 Élevé | 🟢 Faible | POC semaine 3, fallback React Native |

---

## 📚 Documentation Complémentaire

Voir aussi :
- **MOBILE_WHISPER_LOCAL_STRATEGY.md** - Détails techniques whisper.cpp
- **MOBILE_ARCHITECTURE.md** - Architecture générale
- **MOBILE_MIGRATION_PLAN.md** (V1) - Plan original avec cloud

---

## 🎯 Prochaines Étapes

### Option A : Démarrer Phase 1 (Monorepo)
**Durée : 2 semaines**
- Restructurer codebase
- Extraire packages partagés
- Valider desktop fonctionne

### Option B : POC Whisper Mobile d'abord
**Durée : 3-4 jours**
- Mini-app Tauri mobile
- Tester whisper.cpp iOS/Android
- Benchmarker performance
- Valider approche

### Option C : Questions & Review
- Budget validé ? (+1 semaine vs plan original)
- Accepter limitations performance (2-3x RT) ?
- Priorité iOS vs Android ?

**Ma recommandation : Option A (démarrer monorepo) puis POC en parallèle (semaine 3)**

---

## ✅ Validation Finale

**Ce plan remplace MOBILE_MIGRATION_PLAN.md avec stratégie Whisper local.**

**Avantages décisifs :**
- 🔒 Privacy totale
- 📡 Offline-first
- 💰 0€ coûts récurrents
- ♻️ 90% code réutilisé

**Trade-off accepté :**
- +1 semaine développement
- Performances 2-3x RT (vs < 1s cloud)
- Setup initial (download 75 MB)

**Voulez-vous procéder avec ce plan ?**
