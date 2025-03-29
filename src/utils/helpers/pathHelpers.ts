/**
 * Path utility functions for secure path handling
 */

/**
 * Sanitize a file path to prevent path traversal attacks
 * 
 * @param path The path to sanitize
 * @returns The sanitized path or null if the path is invalid
 */
export function sanitizePath(path: string): string | null {
  if (!path) {
    return null;
  }

  // Normalize path - convert backslashes to forward slashes
  let normalized = path.replace(/\\/g, '/');

  // Remove any null bytes (these can be used to trick string processing)
  normalized = normalized.replace(/\0/g, '');

  // Detect path traversal attempts
  if (normalized.includes('../') || normalized.includes('..\\')) {
    return null;
  }

  // Check for absolute path patterns
  if (normalized.match(/^(\/|[A-Za-z]:)/)) {
    // This is an absolute path, which might be fine depending on your use case,
    // but in many cases it's safer to restrict to relative paths
    // If you want to disallow absolute paths, return null here
    // return null;
  }

  // Additional security checks can be added here
  
  return normalized;
}

/**
 * Get file extension from path
 * 
 * @param path The file path
 * @returns The file extension (lowercase) or empty string if none
 */
export function getFileExtension(path: string): string {
  if (!path) {
    return '';
  }
  
  const filename = path.split('/').pop() || '';
  const parts = filename.split('.');
  
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Checks if a file has an allowed extension
 * 
 * @param path The file path
 * @param allowedExtensions Array of allowed extensions
 * @returns True if file has an allowed extension
 */
export function hasAllowedExtension(path: string, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(path);
  
  if (!extension) {
    return false;
  }
  
  return allowedExtensions.includes(extension.toLowerCase());
}

/**
 * Get directory path from a file path
 * 
 * @param path The file path
 * @returns The directory containing the file
 */
export function getDirectoryPath(path: string): string {
  if (!path) {
    return '';
  }
  
  const normalized = path.replace(/\\/g, '/');
  const lastSlashIndex = normalized.lastIndexOf('/');
  
  return lastSlashIndex >= 0 ? normalized.substring(0, lastSlashIndex) : '';
}

/**
 * Joins path segments safely
 * 
 * @param segments Path segments to join
 * @returns Joined path
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .filter(Boolean)
    .map(segment => segment.replace(/^\/|\/$/g, ''))
    .join('/');
} 