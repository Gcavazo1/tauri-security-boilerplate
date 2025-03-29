# Contributing to the Tauri Security Boilerplate

Thank you for your interest in contributing to the Tauri Security Boilerplate! This document provides guidelines and instructions for contributing to make the process smooth and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Security Guidelines](#security-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to a Code of Conduct that establishes how we collaborate and participate in this community. By participating, you are expected to uphold this code. Please read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) document.

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- Rust and Cargo (latest stable)
- Tauri CLI

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/tauri-security-boilerplate.git
   cd tauri-security-boilerplate
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up git hooks:
   ```bash
   npx husky install
   ```

## Development Workflow

1. Create a branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes following the [Coding Standards](#coding-standards)

3. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```

4. Commit your changes with a descriptive commit message that follows the [conventional commits](https://www.conventionalcommits.org/) format:
   ```bash
   git commit -m "feat: add new validation function for paths"
   ```

5. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request from your branch to the main repository

## Pull Request Process

1. Ensure your PR addresses a specific issue. If an issue doesn't exist, create one first.
2. Update documentation relevant to your changes.
3. Add tests that cover your changes.
4. Make sure all tests pass.
5. Request a review from one of the core team members.
6. Address any review comments and push additional commits to your branch.

## Coding Standards

To maintain code quality and consistency, please follow these standards:

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the project's ESLint and Prettier configurations
- Write self-documenting code with clear variable and function names
- Add JSDoc comments for public APIs

### Rust

- Follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Format your code with `cargo fmt`
- Use `cargo clippy` to catch common mistakes and improve your code
- Write helpful error messages and ensure proper error handling

### Security-Specific Guidelines

- Never disable security features for convenience
- Always validate and sanitize inputs, especially those coming from users
- Use the provided security utilities rather than implementing your own
- Follow the [Security Guidelines](#security-guidelines) for all security-sensitive code

## Security Guidelines

When contributing to this security-focused boilerplate, follow these guidelines:

1. **Principle of Least Privilege**: Components should have the minimum privileges necessary to function.

2. **Defense in Depth**: Never rely on a single security control. Layer defenses.

3. **Input Validation**: All inputs must be validated, especially user inputs.

4. **Secure Defaults**: Security should be the default. Users should not have to take extra steps to enable security features.

5. **Error Handling**: Security errors should be logged but not exposed to users in detail.

6. **Dependencies**: Be cautious when adding new dependencies. Review their security history.

7. **Security Reviews**: Security-critical changes require review by maintainers with security expertise.

8. **Testing**: All security features must have tests, including negative tests (i.e., tests that verify security features block what they should).

## Testing

- Write unit tests for all new functionality
- Include integration tests where appropriate
- For security features, include tests that verify the feature blocks or prevents insecure operations
- Run the full test suite before submitting your PR

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e
```

## Documentation

Good documentation is crucial for this project:

- Update existing documentation affected by your changes
- Document new features, components, or APIs
- Add code examples where helpful
- Include security implications and recommendations
- For significant changes, consider updating the architecture document

## Reporting Issues

Security issues should be reported privately to the security team by emailing [security@example.com](mailto:security@example.com).

For non-security issues, bugs, or feature requests:

1. Search existing issues to see if the problem has been reported
2. If not, create a new issue with:
   - A clear title and description
   - Steps to reproduce the issue
   - Expected behavior and actual behavior
   - Version of the boilerplate and your environment details
   - Screenshots if applicable

## Questions?

If you have questions about contributing, feel free to:

- Open a discussion in the GitHub repository
- Join our community chat [link to Discord/Slack/etc.]

Thank you for contributing to the Tauri Security Boilerplate! 