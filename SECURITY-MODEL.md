# Tauri 2.0 Security Model

This document explains the security model used in Tauri 2.0 and how it's implemented in this boilerplate.

## Table of Contents

1. [Overview](#overview)
2. [Capability-Based Security](#capability-based-security)
3. [Permission System](#permission-system)
4. [Configuration Files](#configuration-files)
5. [Best Practices](#best-practices)
6. [Examples](#examples)
7. [Security Reporting](#security-reporting)
8. [Future Security Work](#future-security-work)

## Overview

Tauri 2.0 introduces a robust capability-based security model, which is a significant improvement over the previous version. This model allows for fine-grained control over what resources your application can access, following the principle of least privilege.

## Capability-Based Security

In Tauri 2.0, a capability represents the authority to access a specific resource or perform an action. Capabilities are declaratively defined and explicitly granted to specific windows in your application.

The key benefits of this approach are:

- **Least Privilege**: Each window only gets the capabilities it actually needs
- **Isolation**: Windows without specific capabilities cannot access protected resources
- **Transparency**: Security policies are declarative and easy to audit
- **Flexibility**: Different windows can have different capability sets

## Permission System

Permissions in Tauri 2.0 define the specific actions that can be performed with a capability. They are more granular than capabilities and specify exactly what operations are allowed.

The permission system has these key components:

1. **Permission Identifiers**: Unique identifiers like `fs:default` or `dialog:allow-open`
2. **Permission Scopes**: Define the resources that a permission applies to
3. **Permission Grants**: Explicit grants of permissions to capabilities

## Configuration Files

### 1. Capabilities Configuration

Capabilities are defined in JSON files in the `src-tauri/capabilities/` directory:

```json
{
  "identifier": "main",
  "description": "Capabilities for the main window",
  "windows": ["main"],
  "permissions": [
    "dialog:default",
    "dialog:allow-open",
    "fs:default"
  ]
}
```

This example defines a capability named "main" that:
- Applies to the window named "main"
- Grants permission to use dialogs and access the file system

### 2. Permission Configuration

Permissions are defined in JSON files in the `src-tauri/permissions/` directory:

```json
{
  "identifier": "fs:default",
  "description": "Secure access to the filesystem"
}
```

```json
{
  "identifier": "dialog:allow-open",
  "description": "Allows opening file dialog"
}
```

## Best Practices

For maximum security in your Tauri application:

1. **Minimal Permissions**: Only grant the permissions that are absolutely necessary
2. **Separate Windows**: Use separate windows with different capability sets when handling sensitive operations
3. **Validate All Input**: Always validate and sanitize user input before processing
4. **Audit Capabilities**: Regularly review your capability configuration to ensure it follows least privilege
5. **Secure Error Handling**: Don't expose sensitive information in error messages
6. **Keep Updated**: Stay updated with the latest Tauri security patches

## Examples

### Example 1: File Access Capability

This example shows a capability that only allows reading files from a specific directory:

```json
// capabilities/file-reader.json
{
  "identifier": "file-reader",
  "description": "Limited file reading capability",
  "windows": ["reader-window"],
  "permissions": [
    "fs:read-user-downloads"
  ]
}
```

```json
// permissions/fs-read-user-downloads.json
{
  "identifier": "fs:read-user-downloads",
  "description": "Read access to user downloads folder",
  "read": {
    "allow": ["$DOWNLOAD/**"]
  }
}
```

### Example 2: Dialog Capability

This example shows a capability that only allows opening file dialogs, but not save dialogs:

```json
// capabilities/file-opener.json
{
  "identifier": "file-opener",
  "description": "Capability to open file dialogs",
  "windows": ["opener-window"],
  "permissions": [
    "dialog:allow-open"
  ]
}
```

```json
// permissions/dialog-allow-open.json
{
  "identifier": "dialog:allow-open",
  "description": "Permission to open file dialogs"
}
```

## Security Reporting

If you discover a security vulnerability in Tauri or this boilerplate, please follow responsible disclosure practices:

1. **Do not** disclose the vulnerability publicly
2. Report the issue directly to the maintainers via email or private issue
3. Provide detailed information about the vulnerability and steps to reproduce
4. Allow time for the issue to be addressed before any public disclosure

Thank you for using Tauri's secure application framework responsibly!

## Future Security Work

This section outlines areas for future security enhancements that could be integrated into applications built with this boilerplate:

### WebView Hardening

Following Tauri's security roadmap, we recognize the WebView as a potential security boundary. Future enhancements may include:

- Additional sandboxing for the WebView process
- Further isolation techniques to reduce attack surface
- Process-level separation between UI and system access

### Binary Analysis Improvements

To support auditing and security verification, we're exploring:

- Better integration with `cargo-auditable` for SBOM generation
- Tools for extracting and analyzing frontend assets for security purposes
- Improved support for penetration testing tools like Burpsuite, ZAP, or Caido

### Fuzzing Infrastructure

To detect issues before they reach production:

- Support for efficiently fuzzing Tauri applications
- Integration with tools like libAFL
- Custom fuzzing harnesses for Tauri-specific attack vectors

### Additional Supply Chain Security

Building on our current measures:

- Integration with cargo-vet or cargo-crev for dependency verification
- Enhanced checking of npm dependencies beyond auditing
- Support for signed dependencies and reproducible builds

We welcome contributions and suggestions in these areas to continually improve the security posture of applications built with this boilerplate. 