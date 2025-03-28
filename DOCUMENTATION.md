# Tauri 2.0 Boilerplate Documentation

This document provides detailed information about the structure, features, and best practices for using this Tauri 2.0 boilerplate.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Structure](#frontend-structure)
3. [Backend Structure](#backend-structure)
4. [Type Conversion System](#type-conversion-system)
5. [Error Handling](#error-handling)
6. [State Management](#state-management)
7. [Security and Permissions](#security-and-permissions)
8. [Testing](#testing)
9. [Building for Production](#building-for-production)
10. [Best Practices](#best-practices)

## Architecture Overview

This boilerplate follows a layered architecture with clear separation of concerns:

- **Presentation Layer**: React components in the frontend
- **Business Logic Layer**: Divided between frontend (React/TypeScript) and backend (Rust)
- **Data Access Layer**: Primarily handled by the Rust backend
- **Communication Layer**: Tauri IPC bridge between frontend and backend

## Frontend Structure

The frontend is built with React, TypeScript, and modern tooling:

```
src/
├── components/          # React components
│   ├── common/          # Shared/reusable components
│   ├── layout/          # Layout components
│   └── feature/         # Feature-specific components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── api/             # Tauri API integration
│   └── helpers/         # Helper utilities
├── App.tsx              # Main App component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

### Key Frontend Components

- **Component Structure**: Using atomic design principles
- **State Management**: Zustand for simple yet powerful state
- **API Integration**: Clean wrapper around Tauri commands
- **Error Handling**: Global error boundary and consistent error handling

## Backend Structure

The Rust backend leverages Tauri 2.0 with a secure capability-based system:

```
src-tauri/
├── src/                 # Rust source files
│   ├── lib.rs           # Core functions and Tauri commands
│   └── main.rs          # Application entry point
├── capabilities/        # Tauri 2.0 capability definitions
├── permissions/         # Tauri 2.0 permission definitions
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration
```

### Key Backend Components

- **Command Structure**: Well-organized Tauri commands with consistent error handling
- **Permission System**: Tauri 2.0 capability-based security model
- **Error Handling**: Structured error types with proper propagation
- **File Operations**: Safe file system access through proper permissions

## Type Conversion System

A key feature of this boilerplate is the automatic type conversion between Rust and TypeScript:

### The Problem

Rust uses `snake_case` for field names, while TypeScript typically uses `camelCase`. This creates a mismatch when data is passed between the two environments.

### The Solution

The boilerplate includes a robust type conversion system:

1. **RustFileInfo Interface**: Mirrors the Rust struct exactly with snake_case field names
2. **FileInfo Interface**: Frontend-friendly version with camelCase field names
3. **Conversion Utilities**: Functions to convert between the two formats

Example usage:

```typescript
// Import the necessary utilities
import { 
  FileInfo, 
  RustFileInfo, 
  convertToClientFileInfo 
} from '../utils/typeConversion';

// When receiving data from Rust backend
const rustData: RustFileInfo = await invokeCommand('get_file_info', { filePath });
const clientData: FileInfo = convertToClientFileInfo(rustData);

// Now use the TypeScript-friendly version
console.log(clientData.isDirectory); // Instead of is_directory
```

The system is extensible for any type that needs conversion between the two environments.

## Error Handling

The boilerplate implements a comprehensive error handling system:

### Frontend Error Handling

- **AppError Class**: Custom error class with type, context, and friendly messages
- **ErrorBoundary Component**: React error boundary for graceful UI fallbacks
- **Error Context**: Global error state management
- **withErrorHandling Utility**: Higher-order function for consistent async error handling

### Backend Error Handling

- **AppError Enum**: Structured error types in Rust
- **Error Conversion**: From Rust errors to frontend-friendly format
- **Consistent Error Propagation**: Through the Result type
- **Proper Logging**: Structured error logging for debugging

## State Management

Zustand is used for state management due to its simplicity and performance:

```typescript
// Example store
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // State
      darkMode: false,
      greeting: null,
      isLoading: false,
      error: null,
      
      // Actions
      setDarkMode: (darkMode) => set({ darkMode }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setGreeting: (greeting) => set({ greeting }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-storage', // Storage key
      partialize: (state) => ({ darkMode: state.darkMode }), // Only persist darkMode
    }
  )
);
```

## Security and Permissions

Tauri 2.0 introduces a capability-based security model:

### Capability System

Capabilities define what resources a window can access. They are defined in JSON files:

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

### Permission System

Permissions define the access level for specific APIs:

```json
{
  "identifier": "fs:default",
  "description": "Secure access to the filesystem"
}
```

### Best Practices

1. Follow the principle of least privilege
2. Only request permissions that are absolutely necessary
3. Validate all user input before processing
4. Use the capability system to segment access by windows

## Testing

The boilerplate includes Jest for frontend testing:

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders a button with text', () => {
  render(<Button>Test Button</Button>);
  expect(screen.getByText('Test Button')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('greets the user when button is clicked', async () => {
  render(<App />);
  
  // Type in the input
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } });
  
  // Click the button
  fireEvent.click(screen.getByText('Greet'));
  
  // Wait for the result
  await waitFor(() => {
    expect(screen.getByText('Hello, John! Welcome to Tauri.')).toBeInTheDocument();
  });
});
```

## Building for Production

The boilerplate is configured for optimal production builds:

### Frontend Optimization

- Tree-shaking with Vite
- Code splitting for optimal loading
- Tailwind CSS purging for minimal CSS size

### Backend Optimization

- Release mode Rust compilation for performance
- Static linking for portability
- Icon generation for all platforms

### Build Command

```bash
npm run tauri build
```

## Best Practices

### General

1. **Consistent Naming**: Use descriptive names for files, components, and functions
2. **Type Everything**: Leverage TypeScript's type system for safety
3. **Document Your Code**: Use JSDoc for frontend and Rust doc comments for backend
4. **Error Handling**: Always handle errors properly in both frontend and backend
5. **Testing**: Write tests for critical components and functionality

### Frontend

1. **Component Structure**: Keep components small and focused
2. **Custom Hooks**: Extract reusable logic into custom hooks
3. **Memoization**: Use React.memo, useMemo, and useCallback for performance
4. **State Management**: Keep state as local as possible before using global state

### Backend

1. **Command Organization**: Group related commands together
2. **Error Propagation**: Use `?` operator and Result type consistently
3. **Logging**: Add appropriate logging for debugging
4. **Permission Handling**: Always check permissions before accessing resources

By following these guidelines and leveraging the architecture of this boilerplate, you can build secure, performant, and maintainable Tauri applications. 