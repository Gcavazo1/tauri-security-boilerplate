# Installation Guide

This guide provides detailed instructions for setting up and running the Tauri 2.0 React Template application on various platforms.

## Prerequisites

### All Platforms

1. **Node.js** (v18 or later)
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Rust** (stable, v1.70+)
   - Install using [rustup](https://rustup.rs/)
   - Verify installation: `rustc --version`

3. **Git**
   - Download and install from [git-scm.com](https://git-scm.com/downloads)
   - Verify installation: `git --version`

### Platform-Specific Requirements

#### Windows

1. **Microsoft Visual Studio C++ Build Tools**
   - Install the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Make sure to select "Desktop Development with C++"

2. **WebView2**
   - Download and install from [Microsoft Edge WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
   - Usually comes pre-installed on Windows 10 and 11

#### macOS

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Additional libraries**
   ```bash
   brew install openssl@1.1
   ```

#### Linux (Ubuntu/Debian)

1. **Essential build tools**
   ```bash
   sudo apt update
   sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```

## Setting Up the Project

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/tauri-react-template
   cd tauri-react-template
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Initialize pre-commit hooks
   ```bash
   npm run prepare
   ```

## Running the Application

### Development Mode

```bash
npm run tauri dev
```

This will:
- Start the Vite development server for the React frontend
- Compile the Rust backend
- Launch the application with hot reload for the frontend

### Production Build

```bash
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle` directory.

## Troubleshooting

### Port Conflicts

If you see an error like "Port 1420 is already in use":

1. Edit `src-tauri/tauri.conf.json`
2. Change the `devUrl` port (e.g., from 1420 to 1421)
3. Restart the development process

### Rust Compilation Errors

1. Update Rust toolchain
   ```bash
   rustup update
   ```

2. Clean the project and rebuild
   ```bash
   npm run clean
   npm run tauri dev
   ```

### Dependency Issues

1. Update all dependencies
   ```bash
   npm run update-deps
   ```

2. Clear npm cache if needed
   ```bash
   npm cache clean --force
   ```

### Platform-Specific Issues

#### Windows

- If you encounter "MSBuild.exe not found" errors, ensure Visual Studio Build Tools are correctly installed.
- WebView2 issues can be resolved by manually installing the latest WebView2 Runtime.

#### macOS

- If you encounter code signing issues on macOS, you may need to set up a developer certificate.
- For Apple Silicon (M1/M2) specific issues, ensure Rosetta 2 is installed for x86 dependencies.

#### Linux

- On some distributions, you may need to install additional WebKit dependencies.
- For Ubuntu 22.04+: `sudo apt install libjavascriptcoregtk-4.1-dev libsoup-3.0-dev`

## Advanced Configuration

### Changing the Application Name

1. Edit `src-tauri/tauri.conf.json` and update the `productName` field
2. Edit `package.json` and update the `name` field
3. Rebuild the application

### Customizing Icons

1. Replace the icon files in `src-tauri/icons/` 
2. Run the following to regenerate icon sets:
   ```bash
   npm run tauri icon
   ```

### Adding Capabilities

1. Edit the capability files in `src-tauri/capabilities/`
2. Documentation on capabilities can be found in the [Tauri documentation](https://tauri.app/v2/api/js/)

## Getting Help

If you continue to have issues, please:

1. Check the [Tauri documentation](https://tauri.app/v2/guides/)
2. Open an issue in the GitHub repository
3. Join the [Tauri Discord](https://discord.com/invite/tauri) community 