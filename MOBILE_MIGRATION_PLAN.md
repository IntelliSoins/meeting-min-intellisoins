# 📱 Plan de Migration Mobile : Meetily iOS & Android

## 🎯 Objectif

Rendre Meetily disponible sur iOS et Android tout en conservant l'application desktop existante, avec un maximum de code partagé.

---

## 📊 Analyse de l'Architecture Actuelle

### Stack Technique Desktop
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Desktop Runtime**: Tauri 2.6.2 (Rust)
- **Audio Processing**: Rust (cpal, whisper-rs, silero)
  - Capture mic + system audio
  - Professional mixing (RMS ducking, VAD)
  - Whisper transcription locale (GPU: Metal/CUDA/Vulkan)
- **Backend**: FastAPI (Python)
- **i18n**: next-intl (EN/FR)
- **UI**: Tailwind CSS, Radix UI, shadcn

### Fonctionnalités Clés
1. ✅ Enregistrement audio (micro + system)
2. ✅ Transcription locale temps réel (Whisper)
3. ✅ Résumés IA (Ollama, Claude, OpenAI, etc.)
4. ✅ Stockage local (SQLite)
5. ✅ Interface bilingue (FR/EN)

---

## ⚠️ Contraintes Mobile vs Desktop

| Fonctionnalité | Desktop | Mobile | Solution |
|----------------|---------|---------|----------|
| **System Audio Capture** | ✅ (WASAPI, ScreenCaptureKit) | ❌ Impossible | Désactiver ou mode cloud |
| **Whisper Local** | ✅ GPU accéléré (rapide) | ⚠️ CPU only (très lent) | Transcription cloud (Groq, Deepgram) |
| **Audio Mixing** | ✅ Complexe (Rust) | ⚠️ Simplifié | Audio mic seul |
| **Background Recording** | ✅ Natif | ⚠️ Limité iOS | Service Foreground requis |
| **Stockage** | ✅ Filesystem libre | ⚠️ Sandbox | Utiliser SQLite + cloud sync |
| **Permissions** | ✅ Une fois | ⚠️ À chaque lancement | Gestion UX spécifique |

---

## 🏗️ Options Technologiques Évaluées

### Option 1: Tauri Mobile (v2 Beta) ⭐ RECOMMANDÉ

**Avantages:**
- ✅ **Réutilisation maximale** du code Rust
- ✅ **Même codebase** frontend (Next.js/React)
- ✅ **Architecture unifiée** Desktop + Mobile
- ✅ **Tauri 2** supporte iOS et Android (beta)
- ✅ **Performances natives**

**Inconvénients:**
- ⚠️ **Beta**: Moins stable que production
- ⚠️ **Documentation limitée** pour mobile
- ⚠️ **Audio complexe** à adapter

**Code partageable:**
- 🟢 90% du frontend React
- 🟢 80% de la logique métier Rust
- 🟡 50% de l'audio (mic seul, pas system)
- 🟢 100% du backend API

**Effort de migration:** 🟡 Moyen (3-4 semaines)

---

### Option 2: React Native + Monorepo

**Avantages:**
- ✅ **Stable et mature** (production-ready)
- ✅ **Écosystème riche** (libs, plugins)
- ✅ **Performance** très bonne
- ✅ **Code partagé** avec frontend web

**Inconvénients:**
- ❌ **Nouvelle codebase** mobile à créer
- ❌ **Pas de réutilisation** du code Rust
- ❌ **Maintenance** de 2 codebases (desktop vs mobile)

**Code partageable:**
- 🟢 70% de la logique UI (composants React)
- 🔴 0% du code Rust (tout à refaire)
- 🟢 100% du backend API
- 🟢 100% des traductions i18n

**Effort de migration:** 🔴 Élevé (6-8 semaines)

---

### Option 3: Capacitor + Next.js

**Avantages:**
- ✅ **Réutilisation maximale** du frontend Next.js
- ✅ **Simple**: Wrapper web vers natif
- ✅ **Plugins** pour audio, filesystem, etc.
- ✅ **Rapide** à mettre en place

**Inconvénients:**
- ⚠️ **Performances** moins bonnes (WebView)
- ❌ **Pas de réutilisation** du code Rust
- ⚠️ **Limitations** WebView (audio, background)

**Code partageable:**
- 🟢 95% du frontend Next.js
- 🔴 0% du code Rust
- 🟢 100% du backend API
- 🟢 100% des traductions i18n

**Effort de migration:** 🟢 Faible (2-3 semaines)

---

### Option 4: Flutter

**Avantages:**
- ✅ **Performances natives**
- ✅ **UI consistante** cross-platform
- ✅ **Hot reload** rapide

**Inconvénients:**
- ❌ **Tout refaire** (Dart, pas React)
- ❌ **Aucune réutilisation** du code existant
- ⚠️ **Courbe d'apprentissage**

**Code partageable:**
- 🔴 0% du code existant
- 🟢 100% du backend API

**Effort de migration:** 🔴 Très élevé (10-12 semaines)

---

## 🎯 Recommandation : Option 1 (Tauri Mobile) avec Fallback

### Architecture Proposée : Monorepo Hybride

```
meeting-min-intellisoins/
├── packages/                    # Code partagé
│   ├── shared-ui/              # Composants React réutilisables
│   │   ├── components/         # Boutons, modales, etc.
│   │   ├── hooks/              # useRecording, useTranscription
│   │   ├── contexts/           # LocaleContext, etc.
│   │   └── styles/             # Tailwind config
│   │
│   ├── shared-logic/           # Logique métier TypeScript
│   │   ├── api/                # Client API (fetch backend)
│   │   ├── types/              # Types partagés
│   │   └── utils/              # Helpers
│   │
│   └── i18n/                   # Traductions
│       ├── messages/
│       │   ├── en.json
│       │   └── fr.json
│       └── config.ts
│
├── apps/
│   ├── desktop/                # Tauri Desktop (EXISTANT)
│   │   ├── src/                # Next.js frontend
│   │   ├── src-tauri/          # Rust backend
│   │   └── package.json
│   │
│   ├── mobile/                 # Tauri Mobile (NOUVEAU)
│   │   ├── src/                # React Native ou Tauri Mobile
│   │   ├── ios/                # Configuration iOS
│   │   ├── android/            # Configuration Android
│   │   └── package.json
│   │
│   └── web/                    # Progressive Web App (OPTIONNEL)
│       ├── src/                # Next.js optimisé web
│       └── package.json
│
├── backend/                    # FastAPI (EXISTANT)
│   └── app/
│
├── pnpm-workspace.yaml         # Configuration monorepo
├── turbo.json                  # Turborepo (build parallèle)
└── package.json
```

---

## 📋 Plan de Migration Détaillé

### Phase 1: Restructuration en Monorepo (Semaine 1-2)

#### Étape 1.1: Configuration Monorepo
```bash
# Installer Turborepo
pnpm add -D -w turbo

# Créer structure
mkdir -p packages/{shared-ui,shared-logic,i18n}
mkdir -p apps/{desktop,mobile}
```

#### Étape 1.2: Extraire Code Partagé
- [ ] Déplacer composants UI vers `packages/shared-ui`
  - Boutons, modales, forms
  - Sidebar, RecordingControls
  - AISummary, TranscriptView
- [ ] Déplacer logique métier vers `packages/shared-logic`
  - API client (fetch backend)
  - Types TypeScript
  - Utils (formatage, validation)
- [ ] Déplacer i18n vers `packages/i18n`
  - `messages/en.json`, `messages/fr.json`
  - Configuration next-intl

#### Étape 1.3: Migrer Desktop vers `apps/desktop`
```bash
mv frontend apps/desktop
```

#### Étape 1.4: Configurer pnpm Workspace
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Livrable Phase 1:
✅ Monorepo fonctionnel
✅ Desktop fonctionne sans régression
✅ Code partagé extrait et testé

---

### Phase 2: App Mobile - Tauri Mobile (Semaine 3-5)

#### Étape 2.1: Configuration Tauri Mobile

```bash
cd apps/mobile
pnpm create tauri-app --mobile

# Sélectionner:
# - Template: React + TypeScript
# - Package manager: pnpm
```

#### Étape 2.2: Adapter l'Audio pour Mobile

**Différences clés:**

| Feature | Desktop | Mobile |
|---------|---------|---------|
| Micro capture | ✅ Rust cpal | ✅ Tauri plugin-microphone |
| System audio | ✅ ScreenCaptureKit | ❌ Non supporté |
| Whisper local | ✅ GPU accéléré | ⚠️ CPU (trop lent) |
| **Solution** | - | **Transcription cloud** |

**Implémentation:**

```typescript
// apps/mobile/src/services/audio.ts
import { invoke } from '@tauri-apps/api/core';

// Utiliser API cloud pour transcription
export async function startRecording() {
  await invoke('start_mobile_recording', {
    transcriptionMode: 'cloud', // Groq, Deepgram, etc.
  });
}
```

```rust
// apps/mobile/src-tauri/src/audio/mobile.rs
#[tauri::command]
async fn start_mobile_recording(transcription_mode: String) -> Result<()> {
    // Capture mic seul (pas system audio)
    // Envoyer chunks audio vers API cloud (Groq/Deepgram)
}
```

#### Étape 2.3: Adapter l'UI Mobile

**Changements UI:**
- Navigation: Tabs bottom (iOS/Android style)
- Recording controls: FAB (Floating Action Button)
- Sidebar: Drawer mobile
- Settings: Screen dédiée

**Utiliser shared-ui:**
```tsx
// apps/mobile/src/App.tsx
import { RecordingControls } from '@meetily/shared-ui';
import { useRecording } from '@meetily/shared-logic';

export function MobileApp() {
  const { start, stop } = useRecording({ mode: 'cloud' });

  return (
    <RecordingControls
      variant="mobile"  // Adapté pour mobile
      onStart={start}
      onStop={stop}
    />
  );
}
```

#### Étape 2.4: Configuration Permissions

**iOS (Info.plist):**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Meetily needs microphone access to record meetings</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

#### Livrable Phase 2:
✅ App mobile iOS/Android fonctionnelle
✅ Enregistrement micro (pas system audio)
✅ Transcription cloud intégrée
✅ UI adaptée mobile

---

### Phase 3: Fonctionnalités Cloud (Semaine 6-7)

#### Étape 3.1: Ajouter Transcription Cloud

**Backend FastAPI:**
```python
# backend/app/services/cloud_transcription.py
async def transcribe_audio_chunk(audio_data: bytes, provider: str):
    if provider == "groq":
        return await groq_transcribe(audio_data)
    elif provider == "deepgram":
        return await deepgram_transcribe(audio_data)
```

**Providers supportés:**
- Groq (whisper-large-v3, gratuit, rapide)
- Deepgram (payant, très rapide)
- OpenAI Whisper API (payant)

#### Étape 3.2: Sync Cloud (Optionnel)

Pour partager meetings entre desktop et mobile:

```typescript
// packages/shared-logic/src/sync/
export class MeetingSync {
  async uploadMeeting(meetingId: string) {
    // Upload vers S3/Firebase
  }

  async syncMeetings() {
    // Sync bidirectionnel
  }
}
```

#### Livrable Phase 3:
✅ Transcription cloud fonctionnelle
✅ Sync meetings desktop ↔ mobile (optionnel)

---

### Phase 4: Build & Distribution (Semaine 8)

#### Étape 4.1: iOS Build

```bash
cd apps/mobile
pnpm tauri ios build

# Output: apps/mobile/gen/apple/Meetily.ipa
```

**Distribution:**
- TestFlight (beta)
- App Store (production)

#### Étape 4.2: Android Build

```bash
pnpm tauri android build --release

# Output: apps/mobile/gen/android/app/build/outputs/apk/release/app-release.apk
```

**Distribution:**
- Google Play Console (beta + production)

#### Étape 4.3: GitHub Actions Mobile

```yaml
# .github/workflows/build-mobile.yml
name: Build Mobile Apps

on:
  push:
    branches: [main, 'mobile/**']

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build iOS
        run: |
          cd apps/mobile
          pnpm tauri ios build

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Android
        run: |
          cd apps/mobile
          pnpm tauri android build
```

#### Livrable Phase 4:
✅ Builds iOS/Android automatiques
✅ Distribution TestFlight + Google Play
✅ CI/CD configuré

---

## 💰 Estimation des Coûts

### Développement
| Phase | Durée | Effort |
|-------|-------|--------|
| Phase 1: Monorepo | 2 semaines | ~80h |
| Phase 2: Mobile App | 3 semaines | ~120h |
| Phase 3: Cloud Features | 2 semaines | ~80h |
| Phase 4: Distribution | 1 semaine | ~40h |
| **Total** | **8 semaines** | **~320h** |

### Cloud (Transcription)
| Service | Prix | Notes |
|---------|------|-------|
| **Groq** | **Gratuit** ⭐ | whisper-large-v3, limites généreuses |
| Deepgram | $0.0043/min | ~$0.26/h, très rapide |
| OpenAI Whisper | $0.006/min | ~$0.36/h |

**Recommandation:** Groq (gratuit, rapide, excellent)

### App Store Distribution
- Apple Developer: **$99/an**
- Google Play: **$25** (une fois)

---

## 🎯 Roadmap Recommandée

### Approche Minimale (MVP Mobile)

**Priorité 1 (4 semaines):**
1. ✅ Monorepo avec code partagé
2. ✅ App mobile basique (mic seul)
3. ✅ Transcription Groq (gratuit)
4. ✅ UI mobile adaptée

**Priorité 2 (4 semaines):**
5. ✅ Résumés IA mobile
6. ✅ Sync cloud (optionnel)
7. ✅ Distribution stores

**Priorité 3 (Plus tard):**
8. ⏳ Optimisations performances
9. ⏳ Widgets iOS/Android
10. ⏳ Watch app (Apple Watch, Wear OS)

---

## ⚠️ Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Tauri Mobile instable (beta) | 🔴 Élevé | 🟡 Moyen | Fallback React Native si blocage |
| Performance Whisper mobile | 🟡 Moyen | 🟢 Faible | Utiliser Groq cloud (déjà prévu) |
| Permissions iOS strictes | 🟡 Moyen | 🟢 Faible | Foreground service + UX claire |
| Background recording limité | 🟡 Moyen | 🟡 Moyen | Notification persistante requise |

---

## 📚 Ressources et Documentation

### Tauri Mobile
- **Docs officielles**: https://beta.tauri.app/guides/create/mobile/
- **Exemples**: https://github.com/tauri-apps/tauri-mobile-examples
- **Discord**: https://discord.com/invite/tauri (canal #mobile)

### Audio Mobile
- **iOS Audio Session**: https://developer.apple.com/documentation/avfoundation/avaudiosession
- **Android MediaRecorder**: https://developer.android.com/reference/android/media/MediaRecorder

### Transcription Cloud
- **Groq API**: https://console.groq.com/docs/speech-text
- **Deepgram**: https://developers.deepgram.com/

---

## ✅ Décision à Prendre

**Question pour vous:**

1. **Confirmer Option 1 (Tauri Mobile)** ?
   - Réutilisation maximale du code
   - Architecture unifiée
   - Risque beta acceptable ?

2. **Accepter les limitations mobiles** ?
   - Pas de system audio capture
   - Transcription cloud (Groq gratuit)
   - Background recording limité iOS

3. **Timeline** ?
   - MVP 4 semaines (basique)
   - Complet 8 semaines (avec sync cloud)

**Voulez-vous que je procède avec la Phase 1 (Monorepo) ?**
