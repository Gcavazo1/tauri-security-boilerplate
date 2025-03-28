# Contributing to the Tauri 2.0 Boilerplate

Thank you for your interest in contributing to the Tauri 2.0 Boilerplate! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Security Considerations](#security-considerations)

## Code of Conduct

This project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup for Development

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/tauri-boilerplate.git
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/tauri-boilerplate.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make sure you start from the latest code:
   ```bash
   git pull upstream main
   ```

2. Start the development server:
   ```bash
   npm run tauri dev
   ```

3. Make your changes following the coding standards

4. Write or update tests as necessary

5. Run the test suite to ensure everything works:
   ```bash
   npm test
   ```

6. Update documentation as needed

## Pull Request Process

1. Update your fork with the latest upstream changes:
   ```bash
   git pull upstream main
   ```

2. Resolve any merge conflicts

3. Run the tests to ensure your changes don't break anything:
   ```bash
   npm test
   ```

4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request through the GitHub interface

6. Your PR should include:
   - A clear title and description
   - References to any issues it addresses
   - Changes that are focused on a single concern
   - Updated documentation if necessary
   - Test coverage for new features or bug fixes

7. Address any code review feedback

## Coding Standards

### TypeScript/JavaScript

- Follow the ESLint configuration defined in `.eslintrc.json`
- Use Prettier for code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public functions and components
- Import order: external dependencies first, then internal modules
- Prefer functional components with hooks over class components

### Rust

- Follow the standard Rust style guidelines
- Use `cargo fmt` to format your code
- Use `cargo clippy` to catch common mistakes
- Add documentation comments (`///`) for public functions
- Handle errors properly with Result types
- Avoid unsafe code unless absolutely necessary

### Git Commits

- Use the conventional commits format: `type(scope): description`
- Keep commits focused on a single logical change
- Write descriptive commit messages in the present tense
- Example: `feat(api): add file download endpoint`

## Testing Guidelines

- Write tests for all new features and bug fixes
- Keep tests simple and focused
- Use descriptive test names that explain the expected behavior
- Frontend: Use React Testing Library for component tests
- Backend: Write unit tests for Rust functions

Examples of good test structure:

```typescript
// Component test
describe('Button Component', () => {
  test('renders button with text', () => {
    // ...
  });

  test('calls onClick when clicked', () => {
    // ...
  });
});
```

## Documentation

- Update documentation for any public-facing changes
- Document all new features, configuration options, and APIs
- Use clear, concise language
- Include examples where appropriate
- Keep the README.md updated with new features or changes

## Security Considerations

- Follow the principle of least privilege when adding capabilities
- Validate all user input
- Handle file paths securely to prevent path traversal
- Don't expose sensitive data through error messages
- Report security vulnerabilities privately to the maintainers

Thank you for contributing to the Tauri 2.0 Boilerplate! Your help is greatly appreciated. 