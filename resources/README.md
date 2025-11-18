# Resources pour les apps mobiles

## Icônes requises

### icon.png
- **Taille:** 1024x1024px minimum
- **Format:** PNG avec transparence
- **Contenu:** Logo JomionStore centré
- **Utilisation:** Générera toutes les tailles d'icônes pour Android et iOS

### splash.png
- **Taille:** 2732x2732px (pour couvrir tous les écrans)
- **Format:** PNG
- **Contenu:** Logo + fond de couleur #FF5722
- **Utilisation:** Écran de démarrage de l'app

## Génération automatique

Une fois que tu as créé ces 2 images, lance:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

Cela générera automatiquement:
- Toutes les tailles d'icônes Android (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Toutes les tailles d'icônes iOS (20pt à 1024pt)
- Tous les splash screens adaptés à chaque taille d'écran

## Où placer tes images

1. Remplace `resources/icon.png` par ton icône 1024x1024
2. Remplace `resources/splash.png` par ton splash screen 2732x2732
3. Lance la commande de génération ci-dessus

## Design recommandé

### Icon
- Logo simple et reconnaissable
- Pas de texte (trop petit)
- Contraste élevé
- Marges de 10% sur les bords

### Splash
- Logo centré
- Fond uni couleur brand (#FF5722)
- Texte "JomionStore" sous le logo (optionnel)
- Design épuré et professionnel
