# Security Policy

## Supported Versions

We are committed to providing security updates for the following versions of this boilerplate:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of this boilerplate and applications built with it seriously. If you believe you've found a security vulnerability, please follow these guidelines for responsible disclosure:

### Where to Report

Please **DO NOT** create a public GitHub issue for security vulnerabilities. Instead, report them privately through one of these channels:

1. **Email**: gcavazo1@gmail.com
2. **GitHub Security Advisories**: You can report vulnerabilities privately through GitHub's Security Advisories feature (preferred method).

### What to Include

To help us understand and address the issue quickly, please include:

1. A clear description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact of the vulnerability
4. If possible, a suggested fix or mitigation approach
5. Your contact information for follow-up questions

### Response Timeline

We are committed to the following response timeline:

- **Initial Response**: Within 48 hours, acknowledging receipt of your report
- **Vulnerability Assessment**: Within 7 days, confirming the vulnerability and assessing its impact
- **Fix Development**: Timeline will vary based on severity and complexity
- **Public Disclosure**: Coordinated with the reporter after a fix is available

### Security Update Process

When security vulnerabilities are addressed:

1. We will release security updates as soon as possible
2. Security advisories will be published with the release
3. Credit will be given to the reporter (unless anonymity is requested)

## Security Best Practices for Using This Boilerplate

When using this boilerplate for your own projects, consider the following security best practices:

1. **Keep dependencies updated**: Regularly run `npm audit` and `cargo audit` to check for vulnerabilities
2. **Follow the principle of least privilege**: Only grant the permissions your app actually needs
3. **Validate all user inputs**: Never trust user input from the frontend
4. **Use binary signing**: Sign your application for distribution
5. **Implement proper error handling**: Don't expose sensitive information in error messages
6. **Audit your capabilities**: Regularly review your capability configuration
7. **Keep your Tauri version updated**: Ensure you're using the latest version with security patches

## Security Features

This boilerplate includes the following security features:

- Strict Content Security Policy (CSP)
- Capability-based permission system configuration
- Type-safe conversion between frontend and backend
- Proper error handling mechanisms
- Input validation utilities
- Documentation on security best practices

Thank you for helping us keep this project and its ecosystem secure! 
