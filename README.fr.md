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

## Téléchargement

Téléchargez la dernière version pour votre plateforme :

| Plateforme | Télécharger |
|------------|-------------|
| Windows (.msi) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.deb) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.AppImage) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| macOS (.dmg) | [Télécharger](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |

> Toutes les releases sont disponibles sur la [page des Releases](https://github.com/bleriotnoguia/lockbox-local/releases).

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

## Contexte et motivation

Lockbox Local est inspiré de [Pluckeye Lockbox](https://lockbox.pluckeye.net/help), une application web qui permet de stocker des informations dans des "boîtes" accessibles uniquement après un délai. C'est utile si vous avez besoin de cacher un mot de passe à vous-même, pour vous aider avec le **contrôle de soi**.

Pluckeye Lockbox existe depuis des années, mais c'est un service gratuit géré par une seule personne. Comme l'auteur le prévient :

> *"[Les boîtes Pluckeye Lockbox] menacent de s'autodétruire principalement pour que les utilisateurs ne supposent pas que le service existera pour toujours. Vous ne devriez pas supposer que vos données seront conservées plus d'un an, car le service est 100% gratuit et géré par une seule personne."* — [(Source)](https://www.reddit.com/r/pluckeye/comments/mvyvmw/lockbox_i_typed_never_into_the_self_destruct_date/)

Si vous aviez stocké un mot de passe critique dans Pluckeye Lockbox et que le serveur tombait en panne avec toutes les données perdues, vous seriez définitivement bloqué. **Lockbox Local résout ce problème** en gardant tout sur votre propre machine — aucune dépendance au cloud, aucun risque d'arrêt du service, et **les boîtes ne s'autodétruisent jamais**.

### Quoi de neuf par rapport à la [v1 (Java)](https://github.com/japierreSWE/Lockbox_Local) ?

Le Lockbox Local original était construit avec Java et SQLite. Cette **v2** est une réécriture complète utilisant des technologies modernes (Tauri 2.0 + React 19 + Rust), apportant le chiffrement AES-256-GCM, un mot de passe maître, des catégories, la recherche, les thèmes, et une empreinte bien plus légère (voir le [tableau comparatif](#comparaison-avec-la-v1-java) ci-dessous).

## Fonctionnalités

- **Stockage sécurisé** - Chiffrement AES-256-GCM de bout en bout
- **Délai d'accès** - Temps d'attente configurable avant de pouvoir accéder au contenu
- **Reverrouillage automatique** - Les lockboxes se reverrouillent après une période définie
- **Mot de passe maître** - Protection globale de l'application
- **Catégories** - Organisation de vos lockboxes par catégorie
- **Import/Export** - Sauvegarde et restauration au format JSON
- **Thème sombre/clair** - Interface adaptative selon vos préférences
- **Cross-platform** - Fonctionne sur Windows, macOS et Linux

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

1. Cliquez sur "Nouvelle Lockbox"
2. Entrez un nom et le contenu à protéger
3. Configurez le délai de déverrouillage (temps d'attente)
4. Configurez le délai de reverrouillage (durée d'accès)
5. Optionnel : Choisissez une catégorie

### Déverrouiller une Lockbox

1. Sélectionnez la lockbox
2. Cliquez sur "Déverrouiller"
3. Attendez que le compte à rebours se termine
4. Le contenu sera visible pendant la durée configurée

### Import/Export

- **Export** : Cliquez sur l'icône de téléchargement dans l'en-tête
- **Import** : Cliquez sur l'icône d'upload et sélectionnez un fichier `.json`

## Sécurité

### Chiffrement

- **Algorithme** : AES-256-GCM
- **Dérivation de clé** : PBKDF2 avec 100 000 itérations
- **Sel** : Généré aléatoirement pour chaque contenu

### Stockage

- Base de données SQLite locale
- Aucune donnée envoyée sur Internet
- Toutes les données restent sur votre machine

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
| Recherche | Non | Oui |
| Thème sombre | Non | Oui |
| Format d'export | .lbf (texte) | .json |

## Licence

Ce projet est sous licence MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
