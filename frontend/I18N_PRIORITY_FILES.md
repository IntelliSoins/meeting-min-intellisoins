# I18N Priority File Reference

This document lists the frontend files that contain the most user-facing text and should be the focus for i18n implementation.

## Critical Priority (Must Translate First)

These files contain core UI functionality that users interact with constantly.

### 1. Sidebar Navigation
**File:** `/frontend/src/components/Sidebar/index.tsx`
**Strings Count:** ~25
**Content:**
- Navigation items (Home, Settings, Start Recording)
- Search placeholder
- Meeting management labels
- Delete confirmation dialogs
- Edit meeting title modal
- Version text

**Key Strings to Translate:**
```
"Home", "Settings", "Start Recording", "Recording in progress...", "Search meeting content...",
"Back", "Save", "Cancel", "Delete", "Edit Meeting Title", "Meeting Title",
"Are you sure you want to delete this meeting? This action cannot be undone."
```

### 2. Main Recording Page
**File:** `/frontend/src/app/page.tsx`
**Strings Count:** ~30
**Content:**
- Recording status messages
- Transcript labels
- Summary section titles
- Device selection labels
- Language selection
- Error messages
- Button labels

**Key Strings to Translate:**
```
"+ New Call", "Key Points", "Action Items", "Decisions", "Main Topics",
"Start Recording", "Stop Recording", "Pause", "Resume"
```

### 3. Recording Controls
**File:** `/frontend/src/components/RecordingControls.tsx`
**Strings Count:** ~20
**Content:**
- Recording control buttons
- Status indicators
- Error messages
- Validation messages
- Device error handling

**Key Strings to Translate:**
```
"Start Recording", "Stop Recording", "Pause Recording", "Resume Recording",
"Recording...", "Failed to initialize recording..."
```

### 4. Permission Warnings
**File:** `/frontend/src/components/PermissionWarning.tsx`
**Strings Count:** ~15
**Content:**
- Permission requirement messages
- System-specific instructions
- Settings link buttons
- Recheck buttons

**Key Strings to Translate:**
```
"Permissions Required", "Microphone Permission Required", 
"System Audio Permission Required", "Open Microphone Settings",
"Open Screen Recording Settings", "Recheck",
"Meetily needs access to your microphone..."
```

### 5. Settings Page
**File:** `/frontend/src/app/settings/page.tsx`
**Strings Count:** ~10
**Content:**
- Page title
- Tab labels
- Back button

**Key Strings to Translate:**
```
"Settings", "Back", "General", "Recordings", "Transcription", "Summary"
```

---

## High Priority (Translate Second)

These files contain configuration and advanced settings that power users need to access.

### 6. Model Settings Modal
**File:** `/frontend/src/components/ModelSettingsModal.tsx`
**Strings Count:** ~25
**Content:**
- Provider selection labels
- Model dropdowns
- API key management
- Ollama endpoint configuration
- Download progress messages

**Key Strings to Translate:**
```
"Provider", "Model", "API Key", "Endpoint", "Show", "Hide", "Lock", "Unlock",
"Download", "Save Settings", "Cancel"
```

### 7. Transcript Settings
**File:** `/frontend/src/components/TranscriptSettings.tsx`
**Strings Count:** ~15
**Content:**
- Transcription provider selection
- Model selection
- API key management
- Language selection

**Key Strings to Translate:**
```
"Transcription Provider", "Model", "API Key", "Language",
"localWhisper", "parakeet", "deepgram", "openai", "groq"
```

### 8. Preference Settings
**File:** `/frontend/src/components/PreferenceSettings.tsx`
**Strings Count:** ~15
**Content:**
- Notification toggles
- Storage location display
- Settings labels

**Key Strings to Translate:**
```
"Notifications", "Notification Preferences", "Sound", "Do Not Disturb",
"Recording Started", "Recording Stopped", "Transcription Complete"
```

### 9. Recording Settings
**File:** `/frontend/src/components/RecordingSettings.tsx`
**Strings Count:** ~12
**Content:**
- Auto-save toggle
- Recording folder selection
- File format selection
- Device preferences

**Key Strings to Translate:**
```
"Auto-save recordings", "Recording Folder", "File Format", 
"Recording Format", "MP4", "WAV", "Browse"
```

### 10. Device Selection
**File:** `/frontend/src/components/DeviceSelection.tsx`
**Strings Count:** ~10
**Content:**
- Device type labels
- Dropdown prompts
- Refresh button
- Audio level display

**Key Strings to Translate:**
```
"Microphone", "System Audio", "Select a microphone device", 
"Select a system audio device", "Refresh", "Show audio levels"
```

---

## Medium Priority (Translate Third)

These files contain informational content and less-frequently-used features.

### 11. About Component
**File:** `/frontend/src/components/About.tsx`
**Strings Count:** ~10
**Content:**
- Product tagline
- Feature descriptions
- Company information
- Call-to-action button

**Key Strings to Translate:**
```
"Real-time notes and summaries that never leave your machine.",
"What makes Meetily different", "Privacy-first", "Use Any Model", 
"Cost-Smart", "Works everywhere",
"Chat with the Zackriya team", "Built by Zackriya Solutions"
```

### 12. Language Selection (Transcription)
**File:** `/frontend/src/components/LanguageSelection.tsx`
**Strings Count:** ~10
**Content:**
- Heading
- Language options
- Warning messages
- Status messages

**Key Strings to Translate:**
```
"Transcription Language", "Auto Detect (Original Language)",
"Auto Detect (Translate to English)", "Current:", "Parakeet Language Support"
```

### 13. Summary Components
**Files:** `frontend/src/components/MeetingDetails/SummaryGeneratorButtonGroup.tsx`
**Strings Count:** ~15
**Content:**
- Button labels
- Status messages
- Error messages
- Template selection

**Key Strings to Translate:**
```
"Generate Summary", "Regenerate Summary", "Generating...",
"No Ollama models found. Please download gemma2:2b from Model Settings."
```

### 14. Transcript Buttons
**File:** `frontend/src/components/MeetingDetails/TranscriptButtonGroup.tsx`
**Strings Count:** ~5
**Content:**
- Button labels
- Tooltips

**Key Strings to Translate:**
```
"Copy", "Recording", "Copy Transcript", "Open Recording Folder",
"No transcript available"
```

### 15. Compliance Notification
**File:** `/frontend/src/components/ComplianceNotification.tsx`
**Strings Count:** ~5
**Content:**
- Warning heading
- Instruction text
- Requirement label
- Button labels

**Key Strings to Translate:**
```
"Recording Notice", "Inform participants about recording.",
"US compliance required", "Later", "Done"
```

---

## Toast & Alert Messages (Distributed)

These error and success messages appear throughout the codebase. Key files to update:

**Files with Toast Messages:**
- `/frontend/src/components/Sidebar/index.tsx`
- `/frontend/src/components/RecordingControls.tsx`
- `/frontend/src/components/SummaryModelSettings.tsx`
- `/frontend/src/components/LanguageSelection.tsx`
- `/frontend/src/app/page.tsx`

**Common Messages to Translate:**
```
"Language preference saved"
"Meeting deleted successfully"
"All associated data has been removed"
"Meeting title updated successfully"
"Model settings saved successfully"
"Failed to save language preference"
"Failed to delete meeting"
"Failed to update meeting title"
"Failed to save model settings"
"Failed to load model settings"
```

---

## File Statistics Summary

| Priority | Files | Total Strings | Difficulty |
|----------|-------|---------------|------------|
| **Critical** | 5 | ~100 | Low-Medium |
| **High** | 5 | ~82 | Medium |
| **Medium** | 5+ | ~70+ | Medium-High |
| **Distributed (Toast/Errors)** | 10+ | ~35+ | Medium |
| | | **~287** | |

---

## Implementation Order

### Phase 1: Core Navigation (Days 1-2)
1. Sidebar/index.tsx
2. app/settings/page.tsx
3. RecordingControls.tsx

### Phase 2: Settings & Configuration (Days 3-4)
4. ModelSettingsModal.tsx
5. TranscriptSettings.tsx
6. PreferenceSettings.tsx
7. RecordingSettings.tsx
8. DeviceSelection.tsx

### Phase 3: Features & Errors (Days 5-6)
9. About.tsx
10. LanguageSelection.tsx (transcription language text)
11. Summary components
12. Toast/Alert messages throughout

### Phase 4: Testing & Polish (Day 7)
- Test all translations
- Check UI layout with longer translations
- Verify all messages appear correctly

---

## File Locations (Absolute Paths)

```
/home/user/meeting-min-intellisoins/frontend/src/components/Sidebar/index.tsx
/home/user/meeting-min-intellisoins/frontend/src/app/page.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/RecordingControls.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/PermissionWarning.tsx
/home/user/meeting-min-intellisoins/frontend/src/app/settings/page.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/ModelSettingsModal.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/TranscriptSettings.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/PreferenceSettings.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/RecordingSettings.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/DeviceSelection.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/About.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/LanguageSelection.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/MeetingDetails/SummaryGeneratorButtonGroup.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/MeetingDetails/TranscriptButtonGroup.tsx
/home/user/meeting-min-intellisoins/frontend/src/components/ComplianceNotification.tsx
```

---

## Notes for Translators

1. **Technical Terms:** Some terms like "Ollama", "Whisper", "Groq" should NOT be translated
2. **Device Names:** Device names from system (e.g., "Built-in Microphone") should NOT be translated
3. **File Paths:** System file paths should NOT be translated
4. **Model Names:** Model names from APIs (e.g., "llama3.2:latest") should NOT be translated
5. **Version Strings:** Version numbers should typically NOT be translated
6. **Buttons:** Keep button labels concise and consistent
7. **Help Text:** Preserve formatting and structure in help text blocks
8. **Tone:** Maintain neutral, professional tone throughout (especially for French - use "vous" form)

---

Generated: November 12, 2025
