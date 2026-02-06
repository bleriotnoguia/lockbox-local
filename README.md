# Lockbox Local v2.0

Une application desktop sécurisée de stockage d'informations sensibles avec délai d'accès, construite avec **React 19**, **TypeScript** et **Tauri 2.0**.

![Lockbox Local](https://img.shields.io/badge/version-2.0.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

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
sudo apt install -y libwebkit2gtk-4.0-dev \
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

## Comparaison avec la v1 (Java)

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

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
