# Changelog

All notable changes to the Tauri Security Boilerplate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-03-29

### Added
- Initial production-ready release
- Comprehensive security architecture documentation
- GitHub Pages website with detailed documentation
- Complete set of security badges in README
- Cross-platform build support for Windows, macOS, and Ubuntu
- React 18 frontend with TypeScript and Tailwind CSS
- Secure IPC layer for communication between frontend and backend
- Capability-based permission system
- Secure file system access
- Security logging and error boundaries

### Fixed
- Ubuntu build dependencies for cross-platform compatibility:
  - Added libwebkit2gtk-4.1-dev dependency
  - Added libsoup-3.0-dev dependency 
  - Added libjavascriptcoregtk-4.1-dev dependency
  - Updated to Ubuntu 22.04 for GLib 2.70+ compatibility
  - Enhanced GLib verification and debugging
- Theme toggle implementation for proper dark/light mode switching
- Missing greet command functionality implementation
- Memory-safe code implementation with removal of unused functions
- Dialog plugin configuration for proper file selection
- Content Security Policy for supporting Tauri IPC communication

### Security
- Implemented strict Content Security Policy
- Applied principle of least privilege with granular permissions
- Added supply chain security with dependency auditing
- Enforced type safety between frontend and backend
- Added error boundaries for graceful handling of runtime errors
- Implemented comprehensive input validation
- Added pre-commit hooks for automated security checks
- Created detailed security documentation and guidance 