# Lockbox Local v2.0

> [🇫🇷 Version française](README.fr.md) | [🇬🇧 English version](README.md)

A secure desktop application for storing sensitive information with access delay, built with **React 19**, **TypeScript** and **Tauri 2.0**.

![Lockbox Local](https://img.shields.io/badge/version-2.0.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
[![GitHub Release](https://img.shields.io/github/v/release/bleriotnoguia/lockbox-local)](https://github.com/bleriotnoguia/lockbox-local/releases/latest)

<p align="center">
  <img src="public/screenshot.png" alt="Lockbox Local Screenshot" width="800" />
</p>

## Background & Motivation

Lockbox Local is inspired by [Pluckeye Lockbox](https://lockbox.pluckeye.net/help), a web application that lets you store information in "boxes" which can only be accessed after a delay period. This is useful if you need to hide a password from yourself, for help with **self-control**.

Pluckeye Lockbox has been around for years, but it's a free service run by a single person. As the author warns:

> *"[Pluckeye Lockbox boxes] threaten to destruct mainly so that users do not assume the service will be around forever. You should not assume your data will be kept longer than 1 year, because the service is 100% free and run by one person."* — [(Source)](https://www.reddit.com/r/pluckeye/comments/mvyvmw/lockbox_i_typed_never_into_the_self_destruct_date/)

If you stored a critical password in Pluckeye Lockbox and the server crashed with all data lost, you'd be permanently locked out. **Lockbox Local solves this** by keeping everything on your own machine — no cloud dependency, no risk of service shutdown, and **boxes never self-destruct**.

### What changed from [v1 (Java)](https://github.com/japierreSWE/Lockbox_Local)?

The original Lockbox Local was built with Java and SQLite. This **v2** is a complete rewrite using modern technologies (Tauri 2.0 + React 19 + Rust), bringing AES-256-GCM encryption, a master password, categories, search, theming, and a much smaller footprint (see [comparison table](#comparison-with-v1-java) below).

## Features

### Core
- **Secure storage** — End-to-end AES-256-GCM encryption with PBKDF2 key derivation
- **Access delay** — Configurable waiting time before accessing content
- **Auto re-lock** — Lockboxes automatically re-lock after a defined period
- **Master password** — Global application protection; never stored in plaintext

### Self-control tools
- **Cancel countdown** — Abandon an active unlock countdown at any time
- **Extend delay** — Permanently increase a lockbox's unlock delay (increase only, never decrease)
- **Reflection modal** — Optional 10-second forced pause before confirming an unlock; supports a custom message and a checklist that must be fully ticked before proceeding
- **Penalty mode** — Automatically adds extra delay when a countdown is cancelled, configurable per lockbox
- **Panic code** — A single-use emergency bypass code set at lockbox creation; once used it cannot be reset without the code

### Organisation
- **Categories** — Organize your lockboxes by predefined category
- **Free tags** — Add any number of custom tags to a lockbox; filter the list by tag from the sidebar
- **Scheduled unlock** — Set a specific date and time for a lockbox to automatically become unlockable

### Monitoring
- **Access log** — Per-lockbox history of all unlock requests, completions, cancellations, panic uses and delay extensions
- **Self-control statistics** — Monthly and all-time stats across all lockboxes: requests, completions, cancellations, panic uses, extensions; current streak (days without access)

### Backup
- **Import/Export** — Backup and restore in signed JSON format; cross-machine transfer with password re-encryption; HMAC integrity protection prevents delay tampering

### Interface
- **In-app documentation** — Built-in guide accessible from the header
- **About & support** — App version, developer links, donation options, newsletter
- **Dark/Light/System theme** — Adaptive interface; persists across sessions
- **EN/FR localisation** — Full English and French translations
- **Cross-platform** — Works on Windows, macOS and Linux

## Download

Download the latest version for your platform:

| Platform | Download |
|----------|----------|
| Windows (.msi) | [Download](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.deb) | [Download](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| Linux (.AppImage) | [Download](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |
| macOS (.dmg) | [Download](https://github.com/bleriotnoguia/lockbox-local/releases/latest) |

> All releases are available on the [Releases page](https://github.com/bleriotnoguia/lockbox-local/releases).

## Install

### Linux (Ubuntu/Debian) — .deb

1. Download the `.deb` file from the [Releases page](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Install with:

```bash
sudo dpkg -i Lockbox-Local_*.deb
```

If dependencies are missing:

```bash
sudo apt-get install -f
```

### Windows — .msi

1. Download the `.msi` file from the [Releases page](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Double-click the file and follow the installation wizard
3. Launch **Lockbox Local** from the Start menu

### macOS — .dmg

1. Download the `.dmg` file from the [Releases page](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Open the `.dmg` file
3. Drag **Lockbox Local** to the **Applications** folder
4. Launch from Applications or Spotlight

> **Note:** If macOS shows a message saying the app "is damaged and can't be opened", this is because the app is not yet notarized by Apple. To fix this, open **Terminal** and run:
>
> ```bash
> xattr -cr /Applications/Lockbox\ Local.app
> ```
>
> Then try launching the app again.

### Linux — AppImage

1. Download the `.AppImage` file from the [Releases page](https://github.com/bleriotnoguia/lockbox-local/releases/latest)
2. Make it executable:

```bash
chmod +x Lockbox-Local_*.AppImage
```

3. Run it:

```bash
./Lockbox-Local_*.AppImage
```

No installation required — the AppImage runs as a portable application.

## Uninstall

### Linux (Ubuntu/Debian) — .deb

```bash
sudo apt remove lockbox-local
```

To also remove config and data:

```bash
sudo apt remove lockbox-local
rm -rf ~/.local/share/com.lockbox.local
rm -rf ~/.config/com.lockbox.local
```

### Windows — .msi

1. Open **Settings** → **Apps** → **Installed apps**
2. Search for **Lockbox Local**
3. Click the three dots → **Uninstall**

Or via PowerShell:

```powershell
Get-Package -Name "Lockbox Local" | Uninstall-Package
```

### macOS — .dmg

1. Open **Finder** → **Applications**
2. Drag **Lockbox Local** to the Trash
3. Empty the Trash

### Linux — AppImage

If you ran the AppImage directly (no install step):

1. Delete the `.AppImage` file
2. Optionally remove config and data:

```bash
rm -rf ~/.local/share/com.lockbox.local
rm -rf ~/.config/com.lockbox.local
```

## Prerequisites

### For development

- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://rustup.rs/) (stable 1.77+)
- [Tauri CLI 2.0](https://v2.tauri.app/)

### Installing prerequisites on Ubuntu

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# System dependencies for Tauri
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
# Clone the project (if needed)
cd new-lockbox-local

# Install npm dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Project Structure

```
new-lockbox-local/
├── src/                          # Frontend React/TypeScript
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── LockboxCard.tsx       # Lockbox card
│   │   ├── LockboxList.tsx       # Lockbox list
│   │   ├── LockboxDetail.tsx     # Lockbox detail
│   │   ├── CreateLockboxModal.tsx# Creation modal
│   │   ├── Header.tsx            # Header
│   │   ├── Sidebar.tsx           # Sidebar
│   │   └── LoginScreen.tsx       # Login screen
│   ├── hooks/                    # Custom hooks
│   │   ├── useCountdown.ts       # Countdown timer
│   │   ├── useLockboxStatus.ts   # Lockbox status
│   │   └── useExportImport.ts    # Import/Export
│   ├── store/                    # Global state (Zustand)
│   │   ├── lockboxStore.ts       # Lockbox store
│   │   ├── authStore.ts          # Authentication store
│   │   └── themeStore.ts         # Theme store
│   ├── types/                    # TypeScript types
│   ├── styles/                   # CSS/Tailwind
│   ├── App.tsx                   # Main component
│   └── main.tsx                  # Entry point
│
├── src-tauri/                    # Backend Rust/Tauri
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   ├── db.rs                 # SQLite operations
│   │   ├── crypto.rs             # AES encryption
│   │   └── commands.rs           # Tauri commands
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
│
├── package.json                  # npm dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Usage

### First launch

1. On first launch, create a **master password**
2. This password encrypts all your data
3. **Important**: This password cannot be recovered!

### Create a Lockbox

1. Click **"New Lockbox"**
2. Enter a name and the content to protect
3. Set the **unlock delay** (waiting time) and the **re-lock delay** (access duration)
4. Optional: choose a **category** and add **free tags**
5. Expand the advanced sections to configure:
   - **Reflection** — enable the 10-second pause modal, add a custom message and/or a line-by-line checklist
   - **Penalty** — enable penalty mode and set the extra delay added when the countdown is cancelled
   - **Scheduled unlock** — pick a date and time at which the lockbox automatically becomes unlockable
   - **Panic code** — set a single-use emergency bypass code

### Unlock a Lockbox

1. Select the lockbox from the list
2. Click **"Unlock"**
3. If a **reflection modal** is configured, read the message and tick all checklist items during the 10-second countdown
4. Wait for the countdown to finish
5. Content is visible for the configured re-lock duration

### During the countdown

While a lockbox is counting down, the detail panel shows additional actions:

- **Extend delay** (＋ button) — permanently increase the unlock delay by a chosen amount; also extends the current active countdown
- **Cancel unlock** (✕ button) — abandon the countdown and return to locked state; if penalty mode is active, a warning shows the extra delay that will be applied

### Panic code

If you set a panic code when creating a lockbox, an emergency section appears in the lockbox detail while it is locked. Enter the code to instantly bypass the unlock delay. **The code can only be used once** — a new one can be set only by editing the lockbox and entering a new code.

### Scheduled unlock

When a lockbox has a scheduled date, its status shows as **Scheduled** with a calendar icon and a countdown to the scheduled time. At that time, the lockbox automatically transitions to the normal unlock countdown. You can still cancel or extend from the detail panel.

### Access log & statistics

- **Access log** (per lockbox) — click "Access history" at the bottom of a lockbox detail to see the full event history
- **Statistics** (global) — click the chart icon in the header or "View details" in the sidebar to see monthly and all-time self-control stats and your current streak

### Import/Export

#### Export

Click the **download icon** (↓) in the header. A native dialog lets you choose where to save the `.json` file.

After saving, a notice reminds you:

> _"If you import this file on a different machine or with a different master password, you will be asked for the source password so the data can be re-encrypted for the new device."_

#### Import

Click the **upload icon** (↑) in the header. A dialog asks whether the file was exported from a different machine:

- **Same machine / same password** — click "Same machine — skip". The encrypted data is inserted as-is; no re-encryption needed.
- **Different machine or different password** — enter the master password that was active when the file was exported. The app will decrypt the content with the source password and re-encrypt it with the current one.

Lockboxes with the same name as an existing one are silently skipped (no overwrite).

#### What is preserved

| Field | Exported | Imported |
|---|:---:|:---:|
| Name | ✓ | ✓ |
| Content (encrypted) | ✓ | ✓ (re-encrypted if needed) |
| Unlock & relock delays | ✓ | ✓ |
| Category & tags | ✓ | ✓ |
| Reflection settings | ✓ | ✓ |
| Penalty settings | ✓ | ✓ |
| Panic code | — | — |
| Scheduled unlock date | — | — |

> Panic codes cannot be transferred because only the hash is stored — the original code is never saved. Scheduled dates are intentionally not restored since a past date would be meaningless.

#### Security & integrity

The export file contains the content in **encrypted form** (AES-256-GCM). It is unreadable without the master password. Each lockbox entry is signed with **HMAC-SHA256** using the master password hash.

At import, the signature is verified before any data is written. If the file has been tampered with (e.g., delays reduced, content substituted), the import will be rejected with an integrity error. This prevents using export/import as a way to bypass the unlock delay.

> **Self-control note:** The unlock delay is a deliberate friction mechanism. Exporting does not reveal content in plaintext, and manipulated files are rejected — the delay cannot be circumvented via the import/export flow.

## Security

### Encryption

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key derivation**: PBKDF2-HMAC-SHA256 with 100,000 iterations
- **Salt**: Randomly generated per content — no two ciphertexts are alike even for identical content
- **Master password**: Hashed with SHA-256; never stored in plaintext; never leaves your device

### Storage

- Local SQLite database — all data stays on your machine
- No network connection, no telemetry, no cloud dependency
- Panic codes are stored as one-way hashes only

### Export integrity

Export files are signed with **HMAC-SHA256** using the master password hash. Any modification to the file (delays, content, names) invalidates the signature and causes the import to be rejected. This prevents using export/import to bypass the unlock delay.

### Self-control design

The unlock delay is a deliberate friction mechanism, not a cryptographic lock. The app is designed to resist **impulsive** attempts to access content, not adversarial attacks by a determined user who knows the master password. For stronger guarantees, consider a longer delay or enabling the penalty mode.

## Development

### Available scripts

```bash
# Development
npm run dev          # Runs Vite (frontend only)
npm run tauri:dev    # Runs Tauri + Vite

# Build
npm run build        # Builds the frontend
npm run tauri:build  # Builds the complete application

# Lint
npm run lint         # Checks TypeScript code
```

### Tests

```bash
# Rust tests
cd src-tauri
cargo test
```

## Creating Installation Packages

### .deb Package (Ubuntu/Debian)

To create a `.deb` package on Ubuntu, Tauri automatically generates the package during build:

```bash
# Ensure all dependencies are installed
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

# Install project dependencies
npm install

# Build the application (automatically generates .deb)
npm run tauri:build
```

The `.deb` package will be generated in:
```
src-tauri/target/release/bundle/deb/lockbox-local_2.0.0_amd64.deb
```

**Installing the .deb package:**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/lockbox-local_2.0.0_amd64.deb

# If dependencies are missing, install with:
sudo apt-get install -f
```

### .exe Package (Windows)

#### Option 1: Build on Windows (Recommended)

On a Windows machine with prerequisites installed:

```bash
# Install Windows prerequisites
# - Node.js (v20+)
# - Rust (via rustup)
# - Microsoft Visual C++ Build Tools

# Install dependencies
npm install

# Build the application
npm run tauri:build
```

The `.exe` file will be generated in:
```
src-tauri/target/release/lockbox-local.exe
```

An MSI installer will also be created in:
```
src-tauri/target/release/bundle/msi/lockbox-local_2.0.0_x64_en-US.msi
```

#### Option 2: Cross-compilation from Linux (Advanced)

The project uses GitHub Actions to build Windows, Linux, and macOS and to create releases on tag push. See [`.github/workflows/build.yml`](.github/workflows/build.yml) for the workflow.

### Advanced Package Configuration

To customize package metadata, edit [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) (see the `bundle` section, and optionally `bundle.linux.deb` or `bundle.windows`).

> **Note**: By default, Tauri automatically detects the required system dependencies. Only specify the `depends` field if you need to add extra dependencies.

### npm Scripts for Easier Building

You can add these scripts to `package.json`:

```json
{
  "scripts": {
    "build:linux": "tauri build --target x86_64-unknown-linux-gnu",
    "build:windows": "tauri build --target x86_64-pc-windows-msvc",
    "build:all": "npm run build:linux && npm run build:windows"
  }
}
```

## Comparison with [v1 (Java)](https://github.com/japierreSWE/Lockbox_Local)

| Feature | v1 (Java) | v2 (Tauri) |
|---------|-----------|------------|
| Bundle size | ~100 MB | ~15 MB |
| RAM | ~150 MB | ~50 MB |
| Encryption | No | AES-256-GCM |
| Master password | No | Yes |
| Categories | No | Yes |
| Free tags | No | Yes |
| Search | No | Yes |
| Dark theme | No | Yes |
| Cancel countdown | No | Yes |
| Extend delay | No | Yes |
| Reflection modal | No | Yes |
| Penalty mode | No | Yes |
| Panic code | No | Yes |
| Scheduled unlock | No | Yes |
| Access log | No | Yes |
| Self-control stats | No | Yes |
| Export format | .lbf (text) | .json (HMAC-signed) |
| EN/FR localisation | No | Yes |

## Mobile Version

Lockbox Local is also available as a native mobile app for **iOS and Android**.

| | |
|---|---|
| **Repository** | [github.com/bleriotnoguia/lockbox-local-mobile](https://github.com/bleriotnoguia/lockbox-local-mobile) |
| **Releases** | [Latest release](https://github.com/bleriotnoguia/lockbox-local-mobile/releases/latest) |

The mobile version shares the same encryption format, HMAC signatures, and data schema as this desktop version — export files are fully cross-platform compatible between the two.

**Additional features in the mobile version:**
- Biometric unlock (Face ID / Fingerprint)
- Local push notifications when an unlock countdown finishes
- Built with Expo SDK 54 + React Native + NativeWind

## License

This project is licensed under the MIT License - See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open an issue or a pull request.
