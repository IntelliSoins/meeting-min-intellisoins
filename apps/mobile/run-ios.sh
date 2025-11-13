#!/bin/bash

echo "🚀 Lancement de Meetily sur iOS Simulator"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis apps/mobile/"
    exit 1
fi

echo "📦 Étape 1/4: Installation des dépendances..."
pnpm install

echo ""
echo "🔧 Étape 2/4: Initialisation du projet iOS (première fois seulement)..."
if [ ! -d "src-tauri/gen/apple" ]; then
    pnpm run tauri ios init
else
    echo "✓ Projet iOS déjà initialisé"
fi

echo ""
echo "🎯 Étape 3/4: Build du projet..."
echo "Cela peut prendre 5-10 minutes la première fois..."

echo ""
echo "📱 Étape 4/4: Lancement sur simulateur..."
pnpm run tauri:ios

echo ""
echo "✅ L'app devrait s'ouvrir dans le simulateur iOS !"
