# Security Features Showcase

This document demonstrates the practical implementation of our security features with real code examples from the boilerplate.

## 1. Type-Safe IPC Communication

Our IPC system prevents command injection attacks and ensures that data sent between the frontend and backend is properly validated and typed.

```typescript
// From src/utils/safeIpc.ts
import { invoke } from '@tauri-apps/api/tauri';
import { z } from 'zod';
import { logSecurityEvent } from './securityLogging';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export async function safeInvoke<T>(
  command: string,
  args: Record<string, unknown>,
  schema: z.ZodType<T>
): Promise<Result<T, Error>> {
  try {
    // Log the IPC call attempt (without sensitive data)
    logSecurityEvent({
      type: 'ipc-call',
      command,
      timestamp: new Date().toISOString(),
    });

    // Invoke the command
    const result = await invoke<unknown>(command, args);
    
    // Validate the response with Zod schema
    const parsed = schema.safeParse(result);
    
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    
    return { ok: true, value: parsed.data };
  } catch (error) {
    logSecurityEvent({
      type: 'ipc-error',
      command,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return { 
      ok: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// Usage example:
const FileDataSchema = z.object({
  contents: z.string(),
  metadata: z.object({
    lastModified: z.number(),
    size: z.number(),
  }),
});

type FileData = z.infer<typeof FileDataSchema>;

export async function readSecureFile(path: string): Promise<Result<FileData, Error>> {
  return safeInvoke<FileData>('read_secure_file', { path }, FileDataSchema);
}
```

## 2. Memory-Safe Data Handling in Rust

Our Rust backend includes utilities for handling sensitive data securely in memory:

```rust
// From src-tauri/src/utils/memory_safe.rs
use std::ptr;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};

static SENSITIVE_STRING_CACHE: Lazy<Mutex<Vec<SensitiveString>>> = 
    Lazy::new(|| Mutex::new(Vec::new()));

/// A string container that automatically zeros memory when dropped
pub struct SensitiveString {
    data: Vec<u8>,
}

impl SensitiveString {
    pub fn new(s: &str) -> Self {
        let mut instance = Self {
            data: s.as_bytes().to_vec(),
        };
        
        // Register for cleanup on process exit
        SENSITIVE_STRING_CACHE.lock().unwrap().push(instance.clone());
        
        instance
    }
    
    pub fn as_str(&self) -> &str {
        std::str::from_utf8(&self.data).unwrap_or_default()
    }
}

impl Drop for SensitiveString {
    fn drop(&mut self) {
        // Zero out the memory before deallocation
        for byte in &mut self.data {
            unsafe {
                ptr::write_volatile(byte, 0);
            }
        }
    }
}

impl Clone for SensitiveString {
    fn clone(&self) -> Self {
        Self {
            data: self.data.clone(),
        }
    }
}

/// Example command handler using secure memory practices
#[tauri::command]
pub fn handle_sensitive_data(input: String) -> Result<String, String> {
    // Store sensitive data in protected memory
    let sensitive = SensitiveString::new(&input);
    
    // Process the data securely...
    let result = process_without_leaking(sensitive.as_str())?;
    
    Ok(result)
}

fn process_without_leaking(data: &str) -> Result<String, String> {
    // Secure processing logic
    Ok(format!("Processed: {}", data.len()))
}

// Clean up all sensitive strings on process exit
pub fn cleanup_sensitive_data() {
    if let Ok(mut cache) = SENSITIVE_STRING_CACHE.lock() {
        cache.clear();
    }
}
```

## 3. Input Validation and Sanitization

Our validation utilities ensure that untrusted input is properly validated before use:

```typescript
// From src/utils/inputValidation.ts
import { z } from 'zod';
import DOMPurify from 'dompurify';

// File path validation schema
export const FilePathSchema = z.string()
  .min(1)
  .refine(
    path => !path.includes('..'),
    { message: 'Path traversal attack detected' }
  )
  .refine(
    path => !/[<>:"|?*]/.test(path),
    { message: 'Invalid characters in file path' }
  );

// URL validation schema
export const URLSchema = z.string()
  .url()
  .refine(
    url => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );

// HTML content sanitization
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
}

// Validate and sanitize user input
export function validateUserInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, 1000);
  
  // Remove potential script tags or other dangerous content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
}
```

## 4. Secure Network Requests

Our network utility ensures that HTTP requests are safe:

```typescript
// From src/utils/safeNetworkRequests.ts
import { z } from 'zod';
import { URLSchema } from './inputValidation';
import { logSecurityEvent } from './securityLogging';

// List of allowed domains for outbound requests
const ALLOWED_DOMAINS = [
  'api.yourcompany.com',
  'cdn.yourcompany.com',
  'github.com',
  'api.github.com',
];

// Response schema for common API responses
const APIResponseSchema = z.object({
  status: z.number(),
  data: z.unknown(),
  message: z.string().optional(),
});

type APIResponse<T> = {
  status: number;
  data: T;
  message?: string;
};

export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  responseSchema: z.ZodType<T>
): Promise<APIResponse<T>> {
  try {
    // Validate URL
    const parsedUrl = URLSchema.safeParse(url);
    if (!parsedUrl.success) {
      throw new Error(`Invalid URL: ${parsedUrl.error.message}`);
    }
    
    // Check if domain is allowed
    const domain = new URL(url).hostname;
    if (!ALLOWED_DOMAINS.includes(domain)) {
      logSecurityEvent({
        type: 'network-policy-violation',
        url,
        domain,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Domain not allowed: ${domain}`);
    }
    
    // Add security headers
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-Content-Type-Options': 'nosniff',
      },
    };
    
    // Make the request
    const response = await fetch(url, secureOptions);
    const data = await response.json();
    
    // Validate response structure
    const baseResponse = APIResponseSchema.parse({
      status: response.status,
      data,
      message: data.message,
    });
    
    // Validate specific data shape
    const validatedData = responseSchema.parse(data);
    
    return {
      status: baseResponse.status,
      data: validatedData,
      message: baseResponse.message,
    };
  } catch (error) {
    logSecurityEvent({
      type: 'network-request-error',
      url,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}
```

## 5. Resource Integrity Checking

Our integrity checking utility verifies that application resources haven't been tampered with:

```typescript
// From src/utils/resourceIntegrity.ts
import { invoke } from '@tauri-apps/api/tauri';
import { logSecurityEvent } from './securityLogging';

interface ResourceHash {
  path: string;
  hash: string;
}

const RESOURCE_HASHES: ResourceHash[] = [
  { path: 'app.js', hash: 'sha256-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3' },
  { path: 'index.html', hash: 'sha256-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e' },
  // Add more resource hashes as needed
];

export async function verifyResourceIntegrity(): Promise<boolean> {
  try {
    for (const resource of RESOURCE_HASHES) {
      const verified = await invoke<boolean>('verify_resource_integrity', {
        path: resource.path,
        expectedHash: resource.hash,
      });
      
      if (!verified) {
        logSecurityEvent({
          type: 'integrity-violation',
          resource: resource.path,
          timestamp: new Date().toISOString(),
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logSecurityEvent({
      type: 'integrity-check-error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

// Rust implementation in src-tauri/src/commands.rs
#[tauri::command]
pub async fn verify_resource_integrity(path: String, expected_hash: String) -> Result<bool, String> {
  use sha2::{Sha256, Digest};
  use std::fs;
  
  // Read the file
  let contents = match fs::read(&path) {
    Ok(data) => data,
    Err(e) => return Err(format!("Failed to read file: {}", e)),
  };
  
  // Calculate SHA-256 hash
  let mut hasher = Sha256::new();
  hasher.update(&contents);
  let hash = format!("sha256-{}", hex::encode(hasher.finalize()));
  
  // Compare with expected hash
  Ok(hash == expected_hash)
}
```

## 6. Security Logging

Our security logging system provides comprehensive visibility into security events:

```typescript
// From src/utils/securityLogging.ts
import { invoke } from '@tauri-apps/api/tauri';

interface SecurityEvent {
  type: string;
  timestamp: string;
  [key: string]: unknown;
}

// In-memory cache of recent security events
const recentEvents: SecurityEvent[] = [];
const MAX_CACHED_EVENTS = 100;

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Add to in-memory cache
    recentEvents.push(event);
    if (recentEvents.length > MAX_CACHED_EVENTS) {
      recentEvents.shift();
    }
    
    // Log to backend
    await invoke('log_security_event', { event: JSON.stringify(event) });
    
    // Log to console in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }
  } catch (error) {
    // Fallback logging if backend logging fails
    console.error('Failed to log security event:', error);
  }
}

export function getRecentSecurityEvents(): SecurityEvent[] {
  return [...recentEvents];
}

// Rust implementation in src-tauri/src/security_logging.rs
use chrono::Utc;
use serde_json::{Value, json};
use std::fs::{OpenOptions, File};
use std::io::Write;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static SECURITY_LOG: Lazy<Mutex<File>> = Lazy::new(|| {
  let log_file = OpenOptions::new()
    .create(true)
    .append(true)
    .open("security.log")
    .expect("Failed to open security log file");
  
  Mutex::new(log_file)
});

#[tauri::command]
pub fn log_security_event(event: String) -> Result<(), String> {
  let parsed: Value = match serde_json::from_str(&event) {
    Ok(v) => v,
    Err(e) => return Err(format!("Invalid JSON: {}", e)),
  };
  
  // Add server timestamp
  let enriched = json!({
    "server_timestamp": Utc::now().to_rfc3339(),
    "event": parsed
  });
  
  let log_line = format!("{}\n", enriched.to_string());
  
  if let Ok(mut file) = SECURITY_LOG.lock() {
    if let Err(e) = file.write_all(log_line.as_bytes()) {
      return Err(format!("Failed to write to log: {}", e));
    }
  } else {
    return Err("Failed to acquire log file lock".to_string());
  }
  
  Ok(())
}
```

## 7. Tauri Capability-Based Security

Our application leverages Tauri 2.0's capability-based security model:

```json
// From src-tauri/permissions/fs-read-downloads.json
{
  "identifier": "fs:read-downloads",
  "description": "Read access to the downloads directory",
  "read": {
    "allow": ["$DOWNLOAD/**"]
  }
}
```

```json
// From src-tauri/permissions/fs-write-downloads.json
{
  "identifier": "fs:write-downloads",
  "description": "Write access to the downloads directory",
  "write": {
    "allow": ["$DOWNLOAD/**"]
  }
}
```

## 8. Content Security Policy

Our application uses a strict Content Security Policy to prevent XSS and other injection attacks:

```html
<!-- From index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https://api.yourcompany.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;">
```

## 9. CI/CD Security Checks

Our GitHub Actions CI/CD workflow includes security scanning:

```yaml
# From .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
      - name: Install cargo-audit
        run: cargo install cargo-audit
      - name: Rust Security Audit
        run: cargo audit
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: NPM Security Audit
        run: npm audit --production
```

## 10. Error Boundaries

Our application uses React Error Boundaries to prevent the entire app from crashing:

```tsx
// From src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logSecurityEvent } from '../utils/securityLogging';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logSecurityEvent({
      type: 'react-error',
      error: error.message,
      stack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Sanitized error UI
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
``` 