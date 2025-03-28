# Installation and Setup Guide

This guide will walk you through the process of setting up our security-enhanced Tauri 2.0 boilerplate for your project.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js v18 or later** - [Download](https://nodejs.org/)
- **Rust stable v1.70+** - [Install instructions](https://www.rust-lang.org/tools/install)
- **Additional OS-specific dependencies** for Tauri development:
  - **Windows**: Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: See [Tauri Linux Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites/#setting-up-linux)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tauri-security-boilerplate.git my-app
cd my-app
```

### 2. Install Dependencies

```bash
# Install npm dependencies
npm install

# Initialize pre-commit hooks for security checks
npx husky install
```

### 3. Configure Your Application

#### Update Application Metadata

1. Edit `src-tauri/tauri.conf.json`:
   - Modify `productName`, `identifier`, and `title` to match your application
   - Adjust the window size and other properties as needed

2. Edit `src-tauri/Cargo.toml`:
   - Update `name`, `description`, `authors`, and `repository` fields
   - Keep the security-related dependencies and features as they are crucial for the security model

3. Edit `package.json`:
   - Update `name`, `description`, `version`, and other metadata
   - Keep the pinned dependency versions to maintain security

#### Configure Permissions

Review and modify the permission files in `src-tauri/permissions/` to match your application's needs. Each permission file follows this pattern:

```json
{
  "identifier": "fs:read-downloads",
  "description": "Read access to the downloads directory",
  "read": {
    "allow": ["$DOWNLOAD/**"]
  }
}
```

Adjust these to follow the principle of least privilege for your application's needs.

### 4. Customize the Security Features

1. Modify the allowed domains for network requests in `src/utils/safeNetworkRequests.ts`:

```typescript
const ALLOWED_DOMAINS = [
  'api.yourcompany.com',
  'cdn.yourcompany.com',
  // Add your domains here
];
```

2. Review and update the Content Security Policy in `index.html` if needed.

3. Adjust error handling and logging settings in `src/utils/securityLogging.ts` if necessary.

### 5. Start Development Server

```bash
npm run dev
```

This will start the development server with hot reloading for both the frontend and Tauri backend.

### 6. Security Verification

Before proceeding to production, run the following security checks:

```bash
# Check for NPM vulnerabilities
npm run security:audit

# Run Rust security audit
cd src-tauri && cargo audit && cd ..

# Verify Tauri capabilities
python scripts/check_capabilities.py
```

## Building for Production

When you're ready to create a production build:

```bash
npm run build
```

This will:
1. Build the frontend assets
2. Compile the Rust backend with optimizations
3. Create platform-specific distributables

The production builds will be available in the `src-tauri/target/release` directory.

## Creating Installers

To create installers for distribution:

```bash
npm run tauri build
```

This will create installers in the `src-tauri/target/release/bundle` directory:
- `.msi` and `.exe` for Windows
- `.dmg` and `.app` for macOS
- `.deb` and `.AppImage` for Linux

## Troubleshooting

### Common Issues

1. **Rust compilation errors**:
   - Make sure you have the latest stable Rust version: `rustup update stable`
   - Clean the build files: `cd src-tauri && cargo clean && cd ..`

2. **Missing dependencies**:
   - Check the console for specific errors about missing system dependencies
   - Refer to the [Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites)

3. **Security audit failures**:
   - Review the audit output for specific vulnerabilities
   - Update dependencies if safe to do so
   - Consider implementing mitigations if updates aren't available

### Getting Help

If you encounter issues not covered by this guide:

1. Check the [Tauri documentation](https://tauri.app/v2/guides/)
2. Search for similar issues in our [GitHub repository](https://github.com/yourusername/tauri-security-boilerplate/issues)
3. Open a new issue with detailed information about the problem

## Security Reporting

If you discover a security vulnerability, please refer to our [SECURITY.md](./SECURITY.md) file for instructions on how to report it responsibly.

## Next Steps

Once your application is set up, you may want to:

1. Customize the UI components in `src/components/`
2. Add new Tauri commands in `src-tauri/src/commands.rs`
3. Implement additional security features specific to your application's needs
4. Set up your CI/CD pipeline using the provided GitHub Actions workflow

For more information on working with the boilerplate, refer to the main [README.md](./README.md) and [SECURITY-MODEL.md](./SECURITY-MODEL.md) files. 