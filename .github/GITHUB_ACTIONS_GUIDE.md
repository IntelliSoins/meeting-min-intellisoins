# 🚀 Guide GitHub Actions - Builds Automatiques Tauri

Ce guide explique comment utiliser GitHub Actions pour compiler automatiquement Meetily.

## 📦 Qu'est-ce que cela fait ?

GitHub Actions compile automatiquement l'application Tauri pour **4 plateformes** :
- 🐧 **Linux** (`.deb`, `.AppImage`)
- 🍎 **macOS Intel** (`.dmg`, `.app`)
- 🍎 **macOS Apple Silicon** (`.dmg`, `.app`)
- 🪟 **Windows** (`.msi`, `.exe`)

---

## ⚡ Déclenchement Automatique

Le workflow se lance automatiquement quand :

1. **Push sur main** ou **branche `claude/**`**
   ```bash
   git push origin claude/translate-app-french-011CV3ujRwr7mffNT23nP3Dq
   # ✅ Build lancé automatiquement !
   ```

2. **Pull Request vers main**
   ```
   Créer une PR → Build automatique pour tester
   ```

3. **Manuel** (workflow_dispatch)
   ```
   GitHub → Actions → Build Tauri App → Run workflow
   ```

4. **Tag de version** (ex: `v0.1.2`)
   ```bash
   git tag v0.1.2
   git push origin v0.1.2
   # ✅ Build + Release automatique !
   ```

---

## 📥 Télécharger les Exécutables

### Option 1 : Depuis GitHub Actions (pour toute branche)

1. **Aller sur GitHub** :
   ```
   https://github.com/IntelliSoins/meeting-min-intellisoins/actions
   ```

2. **Cliquer sur le workflow "Build Tauri App"**

3. **Sélectionner le run** (ex: commit `8d3b260`)

4. **Scroll vers le bas → Section "Artifacts"**

5. **Télécharger l'artifact** pour votre OS :
   - `meetily-Linux-8d3b260.zip`
   - `meetily-macOS Intel-8d3b260.zip`
   - `meetily-macOS Apple Silicon-8d3b260.zip`
   - `meetily-Windows-8d3b260.zip`

6. **Décompresser et installer** :
   - Linux: `sudo dpkg -i meetily_*.deb` ou double-clic sur `.AppImage`
   - macOS: Monter le `.dmg` et glisser dans Applications
   - Windows: Double-clic sur `.msi` ou `.exe`

### Option 2 : Depuis Releases (pour tags seulement)

Si un tag `v0.1.2` est pushé :

1. **Aller sur Releases** :
   ```
   https://github.com/IntelliSoins/meeting-min-intellisoins/releases
   ```

2. **Sélectionner la version** (ex: `v0.1.2`)

3. **Télécharger le fichier** pour votre OS dans "Assets"

---

## ⏱️ Temps de Build

| Plateforme | Temps moyen |
|------------|-------------|
| Linux      | ~15 min     |
| macOS      | ~20 min     |
| Windows    | ~18 min     |
| **Total**  | **~20-25 min** (parallèle) |

Les builds sont **en parallèle**, donc tous terminent en ~25 min max.

---

## 🔑 Configuration (Optionnel)

### Signatures Tauri (Recommandé pour production)

Pour signer les builds (vérification d'intégrité) :

1. **Générer une clé** (une seule fois) :
   ```bash
   cd frontend
   pnpm tauri signer generate
   ```

   Cela crée :
   - `~/.tauri/myapp.key` (clé privée - **GARDEZ SECRÈTE !**)
   - `myapp.pub` (clé publique)

2. **Ajouter secrets GitHub** :
   - Aller sur : Settings → Secrets and variables → Actions
   - Ajouter `TAURI_PRIVATE_KEY` : contenu de `myapp.key`
   - Ajouter `TAURI_KEY_PASSWORD` : mot de passe de la clé

3. Les builds seront maintenant signés automatiquement ✅

### Sans signatures

Si vous ne configurez pas les secrets, les builds fonctionneront quand même, mais sans signature.

---

## 🧪 Tester un Build de Branche

Pour tester la traduction française (branche actuelle) :

1. **Le build se lance automatiquement** après push
   ```bash
   git push origin claude/translate-app-french-011CV3ujRwr7mffNT23nP3Dq
   ```

2. **Attendre ~25 minutes**

3. **Télécharger l'artifact** depuis Actions

4. **Installer et tester** :
   - Lancer l'app
   - Settings → General → Interface Language
   - Cliquer sur "Français 🇫🇷"
   - Vérifier que tout est traduit ✅

---

## 📝 Notes Importantes

### Artifacts vs Releases

**Artifacts (GitHub Actions)** :
- ✅ Disponibles pour **toutes les branches**
- ⏱️ Expiration : **90 jours** par défaut
- 🔒 Accessible uniquement aux collaborateurs du repo
- 📦 Format : `.zip` contenant les installeurs

**Releases (GitHub Releases)** :
- ✅ Disponibles **uniquement pour les tags** (ex: `v0.1.2`)
- ⏱️ Permanents
- 🌍 Publics (si repo public)
- 📦 Format : Installeurs directement

### Consommation GitHub Actions

- **Minutes gratuites** : 2,000/mois (compte gratuit), 3,000/mois (Pro)
- **Build complet (4 plateformes)** : ~80-100 minutes
- **Estimation** : ~20-25 builds complets/mois avec compte gratuit

Pour économiser :
- Désactiver certaines plateformes si inutiles
- Ne builder que sur `main` et les tags
- Utiliser le cache (déjà configuré)

---

## 🔧 Personnalisation du Workflow

### Builder uniquement pour une plateforme

Éditer `.github/workflows/build-tauri.yml` :

```yaml
matrix:
  platform:
    # Commenter les plateformes non désirées
    # - os: ubuntu-22.04  # Linux
    - os: macos-latest    # macOS seulement
    # - os: windows-latest # Windows
```

### Builder uniquement sur main (pas les branches)

```yaml
on:
  push:
    branches:
      - main  # Retirer 'claude/**'
```

### Ajouter des tests avant build

```yaml
- name: Run tests
  working-directory: frontend
  run: pnpm test

- name: Build Tauri app
  # ... (reste du build)
```

---

## 🐛 Dépannage

### Build échoue sur Linux

**Erreur** : `package not found: libwebkit2gtk`

**Solution** : Les dépendances Linux sont déjà dans le workflow, mais si vous modifiez, vérifiez :
```yaml
- libwebkit2gtk-4.1-dev
- libappindicator3-dev
- libasound2-dev  # Important pour l'audio !
```

### Build échoue "out of disk space"

**Solution** : Ajouter nettoyage avant build :
```yaml
- name: Free disk space
  run: |
    sudo rm -rf /usr/share/dotnet
    sudo rm -rf /opt/ghc
```

### Artifacts ne se téléchargent pas

**Vérifier** :
1. Le build est terminé (checkmark vert ✅)
2. Vous êtes connecté à GitHub
3. Vous avez accès au repo

---

## 📚 Ressources

- **Tauri GitHub Actions** : https://tauri.app/v1/guides/building/cross-platform
- **Action Tauri officielle** : https://github.com/tauri-apps/tauri-action
- **GitHub Actions Docs** : https://docs.github.com/en/actions

---

## ✅ Checklist de Mise en Place

Pour activer complètement :

- [x] Fichier workflow créé (`.github/workflows/build-tauri.yml`)
- [ ] Fichier committé et pushé
- [ ] Vérifier que le workflow apparaît dans Actions
- [ ] Lancer un build test
- [ ] Télécharger et tester un artifact
- [ ] (Optionnel) Configurer les secrets Tauri pour signatures
- [ ] (Optionnel) Créer un premier tag pour release

---

**GitHub Actions est maintenant configuré pour Meetily ! 🎉**

Chaque push sur une branche `claude/**` déclenchera automatiquement un build multi-plateformes.
