# Tauri Security Boilerplate

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Gcavazo1/tauri-security-boilerplate/build.yml?branch=clean-branch)](https://github.com/Gcavazo1/tauri-security-boilerplate/actions)
[![GitHub stars](https://img.shields.io/github/stars/Gcavazo1/tauri-security-boilerplate)](https://github.com/Gcavazo1/tauri-security-boilerplate/stargazers)
[![GitHub license](https://img.shields.io/github/license/Gcavazo1/tauri-security-boilerplate)](https://github.com/Gcavazo1/tauri-security-boilerplate/blob/main/LICENSE)
[![GitHub releases](https://img.shields.io/github/downloads/Gcavazo1/tauri-security-boilerplate/total)](https://github.com/Gcavazo1/tauri-security-boilerplate/releases)
[![GitHub issues](https://img.shields.io/github/issues/Gcavazo1/tauri-security-boilerplate)](https://github.com/Gcavazo1/tauri-security-boilerplate/issues)
[![Website](https://img.shields.io/website?url=https%3A%2F%2FGcavazo1.github.io%2Ftauri-security-boilerplate)](https://Gcavazo1.github.io/tauri-security-boilerplate)

A production-ready template for building secure, commercial-grade cross-platform desktop applications with Tauri 2.0, React, TypeScript, and Tailwind CSS.

## Recent Improvements

- ✅ **Fixed Theme Toggle**: Properly implemented dark/light mode switching with Tailwind CSS
- ✅ **Added Greet Command**: Implemented missing greet command functionality
- ✅ **Enhanced Security**: Cleaned up memory-safe code to remove unused functions
- ✅ **Improved Dialog Plugin**: Fixed configuration for proper file selection
- ✅ **Content Security Policy**: Updated CSP to support Tauri IPC communication

## Features

- 🚀 **Tauri 2.0**: Latest version with improved performance and security
- ⚛️ **React 18**: Modern React with hooks and concurrent rendering
- 🦀 **Rust Backend**: Powerful and safe native capabilities
- 🔒 **Enterprise-Grade Security**: Robust security practices throughout the codebase
- 🌐 **Cross-Platform**: Works on Windows, macOS, and Linux
- 📦 **State Management**: Zustand for simple yet powerful state management
- 🖌️ **UI Components**: Ready-to-use Tailwind CSS components
- ✅ **TypeScript**: Type safety throughout the application
- 🔍 **Error Handling**: Robust error handling system in both frontend and backend
- 🧪 **Testing Infrastructure**: Jest for frontend testing with examples
- 🛡️ **CI/CD Pipeline**: GitHub Actions workflow with security audits
- 🧩 **Type Conversion**: Seamless conversion between Rust and TypeScript types

## Security Features

- ✅ **Strict Content Security Policy**: Protection against XSS and injection attacks
- ✅ **Principle of Least Privilege**: Granular capability-based permission system
- ✅ **Supply Chain Security**: Dependency auditing and pinned versions
- ✅ **Type Safety**: Strong typing between frontend and backend
- ✅ **Error Boundaries**: Graceful handling of runtime errors
- ✅ **Input Validation**: Utilities for secure input handling
- ✅ **Pre-commit Hooks**: Automated security and quality checks
- ✅ **Security Documentation**: Comprehensive security guidance
- ✅ **Binary Optimization**: Secure build configuration for production

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (stable, v1.70+)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. Clone this template
2. Install dependencies:

```bash
npm install
```

3. Initialize pre-commit hooks:

```bash
npm run prepare
```

4. Start the development server:

```bash
npm run tauri dev
```

## Project Structure

```
/
├── .github/                 # GitHub configuration
│   └── workflows/           # GitHub Actions workflows
├── scripts/                 # Utility scripts
├── src/                     # React frontend code
│   ├── components/          # React components
│   │   ├── common/          # Shared/reusable components
│   │   ├── layout/          # Layout components
│   │   └── feature/         # Feature-specific components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   │   ├── api/             # Tauri API integration
│   │   └── helpers/         # Helper utilities including error handling
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── src-tauri/               # Rust backend code
│   ├── src/                 # Rust source files
│   │   └── lib.rs           # Core functions and Tauri commands
│   ├── capabilities/        # Tauri 2.0 capability definitions
│   ├── permissions/         # Tauri 2.0 permission definitions
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── public/                  # Static assets
├── DOCUMENTATION.md         # Detailed documentation
├── SECURITY.md              # Security policy
├── CONTRIBUTING.md          # Contribution guidelines
├── SECURITY-MODEL.md        # Security model explanation
├── RELEASE-CHECKLIST.md     # Release process
├── package.json             # NPM configuration and dependencies
└── ... (config files)       # Various configuration files
```

## Key Components

### Frontend (React + TypeScript)

- **Components**: Reusable UI components built with Tailwind CSS
- **State Management**: Zustand for simple, powerful state management
- **Error Handling**: Global error boundary for graceful error handling
- **API Integration**: Clean abstraction over Tauri commands
- **Type Conversion**: Utilities for seamless Rust-TypeScript interoperability

### Backend (Rust + Tauri)

- **Commands**: Well-organized Tauri commands with proper error handling
- **Permissions**: Secure permission handling with Tauri 2.0 capabilities
- **File System**: Safe file system operations with principle of least privilege
- **Dialog Management**: Native dialogs for file/folder selection
- **Error Types**: Structured error types with proper propagation

## Customization

### Styling

The template uses Tailwind CSS. You can customize the theme in `tailwind.config.js`.

### Adding Tauri Commands

1. Define your command in `src-tauri/src/lib.rs`:

```rust
#[tauri::command]
fn my_command(arg: String) -> Result<String, String> {
    // Your implementation
    Ok(format!("Processed: {}", arg))
}
```

2. Register it in the command list:

```rust
.invoke_handler(tauri::generate_handler![
    existing_command,
    my_command
])
```

3. Add it to your frontend API layer (`src/utils/api/tauriApi.ts`):

```typescript
export async function myCommand(arg: string): Promise<string> {
  return invokeCommand<string>('my_command', { arg });
}
```

4. Call it from your components:

```typescript
import { myCommand } from '../utils/api/tauriApi';

// Later in component
const result = await myCommand('test');
```

## Security Best Practices

This template follows best practices for secure application development:

1. **Follow the principle of least privilege**: Only grant the permissions your app actually needs
2. **Validate all user inputs**: Never trust user input from the frontend
3. **Use proper error handling**: Don't expose sensitive information in error messages
4. **Keep dependencies updated**: Regularly run security audits
5. **Sign your application**: Use the provided build pipeline for signed releases
6. **Audit your capabilities**: Review security with the included tools

For more details, see [SECURITY-MODEL.md](./SECURITY-MODEL.md).

## Building for Production

```bash
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle` directory.

## Running Security Checks

To run security checks locally:

```bash
# Check frontend dependencies
npm run security:audit

# Check Rust dependencies
cd src-tauri && cargo audit

# Check Tauri capabilities
python ./scripts/check_capabilities.py
```

## Documentation

- [DOCUMENTATION.md](./DOCUMENTATION.md) - Detailed documentation
- [SECURITY.md](./SECURITY.md) - Security policy
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [SECURITY-MODEL.md](./SECURITY-MODEL.md) - Security model explanation
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) - Release process
- [INSTALLATION.md](./INSTALLATION.md) - Comprehensive installation and setup guide
- [SHOWCASE.md](./SHOWCASE.md) - Security features showcase with code examples
- [MARKETING.md](./MARKETING.md) - Overview of commercial benefits and features
- [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) - Pre-deployment security verification checklist

## License

MIT 