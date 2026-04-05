# Lockbox Local v2.0

> [🇬🇧 Version anglaise](README.md) | [🇫🇷 Version française](README.fr.md)

Une application desktop sécurisée de stockage d'informations sensibles avec délai d'accès, construite avec **React 19**, **TypeScript** et **Tauri 2.0**.

![Lockbox Local](https://img.shields.io/badge/version-2.0.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
[![GitHub Release](https://img.shields.io/github/v/release/bleriotnoguia/lockbox-local)](https://github.com/bleriotnoguia/lockbox-local/releases/latest)

<p align="center">
  <img src="public/screenshot.png" alt="Capture d'écran Lockbox Local" width="800" />
</p>

## Contexte et motivation

Lockbox Local est inspiré de [Pluckeye Lockbox](https://lockbox.pluckeye.net/help), une application web qui permet de stocker des informations dans des "boîtes" accessibles uniquement après un délai. C'est utile si vous avez besoin de cacher un mot de passe à vous-même, pour vous aider avec le **contrôle de soi**.

Pluckeye Lockbox existe depuis des années, mais c'est un service gratuit géré par une seule personne. Comme l'auteur le prévient :

> *"[Les boîtes Pluckeye Lockbox] menacent de s'autodétruire principalement pour que les utilisateurs ne supposent pas que le service existera pour toujours. Vous ne devriez pas supposer que vos données seront conservées plus d'un an, car le service est 100% gratuit et géré par une seule personne."* — [(Source)](https://www.reddit.com/r/pluckeye/comments/mvyvmw/lockbox_i_typed_never_into_the_self_destruct_date/)

Si vous aviez stocké un mot de passe critique dans Pluckeye Lockbox et que le serveur tombait en panne avec toutes les données perdues, vous seriez définitivement bloqué. **Lockbox Local résout ce problème** en gardant tout sur votre propre machine — aucune dépendance au cloud, aucun risque d'arrêt du service, et **les boîtes ne s'autodétruisent jamais**.

### Quoi de neuf par rapport à la [v1 (Java)](https://github.com/japierreSWE/Lockbox_Local) ?

Le Lockbox Local original était construit avec Java et SQLite. Cette **v2** est une réécriture complète utilisant des technologies modernes (Tauri 2.0 + React 19 + Rust), apportant le chiffrement AES-256-GCM, un mot de passe maître, des catégories, la recherche, les thèmes, et une empreinte bien plus légère (voir le [tableau comparatif](#comparaison-avec-la-v1-java) ci-dessous).

## Fonctionnalités

### Socle
- **Stockage sécurisé** — Chiffrement AES-256-GCM de bout en bout avec dérivation de clé PBKDF2
- **Délai d'accès** — Temps d'attente configurable avant de pouvoir accéder au contenu
- **Reverrouillage automatique** — Les lockboxes se reverrouillent automatiquement après une période définie
- **Mot de passe maître** — Protection globale de l'application ; jamais stocké en clair

### Outils de self-control
- **Abandonner le countdown** — Annuler un compte à rebours d'unlock en cours à tout moment
- **Augmenter le délai** — Augmenter définitivement le délai de déverrouillage d'une lockbox (augmentation uniquement, jamais de diminution)
- **Modal de réflexion** — Pause forcée de 10 secondes optionnelle avant de confirmer un déverrouillage ; supporte un message personnalisé et une checklist à cocher entièrement
- **Mode pénalité** — Ajoute automatiquement un délai supplémentaire si le countdown est annulé, configurable par lockbox
- **Code panique** — Code de contournement d'urgence à usage unique défini à la création ; une fois utilisé, il ne peut être réinitialisé qu'en le modifiant dans les paramètres

### Organisation
- **Catégories** — Organisation par catégorie prédéfinie
- **Tags libres** — Ajoutez autant de tags personnalisés que vous voulez ; filtrez la liste depuis la sidebar
- **Déverrouillage planifié** — Définissez une date et heure précises à partir desquelles la lockbox devient déverrouillable automatiquement

### Suivi
- **Journal d'accès** — Historique par lockbox de tous les événements : demandes, déverrouillages, annulations, utilisations du code panique, extensions de délai
- **Statistiques self-control** — Stats mensuelles et globales sur toutes les lockboxes : demandes, complétions, annulations, paniques, extensions ; streak actuel (jours sans accès)

### Sauvegarde
- **Import/Export** — Sauvegarde et restauration au format JSON signé ; transfert cross-machine avec rechiffrement ; protection d'intégrité HMAC contre la manipulation des délais

### Interface
- **Documentation intégrée** — Guide accessible depuis l'en-tête
- **À propos & support** — Version de l'app, liens développeur, options de donation, newsletter
- **Thème sombre/clair/système** — Interface adaptative ; persistante entre les sessions
- **Localisation EN/FR** — Traductions complètes anglais et français
- **Cross-platform** — Fonctionne sur Windows, macOS et Linux

## Téléchargement

Téléchargez la dernière version pour votre plateforme :

| Plateforme | Télécharger |
|------------|-------------|
| Windows (.msi) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.deb) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.AppImage) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| macOS (.dmg) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |

> Toutes les releases sont disponibles sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases).

## Installation

### Linux (Ubuntu/Debian) — .deb

1. Téléchargez le fichier `.deb` sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Installez avec :

```bash
sudo dpkg -i Lockbox-Local_*.deb
```

Si des dépendances manquent :

```bash
sudo apt-get install -f
```

### Windows — .msi

1. Téléchargez le fichier `.msi` sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Double-cliquez sur le fichier et suivez l'assistant d'installation
3. Lancez **Lockbox Local** depuis le menu Démarrer

### macOS — .dmg

1. Téléchargez le fichier `.dmg` sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Ouvrez le fichier `.dmg`
3. Glissez **Lockbox Local** vers le dossier **Applications**
4. Lancez depuis Applications ou Spotlight

> **Note :** Si macOS affiche un message indiquant que l'application « est endommagée et ne peut pas être ouverte », c'est parce que l'application n'est pas encore notarisée par Apple. Pour corriger cela, ouvrez le **Terminal** et exécutez :
>
> ```bash
> xattr -cr /Applications/Lockbox\ Local.app
> ```
>
> Puis relancez l'application.

### Linux — AppImage

1. Téléchargez le fichier `.AppImage` sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Rendez-le exécutable :

```bash
chmod +x Lockbox-Local_*.AppImage
```

3. Exécutez-le :

```bash
./Lockbox-Local_*.AppImage
```

Aucune installation requise — l'AppImage fonctionne comme une application portable.

## Désinstallation

### Linux (Ubuntu/Debian) — .deb

```bash
sudo apt remove lockbox-local
```

Pour supprimer aussi la configuration et les données :

```bash
sudo apt remove lockbox-local
rm -rf ~/.local/share/com.lockbox.local
rm -rf ~/.config/com.lockbox.local
```

### Windows — .msi

1. Ouvrez **Paramètres** → **Applications** → **Applications installées**
2. Recherchez **Lockbox Local**
3. Cliquez sur les trois points → **Désinstaller**

Ou via PowerShell :

```powershell
Get-Package -Name "Lockbox Local" | Uninstall-Package
```

### macOS — .dmg

1. Ouvrez **Finder** → **Applications**
2. Glissez **Lockbox Local** vers la Corbeille
3. Vide la Corbeille

### Linux — AppImage

Si vous avez exécuté l'AppImage directement (sans installation) :

1. Supprimez le fichier `.AppImage`
2. Optionnel : supprimez la configuration et les données :

```bash
rm -rf ~/.local/share/com.lockbox.local
rm -rf ~/.config/com.lockbox.local
```

## Prérequis

### Pour le développement

- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://rustup.rs/) (stable 1.77+)
- [Tauri CLI 2.0](https://v2.tauri.app/)

### Installation des prérequis sur Ubuntu

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Dépendances système pour Tauri
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## Installation

```bash
# Cloner le projet (si nécessaire)
cd new-lockbox-local

# Installer les dépendances npm
npm install

# Lancer en mode développement
npm run tauri:dev

# Compiler pour la production
npm run tauri:build
```

## Structure du projet

```
new-lockbox-local/
├── src/                          # Frontend React/TypeScript
│   ├── components/               # Composants React
│   │   ├── ui/                   # Composants UI réutilisables
│   │   ├── LockboxCard.tsx       # Carte de lockbox
│   │   ├── LockboxList.tsx       # Liste des lockboxes
│   │   ├── LockboxDetail.tsx     # Détail d'une lockbox
│   │   ├── CreateLockboxModal.tsx# Modal de création
│   │   ├── Header.tsx            # En-tête
│   │   ├── Sidebar.tsx           # Barre latérale
│   │   └── LoginScreen.tsx       # Écran de connexion
│   ├── hooks/                    # Hooks personnalisés
│   │   ├── useCountdown.ts       # Compteur à rebours
│   │   ├── useLockboxStatus.ts   # Statut des lockboxes
│   │   └── useExportImport.ts    # Import/Export
│   ├── store/                    # État global (Zustand)
│   │   ├── lockboxStore.ts       # Store des lockboxes
│   │   ├── authStore.ts          # Store d'authentification
│   │   └── themeStore.ts         # Store du thème
│   ├── types/                    # Types TypeScript
│   ├── styles/                   # CSS/Tailwind
│   ├── App.tsx                   # Composant principal
│   └── main.tsx                  # Point d'entrée
│
├── src-tauri/                    # Backend Rust/Tauri
│   ├── src/
│   │   ├── main.rs               # Point d'entrée Tauri
│   │   ├── db.rs                 # Opérations SQLite
│   │   ├── crypto.rs             # Chiffrement AES
│   │   └── commands.rs           # Commandes Tauri
│   ├── Cargo.toml                # Dépendances Rust
│   └── tauri.conf.json           # Configuration Tauri
│
├── package.json                  # Dépendances npm
├── vite.config.ts                # Configuration Vite
├── tailwind.config.js            # Configuration Tailwind
└── tsconfig.json                 # Configuration TypeScript
```

## Utilisation

### Premier lancement

1. Au premier lancement, créez un **mot de passe maître**
2. Ce mot de passe chiffre toutes vos données
3. **Important** : Ce mot de passe ne peut pas être récupéré !

### Créer une Lockbox

1. Cliquez sur **"Nouvelle Lockbox"**
2. Entrez un nom et le contenu à protéger
3. Définissez le **délai de déverrouillage** (temps d'attente) et le **délai de reverrouillage** (durée d'accès)
4. Optionnel : choisissez une **catégorie** et ajoutez des **tags libres**
5. Dépliez les sections avancées pour configurer :
   - **Réflexion** — activez la pause de 10 secondes, ajoutez un message personnalisé et/ou une checklist ligne par ligne
   - **Pénalité** — activez le mode pénalité et définissez le délai supplémentaire appliqué en cas d'annulation
   - **Déverrouillage planifié** — choisissez une date et heure de déverrouillage automatique
   - **Code panique** — définissez un code de contournement d'urgence à usage unique

### Déverrouiller une Lockbox

1. Sélectionnez la lockbox dans la liste
2. Cliquez sur **"Déverrouiller"**
3. Si une **modal de réflexion** est configurée, lisez le message et cochez tous les éléments de la checklist pendant le compte à rebours de 10 secondes
4. Attendez que le compte à rebours se termine
5. Le contenu est visible pendant la durée de reverrouillage configurée

### Pendant le countdown

Lorsqu'une lockbox compte à rebours, le panneau de détail propose des actions supplémentaires :

- **Augmenter le délai** (bouton ＋) — augmente définitivement le délai de déverrouillage du montant choisi ; étend également le countdown actif en cours
- **Annuler le déverrouillage** (bouton ✕) — abandonne le countdown et revient à l'état verrouillé ; si le mode pénalité est actif, un avertissement affiche le délai supplémentaire qui sera appliqué

### Code panique

Si un code panique a été défini à la création, une section d'urgence apparaît dans le détail de la lockbox lorsqu'elle est verrouillée. Saisissez le code pour contourner instantanément le délai. **Le code ne peut être utilisé qu'une seule fois** — un nouveau code ne peut être défini qu'en modifiant la lockbox.

### Déverrouillage planifié

Lorsqu'une lockbox a une date planifiée, son statut affiche **Planifié** avec une icône calendrier et un compte à rebours jusqu'à l'heure choisie. À cette heure, la lockbox passe automatiquement en mode countdown normal. Vous pouvez toujours annuler ou étendre depuis le panneau de détail.

### Journal d'accès et statistiques

- **Journal d'accès** (par lockbox) — cliquez sur "Historique d'accès" en bas du détail d'une lockbox pour voir l'historique complet des événements
- **Statistiques** (globales) — cliquez sur l'icône graphique dans l'en-tête ou "Voir les détails" dans la sidebar pour consulter les stats de self-control mensuelles et globales ainsi que votre streak actuel

### Import/Export

#### Exporter

Cliquez sur l'**icône de téléchargement** (↓) dans l'en-tête. Un dialog natif vous permet de choisir l'emplacement du fichier `.json`.

Après la sauvegarde, un message vous rappelle :

> _« Si vous importez ce fichier sur une autre machine ou avec un mot de passe maître différent, le mot de passe source vous sera demandé pour rechiffrer les données. »_

#### Importer

Cliquez sur l'**icône d'upload** (↑) dans l'en-tête. Un dialog vous demande si le fichier provient d'une autre machine :

- **Même machine / même mot de passe** — cliquez sur « Même machine — ignorer ». Les données chiffrées sont insérées telles quelles, sans rechiffrement.
- **Machine différente ou mot de passe différent** — saisissez le mot de passe maître qui était actif lors de l'export. L'application déchiffre le contenu avec le mot de passe source et le rechiffre avec le mot de passe actuel.

Les lockboxes dont le nom existe déjà sont silencieusement ignorées (pas d'écrasement).

#### Ce qui est conservé

| Champ | Exporté | Importé |
|---|:---:|:---:|
| Nom | ✓ | ✓ |
| Contenu (chiffré) | ✓ | ✓ (rechiffré si nécessaire) |
| Délais déverrouillage & reverrouillage | ✓ | ✓ |
| Catégorie & tags | ✓ | ✓ |
| Paramètres de réflexion | ✓ | ✓ |
| Paramètres de pénalité | ✓ | ✓ |
| Code panique | — | — |
| Date de déverrouillage planifié | — | — |

> Les codes panique ne peuvent pas être transférés car seul le hash est stocké — le code original n'est jamais sauvegardé. Les dates planifiées ne sont intentionnellement pas restaurées, car une date passée n'aurait aucun sens.

#### Sécurité et intégrité

Le fichier exporté contient le contenu **sous forme chiffrée** (AES-256-GCM). Il est illisible sans le mot de passe maître. Chaque entrée est signée avec **HMAC-SHA256** en utilisant le hash du mot de passe maître.

À l'import, la signature est vérifiée avant toute écriture. Si le fichier a été modifié (ex : délais réduits, contenu substitué), l'import est rejeté avec une erreur d'intégrité. Cela empêche d'utiliser l'import/export pour contourner le délai de déverrouillage.

> **Note self-control :** Le délai de déverrouillage est un mécanisme de friction délibéré. L'export ne révèle pas le contenu en clair, et les fichiers manipulés sont rejetés — le délai ne peut pas être contourné via le flux import/export.

## Sécurité

### Chiffrement

- **Algorithme** : AES-256-GCM
- **Dérivation de clé** : PBKDF2 avec 100 000 itérations
- **Sel** : Généré aléatoirement pour chaque contenu

### Stockage

- Base de données SQLite locale — toutes les données restent sur votre machine
- Aucune connexion réseau, aucune télémétrie, aucune dépendance cloud
- Les codes panique sont stockés uniquement sous forme de hash irréversible

### Intégrité de l'export

Les fichiers exportés sont signés avec **HMAC-SHA256** en utilisant le hash du mot de passe maître. Toute modification du fichier (délais, contenu, noms) invalide la signature et provoque le rejet de l'import. Cela empêche d'utiliser l'import/export pour contourner le délai de déverrouillage.

### Conception self-control

Le délai de déverrouillage est un mécanisme de friction délibéré, pas un verrou cryptographique. L'application est conçue pour résister aux tentatives **impulsives** d'accès au contenu, pas aux attaques d'un utilisateur déterminé qui connaît le mot de passe maître. Pour une protection renforcée, envisagez un délai plus long ou l'activation du mode pénalité.

## Développement

### Scripts disponibles

```bash
# Développement
npm run dev          # Lance Vite (frontend uniquement)
npm run tauri:dev    # Lance Tauri + Vite

# Build
npm run build        # Build le frontend
npm run tauri:build  # Build l'application complète

# Lint
npm run lint         # Vérifie le code TypeScript
```

### Tests

```bash
# Tests Rust
cd src-tauri
cargo test
```

## Création des packages d'installation

### Package .deb (Ubuntu/Debian)

Pour créer un package `.deb` sur Ubuntu, Tauri génère automatiquement le package lors du build :

```bash
# S'assurer que toutes les dépendances sont installées
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    patchelf

# Installer les dépendances du projet
npm install

# Construire l'application (génère automatiquement le .deb)
npm run tauri:build
```

Le package `.deb` sera généré dans :
```
src-tauri/target/release/bundle/deb/lockbox-local_2.0.0_amd64.deb
```

**Installation du package .deb :**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/lockbox-local_2.0.0_amd64.deb

# Si des dépendances manquent, installer avec :
sudo apt-get install -f
```

### Package .exe (Windows)

#### Option 1 : Build sur Windows (recommandé)

Sur une machine Windows avec les prérequis installés :

```bash
# Installer les prérequis Windows
# - Node.js (v20+)
# - Rust (via rustup)
# - Microsoft Visual C++ Build Tools

# Installer les dépendances
npm install

# Construire l'application
npm run tauri:build
```

Le fichier `.exe` sera généré dans :
```
src-tauri/target/release/lockbox-local.exe
```

Un installateur MSI sera également créé dans :
```
src-tauri/target/release/bundle/msi/lockbox-local_2.0.0_x64_en-US.msi
```

#### Option 2 : Cross-compilation depuis Linux (avancé)

Le projet utilise GitHub Actions pour construire Windows, Linux et macOS et pour publier les releases au push de tag. Voir [`.github/workflows/build.yml`](.github/workflows/build.yml) pour le workflow.

### Configuration avancée des packages

Pour personnaliser les métadonnées des packages, modifiez [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) (sections `bundle`, et éventuellement `bundle.linux.deb` ou `bundle.windows`).

> **Note** : Par défaut, Tauri détecte automatiquement les dépendances système nécessaires. Ne spécifiez le champ `depends` que si vous avez besoin d'ajouter des dépendances supplémentaires.

### Scripts npm pour faciliter le build

Vous pouvez ajouter ces scripts dans `package.json` :

```json
{
  "scripts": {
    "build:linux": "tauri build --target x86_64-unknown-linux-gnu",
    "build:windows": "tauri build --target x86_64-pc-windows-msvc",
    "build:all": "npm run build:linux && npm run build:windows"
  }
}
```

## Comparaison avec la [v1 (Java)](https://github.com/japierreSWE/Lockbox_Local)

| Fonctionnalité | v1 (Java) | v2 (Tauri) |
|----------------|-----------|------------|
| Taille du bundle | ~100 MB | ~15 MB |
| RAM | ~150 MB | ~50 MB |
| Chiffrement | Non | AES-256-GCM |
| Mot de passe maître | Non | Oui |
| Catégories | Non | Oui |
| Tags libres | Non | Oui |
| Recherche | Non | Oui |
| Thème sombre | Non | Oui |
| Abandonner le countdown | Non | Oui |
| Augmenter le délai | Non | Oui |
| Modal de réflexion | Non | Oui |
| Mode pénalité | Non | Oui |
| Code panique | Non | Oui |
| Déverrouillage planifié | Non | Oui |
| Journal d'accès | Non | Oui |
| Statistiques self-control | Non | Oui |
| Format d'export | .lbf (texte) | .json (signé HMAC) |
| Localisation EN/FR | Non | Oui |

## Version mobile

Lockbox Local est également disponible en tant qu'application mobile native pour **iOS et Android**.

| | |
|---|---|
| **Dépôt** | [github.com/bleriotnoguia/lockbox-local-mobile](https://github.com/bleriotnoguia/lockbox-local-mobile) |
| **Releases** | [Dernière version](https://github.com/bleriotnoguia/lockbox-local-mobile/releases/latest) |

La version mobile partage le même format de chiffrement, les mêmes signatures HMAC et le même schéma de données que cette version desktop — les fichiers d'export sont entièrement compatibles entre les deux plateformes.

**Fonctionnalités supplémentaires de la version mobile :**
- Déverrouillage biométrique (Face ID / Empreinte digitale)
- Notifications push locales à la fin d'un countdown de déverrouillage
- Construite avec Expo SDK 54 + React Native + NativeWind

## Licence

Ce projet est sous licence MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
