# BuonaFortuna 🛍️

Une marketplace multi-vendeurs pour les vêtements de seconde main. Interface entièrement en français, thème clair, palette "coccinelle" rouge & noir.

## Fonctionnalités

- **Accueil** — bannière, catégories, boutiques à la une, coups de cœur
- **Recherche** — recherche textuelle boutiques + articles, filtres par catégorie
- **Boutiques** — annuaire avec recherche, filtre, tri et "ouvert maintenant"
- **Page boutique** — photo de couverture, note, onglets Articles / À propos / Avis
- **Page article** — image, prix, taille, état, vendeur, ajouter au panier
- **Panier** — ajout, quantité, suppression, récapitulatif prix
- **Favoris** — sauvegardés localement, accessibles depuis le profil
- **Notifications** — liste de notifications avec état lu/non-lu
- **Profil** — stats, ma boutique, raccourcis favoris/notifications
- **Paramètres** — compte, préférences, support, déconnexion
- **Connexion / Inscription** — authentification fictive (tout email valide fonctionne)

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/anas1412/BuonaFortuna.git
cd BuonaFortuna
npm install
```

### Lancer en développement

```bash
npx expo start
```

Puis :
- Appuyez sur **w** pour le **web** (navigateur)
- Appuyez sur **a** pour **Android** (émulateur ou Expo Go)
- Appuyez sur **i** pour **iOS** (simulateur ou Expo Go)
- Scannez le **QR code** avec l'app **Expo Go** sur votre téléphone

### Lancer en web uniquement

```bash
npx expo start --web
```

L'app s'ouvre sur `http://localhost:8081`.

## Générer un APK Android

### Option 1 : EAS Build (recommandé)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Le lien de téléchargement de l'APK sera affiché dans le terminal.

### Option 2 : Build local

```bash
npx expo run:android
```

Nécessite Android Studio et un SDK Android configuré.

## Générer un IPA iOS

```bash
eas build -p ios --profile preview
```

Nécessite un compte Apple Developer et EAS Build.

## Structure du projet

```
app/
  _layout.tsx                Layout racine (polices, providers)
  index.tsx                  Redirige vers les onglets
  (auth)/
    login.tsx                Connexion
    signup.tsx               Inscription
  (tabs)/
    index.tsx                Accueil
    search.tsx               Recherche
    vendors.tsx              Annuaire boutiques
    cart.tsx                 Panier
    profile.tsx              Profil
  vendor/[id].tsx            Page boutique
  product/[id].tsx           Page article
  favorites.tsx              Liste favoris
  notifications.tsx          Notifications
  settings.tsx               Paramètres

components/                  UI réutilisable
constants/theme.ts           Tokens de design
context/                     États globaux (Auth, Cart, Favorites, Search)
data/                        Données fictives (mockData, notifications)
```

## Technologies

- **Framework** : [Expo](https://expo.dev/) + [expo-router](https://docs.expo.dev/router/)
- **Langage** : TypeScript (strict)
- **UI** : React Native
- **Polices** : Playfair Display (titres) + Inter (corps)
- **Icônes** : Ionicons (@expo/vector-icons)
- **Persistance** : AsyncStorage (favoris, panier)

## Note

Toutes les données sont fictives (pas de backend). L'app fonctionne immédiatement après `npm install`.

## Licence

MIT
