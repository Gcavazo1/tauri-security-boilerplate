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
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates that a string doesn't contain potential injection patterns
 * @param input The string to validate
 * @returns True if the string is clean, false if it might contain injection attempts
 */
export function isCleanInput(input: string): boolean {
  // Check for common script injection patterns
  const scriptPatterns = [
    /<script\b[^>]*>(.*?)<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
    /data:\s*text\/html/i
  ];

  for (const pattern of scriptPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /'\s*or\s*'1'='1/i,
    /'\s*or\s*1=1/i,
    /'\s*or\s*'\w+'='\w+/i,
    /'\s*;\s*drop\s+table/i,
    /'\s*;\s*select\s+/i,
    /'\s*;\s*insert\s+/i,
    /'\s*;\s*update\s+/i,
    /'\s*;\s*delete\s+/i
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
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
 * Validates that input is alphanumeric with optional allowed extra characters
 * @param input The string to validate
 * @param allowedChars Additional allowed characters beyond alphanumeric
 * @returns True if the string contains only allowed characters
 */
export function isAlphanumeric(input: string, allowedChars: string = ''): boolean {
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