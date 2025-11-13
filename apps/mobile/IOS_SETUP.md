# 📱 Guide de déploiement iOS - Meetily Mobile

Guide complet pour installer et tester Meetily sur iPhone ou iPad.

## 🍎 Prérequis

### Matériel
- **Mac** avec macOS 13+ (Ventura ou plus récent)
- **iPhone/iPad** avec iOS 13+ (ou simulateur)

### Logiciels

1. **Xcode 14+**
   ```bash
   # Vérifier l'installation
   xcodebuild -version

   # Si pas installé, télécharger depuis l'App Store
   # Rechercher "Xcode" (gratuit, ~15GB)
   ```

2. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **Rust 1.70+**
   ```bash
   # Vérifier
   rustc --version

   # Installer si nécessaire
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

4. **Targets iOS pour Rust**
   ```bash
   rustup target add aarch64-apple-ios
   rustup target add aarch64-apple-ios-sim
   rustup target add x86_64-apple-ios
   ```

5. **pnpm** (si pas déjà installé)
   ```bash
   npm install -g pnpm
   ```

---

## 🚀 Méthode rapide (Simulateur)

La façon la plus simple de tester l'app :

```bash
# 1. Aller dans le dossier mobile
cd /chemin/vers/meeting-min-intellisoins/apps/mobile

# 2. Exécuter le script
./run-ios.sh
```

Le script va :
1. Installer les dépendances npm
2. Initialiser le projet iOS (si première fois)
3. Compiler le code Rust + React
4. Lancer l'app dans le simulateur

⏱️ **Première compilation** : 5-10 minutes
⏱️ **Compilations suivantes** : 1-2 minutes

---

## 📱 Méthode manuelle

### 1. Installation des dépendances

```bash
cd apps/mobile
pnpm install
```

### 2. Initialisation iOS (première fois seulement)

```bash
pnpm run tauri ios init
```

Cela va :
- Créer le dossier `src-tauri/gen/apple/`
- Générer le projet Xcode
- Configurer les permissions

### 3. Lancement sur simulateur

```bash
pnpm run tauri:ios
```

Ou avec plus de contrôle :

```bash
# Lister les simulateurs disponibles
xcrun simctl list devices available

# Lancer sur un simulateur spécifique
pnpm run tauri ios dev --target "iPhone 15 Pro"
```

### 4. Lancement sur device physique

**Prérequis** :
- iPhone/iPad connecté en USB
- Mode développeur activé (Réglages → Confidentialité et sécurité → Mode développeur)
- Compte Apple Developer (gratuit pour tests)

**Étapes** :

1. **Ouvrir le projet dans Xcode** :
   ```bash
   open src-tauri/gen/apple/meetily-mobile.xcodeproj
   ```

2. **Configurer le signing** :
   - Sélectionner le projet dans la barre latérale
   - Onglet "Signing & Capabilities"
   - Team : Sélectionner votre compte Apple
   - Bundle Identifier : `com.intellisoins.meetily` (ou modifier)

3. **Sélectionner votre iPhone** dans la barre d'outils Xcode

4. **Run** (Cmd+R) ou depuis le terminal :
   ```bash
   pnpm run tauri ios dev --open
   ```

5. **Approuver l'app sur iPhone** :
   - Réglages → Général → Gestion des profils
   - Faire confiance à votre compte développeur

---

## 🎯 Tester l'application

### Étape 1 : Setup Screen

1. L'app s'ouvre sur l'écran de setup
2. Sélectionner un modèle :
   - **Tiny** : 40MB, rapide mais moins précis
   - **Base** : 75MB, recommandé ⭐
   - **Small** : 200MB, meilleur mais plus lent

3. Cliquer **"Download & Continue"**
   - Barre de progression s'affiche
   - Téléchargement depuis Hugging Face
   - ⏱️ 1-3 minutes selon connexion

### Étape 2 : Recording Screen

1. Accorder permission microphone (popup iOS)
2. Cliquer **"● Start Recording"** (bouton vert)
3. **Parler clairement** dans le micro pendant 5-10 secondes
4. **Attendre 1 seconde de silence** (déclenche la transcription)
5. Observer :
   - Dot rouge pulsant
   - Barres audio animées
   - Compteur de durée
6. La transcription apparaît automatiquement
7. Cliquer **"■ Stop Recording"** (bouton rouge)

### Vérifications

- ✅ Visualisation audio fonctionne (barres animées)
- ✅ Transcription apparaît dans "Complete Text"
- ✅ Segments individuels avec timestamps
- ✅ Badges "Final" sur les segments
- ✅ Bouton Back désactivé pendant enregistrement

---

## 🔧 Permissions iOS

L'app requiert les permissions suivantes :

### Info.plist (déjà configuré)

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Meetily needs microphone access to transcribe your meetings locally</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

Ces permissions sont demandées automatiquement au premier lancement.

---

## 📦 Build de production

Pour créer un build prêt pour TestFlight ou App Store :

```bash
# Build release
pnpm run tauri:ios:build

# Le fichier .ipa sera dans :
# src-tauri/gen/apple/build/arm64-apple-ios/release/
```

Pour distribuer via TestFlight :

1. Ouvrir le projet dans Xcode
2. Product → Archive
3. Window → Organizer
4. Distribute App → TestFlight
5. Suivre les étapes d'App Store Connect

---

## 🐛 Dépannage

### Problème : "Command not found: xcodebuild"

**Solution** : Installer Xcode depuis l'App Store

### Problème : "rustup target not found"

**Solution** :
```bash
rustup update
rustup target add aarch64-apple-ios aarch64-apple-ios-sim
```

### Problème : "Signing requires a development team"

**Solution** :
1. Ouvrir le projet dans Xcode
2. Sélectionner le projet (icône bleue)
3. Onglet "Signing & Capabilities"
4. Cocher "Automatically manage signing"
5. Sélectionner votre Team (compte Apple)

### Problème : "Microphone permission denied"

**Solution** :
1. Réglages iOS → Meetily → Microphone → Activer
2. Ou réinstaller l'app

### Problème : "Whisper model download fails"

**Solution** :
- Vérifier connexion internet
- Réessayer le téléchargement
- Les modèles viennent de : https://huggingface.co/ggerganov/whisper.cpp

### Problème : Compilation Rust échoue

**Solution** :
```bash
# Nettoyer le cache
cd apps/mobile/src-tauri
cargo clean

# Réinstaller les dépendances
cd ..
rm -rf node_modules
pnpm install
```

### Problème : "Simulator not booting"

**Solution** :
```bash
# Réinitialiser le simulateur
xcrun simctl shutdown all
xcrun simctl erase all

# Relancer
pnpm run tauri:ios
```

---

## 📊 Performance attendue

Sur **iPhone 12 ou plus récent** avec modèle **base.en** :

- **Transcription** : 2-3x temps réel (10s audio → 20-30s transcription)
- **Mémoire** : ~200-300MB
- **Batterie** : Modérée (transcription intensive)
- **Stockage** : 75MB (modèle) + ~50MB (app)

Avec **Metal GPU** (Semaine 6 - à venir) :
- Transcription : <1x temps réel (10s audio → 8-10s transcription)

---

## 🔒 Confidentialité

- ✅ **100% local** : Tout se passe sur votre iPhone
- ✅ **Aucune donnée envoyée** : Pas de serveur cloud
- ✅ **Offline** : Fonctionne sans internet (après téléchargement du modèle)
- ✅ **Pas de tracking** : Aucune analytics, aucune télémétrie

---

## 📞 Support

En cas de problème :

1. Vérifier ce guide de dépannage
2. Consulter les logs :
   ```bash
   # Sur simulateur
   xcrun simctl spawn booted log stream --predicate 'process == "meetily-mobile"'
   ```
3. Ouvrir une issue sur GitHub avec :
   - Version iOS
   - Modèle iPhone
   - Logs d'erreur
   - Étapes pour reproduire

---

## 🎯 Prochaines étapes

Après avoir testé :

- [ ] Tester différents modèles (tiny, base, small)
- [ ] Vérifier la qualité de transcription dans différents environnements
- [ ] Mesurer la performance sur votre device
- [ ] Reporter tout bug ou suggestion d'amélioration

**Semaine 6 (à venir)** : Optimisations Core ML pour 2-3x plus de vitesse ! 🚀
