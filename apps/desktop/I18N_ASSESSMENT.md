# Frontend Internationalization (i18n) Assessment Report
## Meetily - Privacy-First AI Meeting Assistant

**Assessment Date:** November 12, 2025
**Frontend Stack:** Next.js 14 + React 18 + TypeScript + Tauri 2.x
**Current Branch:** claude/translate-app-french-011CV3ujRwr7mffNT23nP3Dq

---

## 1. CURRENT I18N SYSTEM STATUS

### 1.1 Existing Implementations
- **LanguageSelection Component** (`frontend/src/components/LanguageSelection.tsx`)
  - Manages **transcription language only** (Whisper audio language selection)
  - NOT for UI/app language translation
  - Supports 99+ language codes for audio transcription
  - Stores preferences via Tauri backend (`set_language_preference`)
  - Provides auto-detection and auto-translate-to-English options

### 1.2 i18n Dependencies
- **None installed** - No i18n libraries in package.json
- No react-i18next, next-intl, next-international, or similar libraries
- No translation files (JSON, YAML, etc.)
- No locale configurations
- No message formatting or pluralization support

### 1.3 Current UI Language
- **English (hardcoded)** - All user-facing text strings are hardcoded throughout components
- No translation key system in place
- No i18n provider or context setup

---

## 2. USER-FACING TEXT INVENTORY

### 2.1 Main Application Structure

#### Navigation & Sidebar
**File:** `frontend/src/components/Sidebar/index.tsx`
- "Home" (navigation item)
- "Start Recording" (button)
- "Recording in progress..." (status)
- "Settings" (navigation item)
- "Meeting Notes" (navigation item)
- "Search meeting content..." (search placeholder)
- "Searching..." (search status)
- "Are you sure you want to delete this meeting? This action cannot be undone."
- "Edit Meeting Title" (modal title)
- "Meeting Title" (form label)
- "Enter meeting title" (input placeholder)
- "Cancel" (button)
- "Save" (button)
- "Back" (button)
- "v0.1.1 - Pre Release" (version text)

#### Main Recording Page
**File:** `frontend/src/app/page.tsx`
- "+ New Call" (default meeting title)
- "Key Points", "Action Items", "Decisions", "Main Topics" (summary sections)
- Various status messages for recording, transcription, and summarization

#### Settings Pages
**File:** `frontend/src/app/settings/page.tsx`
- "Settings" (page title)
- "Back" (button)
- Tab labels:
  - "General"
  - "Recordings"
  - "Transcription"
  - "Summary"

#### Preference Settings
**File:** `frontend/src/components/PreferenceSettings.tsx`
- "Notifications" (toggle label)
- Storage location information (database, models, recordings paths)
- Notification preference descriptions
- Settings save/load status messages

#### Recording Settings
**File:** `frontend/src/components/RecordingSettings.tsx`
- "Auto-save recordings" (toggle)
- "Recording folder" (field label)
- "File format" (dropdown)
- Various recording-related preferences
- File path information

#### Device Selection
**File:** `frontend/src/components/DeviceSelection.tsx`
- "Microphone" (device type label)
- "System Audio" (device type label)
- "Select a microphone device" (dropdown prompt)
- "Select a system audio device" (dropdown prompt)
- "Refresh" (button)
- "Failed to load audio devices. Please check your system audio settings." (error message)
- "Show audio levels" (toggle)
- "Stop monitoring" (button)
- Device status messages

#### Language Selection
**File:** `frontend/src/components/LanguageSelection.tsx`
- "Transcription Language" (heading)
- 99+ language options with codes
- "Auto Detect (Original Language)"
- "Auto Detect (Translate to English)"
- "ℹ️ Parakeet Language Support" (info heading)
- "Parakeet currently only supports automatic language detection..."
- "⚠️ Auto Detect may produce incorrect results"
- "🌐 Translation Mode Active"
- "Current: [language name]"
- Status messages and warnings

#### Permission Warnings
**File:** `frontend/src/components/PermissionWarning.tsx`
- "Permissions Required" (title)
- "Microphone Permission Required" (title)
- "System Audio Permission Required" (title)
- "Open Microphone Settings" (button)
- "Open Screen Recording Settings" (button)
- "Recheck" (button)
- "Meetily needs access to your microphone..." (description)
- "Your microphone is connected and powered on" (instruction)
- "Microphone permission is granted in System Settings" (instruction)
- "No other app is exclusively using the microphone" (instruction)
- "System audio capture is not available..." (description)
- "Install a virtual audio device (e.g., BlackHole 2ch)" (instruction)
- "Grant Screen Recording permission to Meetily" (instruction)
- "Configure your audio routing in Audio MIDI Setup" (instruction)

#### Recording Controls
**File:** `frontend/src/components/RecordingControls.tsx`
- "Start Recording" (button)
- "Stop Recording" (button)
- "Pause Recording" (button)
- "Resume Recording" (button)
- Recording status messages
- Error messages and alerts
- "Failed to initialize recording. Please check the console..." (error)

#### Recording Status Bar
**File:** `frontend/src/components/RecordingStatusBar.tsx`
- "Recording" (status label)
- "Paused" (status label)
- Time format "[MM:SS]"

#### Transcript View
**File:** `frontend/src/components/TranscriptView.tsx`
- "Listening..." (status message)
- "Processing..." (status message)
- Transcript timestamps and formatting

#### Summary Components
**Files:**
- `frontend/src/components/MeetingDetails/SummaryGeneratorButtonGroup.tsx`
  - "Generate Summary" (button)
  - "Regenerate Summary" (button)
  - "No Ollama models found. Please download gemma2:2b from Model Settings." (error)
  - Template selection messages
  
- `frontend/src/components/MeetingDetails/TranscriptButtonGroup.tsx`
  - "Copy" (button)
  - "Recording" (button)
  - "No transcript available" (tooltip)
  - "Copy Transcript" (tooltip)
  - "Open Recording Folder" (tooltip)

#### Model Settings
**Files:**
- `frontend/src/components/ModelSettingsModal.tsx`
  - Provider labels: "Ollama", "Groq", "Claude", "OpenAI", "OpenRouter"
  - "API Key" (field label)
  - "Model" (dropdown label)
  - "Endpoint" (field label for Ollama)
  - Lock/unlock indicators for API keys
  - Model search and filtering messages
  - Download progress messages
  
- `frontend/src/components/TranscriptSettings.tsx`
  - "Transcription Language" (heading)
  - Provider selection
  - Model selection
  - API Key management
  
- `frontend/src/components/SummaryModelSettings.tsx`
  - "Model settings saved successfully" (toast)
  - "Failed to save model settings" (toast)
  - "Failed to load model settings" (toast)

#### About Section
**File:** `frontend/src/components/About.tsx`
- "v0.1.1 - Pre Release" (version)
- "Real-time notes and summaries that never leave your machine." (tagline)
- "What makes Meetily different" (heading)
- Feature cards:
  - "Privacy-first" with description
  - "Use Any Model" with description
  - "Cost-Smart" with description
  - "Works everywhere" with description
- "Coming soon: A library of on-device AI agents..." (banner text)
- "Ready to push your business further?" (heading)
- "If you're planning to build privacy-first custom AI agents..." (description)
- "Chat with the Zackriya team" (button)
- "Built by Zackriya Solutions" (footer)

#### Info Component
**File:** `frontend/src/components/Info.tsx`
- "About Meetily" (button title and dialog title)
- "About" (button label)

#### Compliance Notification
**File:** `frontend/src/components/ComplianceNotification.tsx`
- "Recording Notice" (heading)
- "Inform participants about recording." (instruction)
- "US compliance required" (requirement label)
- "Later" (button)
- "Done" (button)

#### Confirmation Modals
**File:** `frontend/src/components/ConfirmationModel/confirmation-modal.tsx`
- "Confirm Delete" (heading)
- "Cancel" (button)
- "Delete" (button)

#### Analytics & Consent
**File:** `frontend/src/components/AnalyticsConsentSwitch.tsx`
- Analytics consent toggle and information

#### Toast Notifications (Throughout Components)
Success messages:
- "Language preference saved" with description
- "Meeting deleted successfully" with "All associated data has been removed"
- "Meeting title updated successfully"
- "Model settings saved successfully"
- Transcription/summarization completion messages

Error messages:
- "Failed to save language preference"
- "Failed to delete meeting"
- "Failed to update meeting title"
- "Failed to save model settings"
- "Failed to load model settings"
- Various transcription/audio processing errors

### 2.2 Component Inventory (Files with Text Strings)

**Total Components with User-Facing Text:** 50+

**Major Text-Heavy Components:**
1. `Sidebar/index.tsx` - 20+ strings
2. `app/page.tsx` - 30+ strings
3. `PermissionWarning.tsx` - 15+ strings
4. `RecordingControls.tsx` - 20+ strings
5. `ModelSettingsModal.tsx` - 25+ strings
6. `TranscriptSettings.tsx` - 15+ strings
7. `PreferenceSettings.tsx` - 15+ strings
8. `About.tsx` - 10+ strings
9. `RecordingSettings.tsx` - 12+ strings
10. `DeviceSelection.tsx` - 10+ strings

---

## 3. CONFIGURATION & STORAGE

### 3.1 Current Configuration Files
- `frontend/package.json` - Dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/next.config.js` - Next.js configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/.env` files (if present) - Environment variables

### 3.2 Backend Language Preference Storage
**File:** `frontend/src/app/page.tsx` (lines 1596-1608)
- Calls `invoke('get_language_preference')` to load stored preference
- Calls `invoke('set_language_preference', { language: languageCode })` to save
- Default: `'auto-translate'`
- This is for **transcription language only**, not UI language

### 3.3 Tauri Store for Preferences
**File:** `frontend/src/components/RecordingSettings.tsx`
- Uses `@tauri-apps/plugin-store` for local preference persistence
- Stores in `preferences.json`

---

## 4. KEY FINDINGS & ASSESSMENT

### 4.1 Current State Summary
✗ **No UI Language Translation System**
- All text is hardcoded in English
- No i18n library installed
- No translation infrastructure

✓ **Good Foundation for Implementation**
- TypeScript for type safety
- Next.js supports i18n well
- Modular component structure
- Existing preference storage system (can extend for UI language)
- Clean component organization

✓ **Existing Language Features**
- Transcription language selection (99+ languages)
- Preference persistence via backend
- Analytics tracking for user preferences

### 4.2 Text String Statistics
- **Estimated Total UI Strings:** 200-250 unique translatable strings
- **Component Files with Text:** 50+
- **Toast/Alert Messages:** 30+
- **Button Labels:** 40+
- **Form Labels & Placeholders:** 25+
- **Help Text & Descriptions:** 50+
- **Informational Messages:** 30+
- **Error Messages:** 25+

### 4.3 Complexity Factors
**High Complexity Areas:**
1. Settings pages with multiple tabs and sub-settings
2. Device selection dropdowns with dynamic content
3. Error messages with variable content (device names, file paths, etc.)
4. Modal dialogs and confirmations
5. Toast notifications with titles and descriptions
6. Help text with instructions and lists
7. Dynamic language name generation for 99+ languages

**Dynamic Content Requiring Context:**
- Device names (from system)
- File paths (from system)
- Storage locations (from backend)
- Model names (from Ollama/APIs)
- Version numbers
- Time/duration formatting

---

## 5. COMPONENTS NEEDING TRANSLATION

### Critical (User-Facing, High Priority)
1. **Sidebar Navigation** - Primary navigation
2. **Recording Controls** - Main functionality
3. **Settings Pages** - Configuration interface
4. **Permission Warnings** - Safety-critical messages
5. **Device Selection** - Audio configuration
6. **Error Messages** - User feedback
7. **Toast Notifications** - System feedback
8. **Modals & Dialogs** - Action confirmations

### Important (Secondary, Medium Priority)
9. **About/Info Panel** - Product information
10. **Model Settings** - Advanced configuration
11. **Preference Settings** - User preferences
12. **Summary Components** - Meeting features
13. **Transcript View** - Content display

### Lower Priority (Tertiary)
14. **Developer Messages** - Console logs (can skip)
15. **Analytics Labels** - Internal tracking (can keep as-is)
16. **Compliance Notices** - May be region/jurisdiction specific

---

## 6. RECOMMENDED i18n IMPLEMENTATION APPROACH

### 6.1 Suggested Library: `next-intl`
**Why:**
- Native Next.js 13+ support
- Excellent TypeScript integration
- Built-in routing for locale management
- No extra middleware complexity
- Supports static/dynamic rendering
- Great for Tauri (decoupled from backend)

**Alternative:** `react-i18next`
- More flexible, works anywhere
- Larger ecosystem
- More community support
- Slightly more complex setup

### 6.2 Implementation Strategy

**Phase 1: Infrastructure Setup**
- Install i18n library
- Create locale configuration
- Set up English base translations
- Create translation file structure

**Phase 2: Core Components (Week 1)**
- Sidebar and navigation
- Recording controls
- Settings pages
- Permission warnings

**Phase 3: Features (Week 2)**
- Model settings and configurations
- Device selection
- Summary and transcript views
- About and info panels

**Phase 4: Edge Cases & Polish (Week 3)**
- Error messages and toasts
- Dynamic content handling
- RTL language support (if needed)
- Testing and refinement

### 6.3 File Structure (Proposed)
```
frontend/
├── src/
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── sidebar.json
│   │   │   ├── recording.json
│   │   │   ├── settings.json
│   │   │   ├── messages.json
│   │   │   └── about.json
│   │   ├── fr/
│   │   │   ├── common.json
│   │   │   ├── sidebar.json
│   │   │   ├── recording.json
│   │   │   ├── settings.json
│   │   │   ├── messages.json
│   │   │   └── about.json
│   │   └── [other-languages]/
│   └── components/
│       └── ... (existing components)
└── ...
```

---

## 7. TRANSLATION SCOPE ESTIMATE

### Total Translatable Strings by Category
| Category | Count | Complexity |
|----------|-------|------------|
| Navigation & Labels | 40 | Low |
| Button Labels | 40 | Low |
| Form Labels & Placeholders | 25 | Low |
| Help Text & Descriptions | 50 | Medium |
| Error Messages | 25 | Medium |
| Toast Messages | 30 | Medium |
| Modal Content | 20 | Medium |
| Settings Descriptions | 30 | Medium |
| Permission Messages | 15 | High |
| Feature Descriptions | 10 | High |
| **TOTAL** | **~285** | **~** |

### Estimated Effort
- **Initial Setup:** 4-6 hours
- **String Extraction & Organization:** 8-10 hours
- **First Language (French):** 4-6 hours (based on branch name)
- **Second Language:** 3-4 hours
- **Testing & QA:** 4-6 hours
- **Total:** ~30-36 hours for setup + first 2 languages

---

## 8. SPECIAL CONSIDERATIONS

### 8.1 Language-Specific Challenges
- **French:** RTL issues (not applicable), gendered articles, plural forms
- **German:** Compound words, capitalization rules
- **Chinese/Japanese:** Character encoding, traditional vs. simplified
- **RTL Languages:** If adding Arabic, Hebrew, etc. - UI layout adjustments needed

### 8.2 Dynamic Content Management
Current hardcoded locations that need i18n awareness:
- Device names (from system - NOT translated)
- File paths (from system - NOT translated)
- Model names (from APIs - NOT translated)
- Language names in dropdowns (should be translated)
- Error messages with variables (need templating)

### 8.3 Backend Integration
- Transcription language selection remains backend-controlled
- UI language preference can be stored in Tauri Store or browser localStorage
- No backend changes needed for UI translation (i18n is frontend-only)

### 8.4 Testing Considerations
- Test with different locale settings
- Verify toast notifications work across languages
- Check modal dialogs don't overflow with longer translations
- Test Settings pages (can have longer labels in some languages)
- Verify RTL/LTR if expanding beyond Latin-script languages

---

## 9. RISK ASSESSMENT

### Low Risk
- Implementing next-intl (well-tested, stable)
- Translating English UI text (standard process)
- Adding first language translation (French, appears to be focus)

### Medium Risk
- Maintaining consistency across 50+ components
- Handling dynamic content (device names, paths)
- Managing error message translations
- Testing across different screen sizes with different text lengths

### High Risk
- Translating error messages that need to match backend error texts
- Handling pluralization and conditional text
- Ensuring completeness across all components
- Future maintenance of translation files

---

## 10. QUICK REFERENCE: MAJOR TEXT-BEARING FILES

| File | Strings | Priority |
|------|---------|----------|
| `Sidebar/index.tsx` | ~25 | Critical |
| `app/page.tsx` | ~30 | Critical |
| `RecordingControls.tsx` | ~20 | Critical |
| `PermissionWarning.tsx` | ~15 | Critical |
| `ModelSettingsModal.tsx` | ~25 | High |
| `TranscriptSettings.tsx` | ~15 | High |
| `PreferenceSettings.tsx` | ~15 | High |
| `RecordingSettings.tsx` | ~12 | High |
| `DeviceSelection.tsx` | ~10 | High |
| `app/settings/page.tsx` | ~10 | High |
| `About.tsx` | ~10 | Medium |
| `LanguageSelection.tsx` | ~10 | Medium |
| Other components | ~50+ | Medium |

---

## 11. RECOMMENDATIONS FOR FRENCH TRANSLATION (Branch Intent)

Based on the branch name `claude/translate-app-french-011CV3ujRwr7mffNT23nP3Dq`, the goal appears to be French translation.

### French Translation Considerations:
1. **French Pluralization:** Use i18n library with plural support
2. **Gendered Terms:** Some UI elements may need gender-aware translations
3. **Capitalization:** French has different capitalization rules for UI elements
4. **Formality:** Decide on formal (vous) vs. informal (tu) tone
5. **Technical Terms:** Some tech terms may be kept in English (common in France)
6. **Date/Time Format:** Use locale-aware formatting (DD/MM/YYYY for French)
7. **Button Label Length:** French is typically 20-25% longer than English

### Priority French Strings:
- Navigation: "Accueil", "Paramètres", "Enregistrements", "Démarrer"
- Recording: "Commencer l'enregistrement", "Arrêter l'enregistrement", "En pause"
- Settings: All setting labels and help text
- Errors: All user-facing error messages

---

## CONCLUSION

The Meetily frontend is **ready for i18n implementation**. While no translation system currently exists, the codebase is well-structured for adding one. The main tasks are:

1. ✓ Choose i18n library (recommend: `next-intl`)
2. ✓ Extract all user-facing strings (~285 total)
3. ✓ Organize strings into logical translation files
4. ✓ Set up locale routing and context
5. ✓ Translate into target languages (French first, based on branch)
6. ✓ Test thoroughly across components

**Estimated total effort:** 30-36 hours for framework + English base + French translation

