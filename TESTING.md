# Guide de Testing - JomiaStore

## 📋 Vue d'ensemble

Ce projet utilise deux outils de test principaux :
- **Jest + Testing Library** pour les tests unitaires et d'intégration
- **Playwright** pour les tests E2E (End-to-End)

## 🧪 Tests Unitaires avec Jest

### Lancer les tests

```bash
# Lancer tous les tests unitaires
npm run test

# Lancer les tests en mode watch
npm run test:watch

# Générer un rapport de coverage
npm run test:coverage
```

### Structure des tests

```
components/__tests__/
  └── Header.test.tsx
  └── Breadcrumb.test.tsx
lib/__tests__/
  └── services.test.ts
```

### Exemple de test unitaire

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 🎭 Tests E2E avec Playwright

### Lancer les tests E2E

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Lancer les tests en mode UI
npm run test:e2e:ui

# Lancer les tests en mode headed (avec navigateur visible)
npm run test:e2e:headed
```

### Structure des tests E2E

```
tests/e2e/
  └── homepage.spec.ts
  └── navigation.spec.ts
  └── authentication.spec.ts
```

### Exemple de test E2E

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/JomiaStore/);
});
```

## 📊 Code Coverage

Le coverage est configuré avec les seuils suivants :
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

Pour voir le rapport de coverage :

```bash
npm run test:coverage
```

Le rapport sera généré dans `coverage/lcov-report/index.html`.

## 🚀 CI/CD

Les tests sont automatiquement exécutés sur GitHub Actions lors :
- Des push sur `main` et `develop`
- Des pull requests vers `main`

Le workflow exécute :
1. Tests unitaires avec coverage
2. Tests E2E sur Chromium, Firefox et WebKit
3. Build de l'application

## 📝 Bonnes pratiques

### Tests unitaires
- Tester les comportements, pas l'implémentation
- Un test = une assertion principale
- Utiliser des mocks pour les dépendances externes
- Nommer clairement les tests (`should do X when Y`)

### Tests E2E
- Tester les parcours utilisateur critiques
- Utiliser des sélecteurs stables (data-testid, role, text)
- Attendre les éléments avant d'interagir
- Nettoyer l'état entre les tests

## 🔧 Configuration

### Jest Configuration
- Fichier: `jest.config.js`
- Setup: `jest.setup.js`

### Playwright Configuration
- Fichier: `playwright.config.ts`
- Tests: `tests/e2e/`

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🐛 Dépannage

### Les tests unitaires échouent

1. Vérifier que les mocks sont correctement configurés
2. Vérifier les imports des modules
3. Consulter `jest.setup.js` pour les configurations globales

### Les tests E2E échouent

1. Vérifier que le serveur de développement est lancé
2. Vérifier que Playwright est installé (`npx playwright install`)
3. Augmenter les timeouts si nécessaire
4. Utiliser `--headed` pour voir le navigateur

## 🎯 Commandes rapides

```bash
# Lancer tous les tests (unitaires + E2E)
npm run test:all

# Lancer les tests pour CI
npm run test:ci

# Installer les navigateurs Playwright
npx playwright install

# Voir le rapport Playwright
npx playwright show-report
```