/**
 * Input validation utilities for securing user inputs
 * These utilities help prevent injection attacks and validate data formats
 */

/**
 * Validates a file path to prevent path traversal and other attacks
 * @param path The file path to validate
 * @returns True if the path is valid, false otherwise
 */
export function isValidFilePath(path: string): boolean {
  // Check for null bytes which can be used in path traversal attacks
  if (path.includes('\0')) {
    return false;
  }

  // Check for suspicious path traversal patterns
  const pathTraversalPatterns = [
    '../', '..\\', // Path traversal
    '/./', '\\.\\', // Alternate path traversal
    '~/', // Home directory (may be acceptable in some cases)
  ];

  for (const pattern of pathTraversalPatterns) {
    if (path.includes(pattern)) {
      return false;
    }
  }

  // Check for potentially dangerous Windows UNC paths
  if (/^\\\\[^\\]/.test(path)) {
    return false;
  }

  return true;
}

/**
 * Sanitizes a filename by removing potentially dangerous characters
 * @param filename The filename to sanitize
 * @returns A sanitized filename
 */
export function sanitizeFileName(filename: string): string {
  // Remove characters that are invalid in filenames across platforms
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Invalid chars
    .replace(/^\.+/, '') // Leading dots
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, '_$1') // Reserved Windows filenames
    .trim();
}

/**
 * Validates a URL to prevent malicious redirects and other URL-based attacks
 * @param url The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    // Try to create a URL object to validate
    const urlObj = new URL(url);
    // Check for http/https protocol
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates that a string doesn't contain potential injection patterns
 * @param input The string to validate
 * @returns True if the string is clean, false if it might contain injection attempts
 */
export function isCleanInput(input: string): boolean {
  if (!input) return true;
  
  return isCleanSql(input) && isCleanHtml(input);
}

/**
 * Validates that input is within expected length bounds
 * @param input The string to validate
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns True if the string length is within bounds
 */
export function isValidLength(input: string, minLength: number, maxLength: number): boolean {
  return input.length >= minLength && input.length <= maxLength;
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param html The string to escape
 * @returns The escaped string
 */
export function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates if a string contains only alphanumeric characters
 * @param value The string to validate
 * @param allowedChars Optional additional allowed characters
 * @returns Whether the string is alphanumeric (plus allowed chars)
 */
export function isAlphanumeric(input: string, allowedChars: string = ''): boolean {
  if (!input) return false;
  
  // Create a regex pattern that includes alphanumeric and any additional allowed characters
  const pattern = new RegExp(`^[a-zA-Z0-9${allowedChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]+$`);
  return pattern.test(input);
}

/**
 * Type validation for numbers to prevent type coercion vulnerabilities
 * @param value The value to check
 * @returns True if the value is a number and not NaN
 */
export function isValidNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Format validation for commands to prevent command injection
 * @param command The command string to validate
 * @returns True if the command doesn't contain injection patterns
 */
export function isValidCommand(command: string): boolean {
  // Check for shell metacharacters and operators
  const shellPatterns = [
    /[;&|`$()><\n\\]/,  // Shell metacharacters
    /\|\|/,              // OR operator
    /&&/                 // AND operator
  ];

  for (const pattern of shellPatterns) {
    if (pattern.test(command)) {
      return false;
    }
  }

  return true;
}

/**
 * Format validation for JSON strings to prevent JSON injection
 * @param jsonString The JSON string to validate
 * @returns True if the string is valid JSON
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Sanitizes and validates user input to prevent XSS and other injection attacks
 * @param input The user input to validate
 * @returns The sanitized input string
 * @throws Error if the input is not a string
 */
export function validateUserInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, 1000);
  
  // Remove potential script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
}

/**
 * Check if a string doesn't contain SQL injection patterns
 */
export function isCleanSql(input: string): boolean {
  if (!input) return true;
  
  // Simple check for common SQL injection patterns
  const sqlPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b/i,
    /(['"]);/,
    /--/,
    /\/\*/,
    /\bOR\s+\d+=\d+\b/i,
    /\bOR\s+'.*?'='.*?'/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check if a string is clean of potentially dangerous HTML/JS content
 */
export function isCleanHtml(input: string): boolean {
  if (!input) return true;
  
  // Check for script tags, event handlers, etc.
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick, onload, etc.
    /<iframe/i,
    /<embed/i,
    /data:/i // data URLs can contain executable content
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate an email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
}

/**
 * Check if a password meets security requirements
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUppercase && hasLowercase && hasDigit && hasSpecial;
}

/**
 * Validate that a filename doesn't contain path traversal or invalid characters
 */
export function isValidFilename(filename: string): boolean {
  if (!filename) return false;
  
  // Check for directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  
  // Check for invalid characters (depends on OS, this is a basic check)
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(filename)) {
    return false;
  }
  
  return true;
}

/**
 * Validates if the input is a valid file path
 * (Prevents path traversal and other security issues)
 * @param path The file path to validate
 * @returns Whether the path is valid
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check for path traversal attempts
  if (path.includes('..') || path.includes('./') || path.includes('/.')) {
    return false;
  }

  // Check for null bytes (potential security issue)
  if (path.includes('\0')) {
    return false;
  }

  // Additional checks could be added for specific platforms
  
  return true;
}

/**
 * Checks if the provided input is a non-empty string
 * @param value The value to check
 * @returns Whether the value is a non-empty string
 */
export function isString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a password meets security requirements
 * @param password The password to validate
 * @returns Whether the password is secure
 */
export function isSecurePassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param html The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates if a string matches a specific format using a regex pattern
 * @param value The string to validate
 * @param pattern The regex pattern to test against
 * @returns Whether the string matches the pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
} 