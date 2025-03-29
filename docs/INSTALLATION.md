# Installation Guide

This document provides detailed instructions for setting up the Tauri Security Boilerplate on different platforms and configurations.

## Prerequisites

Before installing, ensure your system meets the following requirements:

### All Platforms

- [Node.js](https://nodejs.org/) 16.0 or higher
- [npm](https://www.npmjs.com/) 8.0 or higher (comes with Node.js)
- [Git](https://git-scm.com/) for cloning the repository

### Windows

- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) - Usually pre-installed on Windows 10+
- [Visual Studio 2022](https://visualstudio.microsoft.com/) with the following components:
  - "Desktop development with C++"
  - Windows 10/11 SDK
- [Rust](https://www.rust-lang.org/) (can be installed during setup)

### macOS

- [Xcode](https://developer.apple.com/xcode/) and Xcode Command Line Tools
- [Rust](https://www.rust-lang.org/) (can be installed during setup)

### Linux

- Required system libraries (varies by distribution):
  
  **Ubuntu/Debian:**
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```

  **Fedora:**
  ```bash
  sudo dnf install webkit2gtk3-devel \
    openssl-devel \
    curl \
    wget \
    libappindicator-gtk3-devel \
    librsvg2-devel
  ```

- [Rust](https://www.rust-lang.org/) (can be installed during setup)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Gcavazo1/tauri-security-boilerplate.git
cd tauri-security-boilerplate
```

### 2. Install Rust (if not already installed)

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# On Windows, download and run rustup-init.exe from https://rustup.rs/
```

Follow the prompts to complete the installation. After installing Rust, restart your terminal.

### 3. Install Dependencies

```bash
# Install npm dependencies
npm install
```

### 4. Configure Environment (Optional)

Create a `.env` file in the project root for any environment-specific configurations:

```
# Example .env file
VITE_API_URL=https://api.example.com
VITE_LOG_LEVEL=info
```

### 5. Development Mode

To start the application in development mode:

```bash
npm run tauri dev
```

This will start the frontend development server and launch the Tauri application.

### 6. Building for Production

To build the application for production:

```bash
npm run tauri build
```

This creates platform-specific binaries in the `src-tauri/target/release` directory.

## Troubleshooting

### Common Issues on Windows

- **WebView2 Not Found**: Ensure WebView2 is installed or update to the latest version
- **Build Tools Missing**: Run Visual Studio Installer and ensure "Desktop development with C++" is installed
- **Windows SDK Missing**: Add the Windows SDK component in Visual Studio Installer

### Common Issues on macOS

- **Xcode Command Line Tools**: If you encounter errors about missing tools, run:
  ```bash
  xcode-select --install
  ```
- **Code Signing**: For distribution, ensure you have proper signing certificates set up

### Common Issues on Linux

- **Missing Libraries**: If you see errors about missing libraries, install the required packages for your distribution
- **Permission Issues**: Ensure you have proper permissions for the installation directories

## Updating

To update to the latest version of the boilerplate:

```bash
git pull origin main
npm install
```

## Using as a Template

To use this boilerplate as a starting point for your own project:

1. Clone the repository
2. Remove the existing Git history:
   ```bash
   rm -rf .git
   ```
3. Initialize a new Git repository:
   ```bash
   git init
   ```
4. Update the `package.json` and `src-tauri/Cargo.toml` files with your project details
5. Update the `src-tauri/tauri.conf.json` file with your project name and identifiers

## Next Steps

After installation, check out the following resources:

- [Security Features Documentation](./SECURITY.md) - Learn about the security features
- [Best Practices](./BEST_PRACTICES.md) - Guidelines for building secure applications
- [Example Applications](./EXAMPLES.md) - Practical examples to get started 