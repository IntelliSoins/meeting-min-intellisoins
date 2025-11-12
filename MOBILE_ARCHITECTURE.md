# 🏗️ Architecture Technique Mobile - Meetily

## 📐 Vue d'Ensemble de l'Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE GLOBALE                          │
└──────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   Utilisateurs      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐          ┌─────▼─────┐         ┌─────▼─────┐
   │ Desktop │          │    iOS    │         │  Android  │
   │  Tauri  │          │   Tauri   │         │   Tauri   │
   └────┬────┘          └─────┬─────┘         └─────┬─────┘
        │                     │                      │
        │              ┌──────▼──────────────────────▼──────┐
        │              │    Shared Frontend Layer          │
        │              │  (React Components + Logic)        │
        │              │  - packages/shared-ui              │
        │              │  - packages/shared-logic           │
        │              │  - packages/i18n                   │
        │              └──────┬──────────────────────┬──────┘
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                     ┌────────▼────────┐
                     │  Backend API    │
                     │   FastAPI       │
                     │  - Meetings DB  │
                     │  - AI Summary   │
                     │  - Cloud Trans  │
                     └─────────────────┘
```

---

## 🔄 Flux de Données : Desktop vs Mobile

### Desktop (Actuel)

```
┌─────────────┐
│   Micro     │─────┐
└─────────────┘     │
                    ▼
┌─────────────┐  ┌──────────────────┐
│ System Audio│──▶│  Audio Pipeline  │
└─────────────┘  │  (Rust cpal)     │
                 │  - Mixing         │
                 │  - VAD            │
                 │  - Noise Reduc.   │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  Whisper Local   │
                 │  (GPU Accelerated)│
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   Transcription  │
                 │   Temps Réel     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  Backend SQLite  │
                 │  + AI Summary    │
                 └──────────────────┘
```

### Mobile (Proposé)

```
┌─────────────┐
│   Micro     │ (System audio ❌ impossible)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Mobile Audio    │
│  (Tauri Plugin)  │
│  - Mic capture   │
│  - Basic VAD     │
└─────────┬────────┘
          │
          │ Chunks audio (streaming)
          ▼
┌──────────────────┐
│  Cloud API       │
│  (Groq/Deepgram) │
│  - Whisper Cloud │
│  - Fast (< 1s)   │
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
│  Backend API     │
│  + Sync Cloud    │
└──────────────────┘
```

---

## 📦 Structure Monorepo Détaillée

### Configuration pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "meetily-monorepo",
  "version": "0.2.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:desktop": "pnpm --filter @meetily/desktop dev",
    "dev:mobile": "pnpm --filter @meetily/mobile dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.2"
  }
}
```

### Packages Partagés

#### 1. `packages/shared-ui`

Composants UI réutilisables entre desktop et mobile.

```
packages/shared-ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Exports
│   │
│   ├── components/
│   │   ├── RecordingControls/
│   │   │   ├── RecordingControls.tsx
│   │   │   ├── RecordingControls.mobile.tsx    # Variant mobile
│   │   │   └── RecordingControls.desktop.tsx   # Variant desktop
│   │   │
│   │   ├── TranscriptView/
│   │   │   └── TranscriptView.tsx
│   │   │
│   │   ├── AISummary/
│   │   │   └── AISummary.tsx
│   │   │
│   │   └── ui/                     # shadcn/radix components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useRecording.ts         # Hook enregistrement
│   │   ├── useTranscription.ts     # Hook transcription
│   │   └── useSummary.ts           # Hook résumés
│   │
│   └── styles/
│       └── globals.css             # Tailwind
```

**package.json:**
```json
{
  "name": "@meetily/shared-ui",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.2.0",
    "tailwindcss": "^3.4.1",
    "@radix-ui/react-dialog": "^1.1.14"
  }
}
```

**Exemple de composant adaptatif:**
```tsx
// packages/shared-ui/src/components/RecordingControls/RecordingControls.tsx
import { Platform } from '@meetily/shared-logic';

export function RecordingControls({ onStart, onStop, variant }) {
  const isMobile = Platform.isMobile();

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isMobile ? (
        <FABButton onClick={onStart} />  // Floating Action Button
      ) : (
        <Button onClick={onStart}>Start Recording</Button>
      )}
    </div>
  );
}
```

---

#### 2. `packages/shared-logic`

Logique métier réutilisable (API, types, utils).

```
packages/shared-logic/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   │
│   ├── api/
│   │   ├── client.ts               # HTTP client (fetch/axios)
│   │   ├── meetings.ts             # API meetings
│   │   ├── transcription.ts        # API transcription
│   │   └── summary.ts              # API résumés
│   │
│   ├── types/
│   │   ├── meeting.ts
│   │   ├── transcript.ts
│   │   └── summary.ts
│   │
│   ├── utils/
│   │   ├── platform.ts             # Détection plateforme
│   │   ├── audio.ts                # Helpers audio
│   │   └── storage.ts              # Abstraction storage
│   │
│   └── services/
│       ├── recording.service.ts    # Service enregistrement
│       ├── transcription.service.ts
│       └── sync.service.ts         # Sync cloud
```

**Exemple API Client:**
```typescript
// packages/shared-logic/src/api/client.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5167') {
    this.baseUrl = baseUrl;
  }

  async createMeeting(data: CreateMeetingDto): Promise<Meeting> {
    const response = await fetch(`${this.baseUrl}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

---

#### 3. `packages/i18n`

Traductions internationalisées.

```
packages/i18n/
├── package.json
├── src/
│   ├── index.ts
│   ├── config.ts
│   └── messages/
│       ├── en.json                 # Anglais (existant)
│       ├── fr.json                 # Français (existant)
│       └── es.json                 # Espagnol (futur)
```

**Configuration:**
```typescript
// packages/i18n/src/config.ts
export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];

export function getMessages(locale: Locale) {
  return import(`./messages/${locale}.json`);
}
```

---

### Apps

#### 1. `apps/desktop` (Existant)

```
apps/desktop/
├── package.json
├── src/                           # Next.js (EXISTANT)
│   ├── app/
│   ├── components/
│   └── ...
│
└── src-tauri/                     # Rust (EXISTANT)
    ├── src/
    │   ├── lib.rs
    │   ├── audio/
    │   └── whisper_engine/
    └── Cargo.toml
```

**Modifications:**
- Import composants depuis `@meetily/shared-ui`
- Utiliser API client de `@meetily/shared-logic`
- Garder le code Rust audio complexe

**package.json:**
```json
{
  "name": "@meetily/desktop",
  "dependencies": {
    "@meetily/shared-ui": "workspace:*",
    "@meetily/shared-logic": "workspace:*",
    "@meetily/i18n": "workspace:*"
  }
}
```

---

#### 2. `apps/mobile` (Nouveau)

```
apps/mobile/
├── package.json
├── tauri.conf.json
│
├── src/                           # React (pas Next.js)
│   ├── App.tsx
│   ├── screens/
│   │   ├── Home.tsx
│   │   ├── Recording.tsx
│   │   ├── Meetings.tsx
│   │   └── Settings.tsx
│   │
│   ├── navigation/
│   │   └── TabNavigator.tsx       # Bottom tabs
│   │
│   └── services/
│       └── audio.mobile.ts        # Audio mobile
│
├── src-tauri/                     # Rust (Simplifié)
│   ├── src/
│   │   ├── lib.rs
│   │   ├── audio/
│   │   │   └── mobile.rs          # Audio mobile (mic seul)
│   │   └── cloud/
│   │       └── transcription.rs   # Client Groq/Deepgram
│   └── Cargo.toml
│
├── ios/                           # Configuration iOS
│   └── Info.plist
│
└── android/                       # Configuration Android
    └── AndroidManifest.xml
```

**Audio Mobile (Rust):**
```rust
// apps/mobile/src-tauri/src/audio/mobile.rs
use tauri::plugin::mobile::PluginInvokePayload;

#[tauri::command]
async fn start_mobile_recording(
    transcription_provider: String,  // "groq" | "deepgram"
) -> Result<(), String> {
    // 1. Démarrer capture micro (pas system audio)
    let mic_stream = start_microphone_capture()?;

    // 2. Buffer audio par chunks de 30s
    let audio_chunks = buffer_audio(mic_stream, Duration::from_secs(30));

    // 3. Envoyer chunks vers API cloud
    for chunk in audio_chunks {
        let transcript = send_to_cloud(chunk, &transcription_provider).await?;
        emit_transcript_event(transcript)?;
    }

    Ok(())
}

async fn send_to_cloud(audio: Vec<f32>, provider: &str) -> Result<String> {
    match provider {
        "groq" => groq_api::transcribe(audio).await,
        "deepgram" => deepgram_api::transcribe(audio).await,
        _ => Err("Unknown provider"),
    }
}
```

**UI Mobile (React):**
```tsx
// apps/mobile/src/screens/Recording.tsx
import { RecordingControls } from '@meetily/shared-ui';
import { useRecording } from '@meetily/shared-logic';
import { invoke } from '@tauri-apps/api/core';

export function RecordingScreen() {
  const { start, stop, transcripts } = useRecording({
    mode: 'cloud',
    provider: 'groq',
  });

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

---

## 🔌 Intégration Backend

### API Endpoints (Nouveaux)

```python
# backend/app/routers/transcription.py
from fastapi import APIRouter, UploadFile
import httpx

router = APIRouter()

@router.post("/api/transcription/cloud")
async def transcribe_cloud(
    audio: UploadFile,
    provider: str = "groq"
):
    """Transcription cloud pour mobile"""

    audio_data = await audio.read()

    if provider == "groq":
        result = await groq_transcribe(audio_data)
    elif provider == "deepgram":
        result = await deepgram_transcribe(audio_data)

    return {"transcript": result}


async def groq_transcribe(audio_bytes: bytes) -> str:
    """Groq Whisper API (gratuit)"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={"model": "whisper-large-v3"}
        )
        return response.json()["text"]
```

---

## 📊 Comparaison Détaillée : Desktop vs Mobile

| Feature | Desktop | Mobile | Notes |
|---------|---------|---------|-------|
| **Audio Capture** |
| Microphone | ✅ cpal (Rust) | ✅ Tauri plugin | API différente |
| System Audio | ✅ ScreenCaptureKit/WASAPI | ❌ Impossible | Limitation OS |
| Background | ✅ Illimité | ⚠️ Limité (iOS 10min) | Foreground service requis |
| **Transcription** |
| Local Whisper | ✅ GPU (Metal/CUDA) | ⚠️ CPU trop lent | Pas pratique mobile |
| Cloud API | ⚠️ Optionnel | ✅ Obligatoire | Groq gratuit |
| **Storage** |
| Local DB | ✅ SQLite illimité | ✅ SQLite (sandbox) | Même tech |
| Cloud Sync | ⚠️ Optionnel | ✅ Recommandé | Pour sync multi-device |
| **UI** |
| Navigation | ✅ Sidebar | ✅ Bottom Tabs | Patterns différents |
| Shortcuts | ✅ Keyboard | ❌ N/A | Gestures à la place |
| **Permissions** |
| Microphone | ✅ Une fois | ⚠️ Chaque session | iOS stricte |
| Notifications | ✅ Simple | ✅ Simple | Même API Tauri |

---

## 🚀 CI/CD Multi-Plateformes

### GitHub Actions Unifié

```yaml
# .github/workflows/build-all.yml
name: Build All Platforms

on:
  push:
    branches: [main]

jobs:
  build-desktop:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Build Desktop
        run: |
          pnpm install
          pnpm --filter @meetily/desktop tauri:build

  build-mobile:
    strategy:
      matrix:
        target: [ios, android]
    runs-on: ${{ matrix.target == 'ios' && 'macos-latest' || 'ubuntu-latest' }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Build ${{ matrix.target }}
        run: |
          pnpm install
          pnpm --filter @meetily/mobile tauri ${{ matrix.target }} build
```

---

## 🎯 Migration Checklist

### Phase 1: Monorepo Setup
- [ ] Créer structure `packages/` et `apps/`
- [ ] Configurer pnpm workspace
- [ ] Extraire composants vers `shared-ui`
- [ ] Extraire logique vers `shared-logic`
- [ ] Migrer i18n vers `packages/i18n`
- [ ] Vérifier desktop fonctionne (no regression)

### Phase 2: Mobile App
- [ ] Initialiser Tauri mobile
- [ ] Configurer iOS (Info.plist, permissions)
- [ ] Configurer Android (manifest, permissions)
- [ ] Implémenter audio mobile (mic seul)
- [ ] Intégrer Groq transcription
- [ ] Adapter UI pour mobile (bottom tabs, FAB)

### Phase 3: Cloud Features
- [ ] Backend endpoint transcription cloud
- [ ] Client Groq API
- [ ] Client Deepgram API (optionnel)
- [ ] Sync cloud (optionnel)

### Phase 4: Testing & Distribution
- [ ] Tests iOS (TestFlight)
- [ ] Tests Android (Google Play beta)
- [ ] CI/CD mobile
- [ ] Documentation utilisateur

---

## 📞 Support et Questions

Prêt à démarrer la migration ?

**Prochaines étapes :**
1. Valider le plan
2. Commencer Phase 1 (Monorepo)
3. Tester Tauri mobile (proof of concept)

**Questions à clarifier :**
- Budget cloud transcription (Groq gratuit ok ?)
- Timeline préférée (4 ou 8 semaines ?)
- Priorité iOS vs Android ?
