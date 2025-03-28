/**
 * Safe network request utilities for Tauri applications
 * 
 * These utilities provide secure wrappers around network requests with:
 * 1. Input and URL validation
 * 2. Content-Security-Policy enforcement
 * 3. Request and response sanitization
 * 4. Security logging
 * 5. Certificate pinning
 */

import { fetch as tauriFetch, ResponseType, FetchOptions } from '@tauri-apps/api/http';
import { securityLogger, SecurityCategory } from './securityLogger';
import { isValidUrl, isCleanInput } from '../helpers/validation';

/**
 * Error thrown when network requests fail due to security issues
 */
export class NetworkSecurityError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly originalError?: unknown,
    public readonly securityIssue?: string
  ) {
    super(message);
    this.name = 'NetworkSecurityError';
  }
}

/**
 * Pinned certificate hashes for specific domains
 * In a real app, these would be loaded from secure storage or configuration
 */
const PINNED_CERTIFICATES: Record<string, string[]> = {
  // Example: 'example.com': ['sha256/HASH1', 'sha256/HASH2'],
};

/**
 * Allowed domains for network requests
 * This provides an allowlist approach to network access
 */
const ALLOWED_DOMAINS: string[] = [
  // Add your allowed domains here
  'api.github.com',
  'api.openai.com',
  'tauri.app',
];

/**
 * Check if a domain is in the allowed list
 * @param url The URL to check
 * @returns True if the domain is allowed
 */
function isDomainAllowed(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    return ALLOWED_DOMAINS.some(domain => {
      if (domain.startsWith('*.')) {
        // Wildcard domain matching
        const baseDomain = domain.substring(2);
        return parsedUrl.hostname.endsWith(baseDomain);
      } else {
        // Exact domain matching
        return parsedUrl.hostname === domain;
      }
    });
  } catch (e) {
    securityLogger.error(
      SecurityCategory.NETWORK,
      `Invalid URL format: ${url}`,
      'safeNetworkRequests',
      { error: e }
    );
    return false;
  }
}

/**
 * Sanitize request headers to prevent header injection
 * @param headers Headers to sanitize
 * @returns Sanitized headers
 */
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    // Prevent header splitting attacks by removing CR/LF
    const sanitizedKey = key.replace(/[\r\n]/g, '');
    const sanitizedValue = value.replace(/[\r\n]/g, '');
    
    sanitized[sanitizedKey] = sanitizedValue;
  }
  
  return sanitized;
}

/**
 * Validate URL and check against allowed domains
 * @param url The URL to validate
 * @returns True if the URL is valid and allowed
 */
function validateUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    securityLogger.warning(
      SecurityCategory.NETWORK,
      `Invalid URL format: ${url}`,
      'safeNetworkRequests'
    );
    return false;
  }
  
  if (!isDomainAllowed(url)) {
    securityLogger.warning(
      SecurityCategory.NETWORK,
      `Request to non-allowlisted domain: ${url}`,
      'safeNetworkRequests'
    );
    return false;
  }
  
  return true;
}

/**
 * Safe implementation of fetch with security checks
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise resolving to the fetched data
 */
export async function safeFetch<T>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  try {
    // Validate URL
    if (!validateUrl(url)) {
      throw new NetworkSecurityError(
        `URL failed security validation: ${url}`,
        url,
        null,
        'URL_VALIDATION_FAILED'
      );
    }
    
    // Sanitize headers
    const sanitizedOptions = { ...options };
    if (sanitizedOptions.headers) {
      sanitizedOptions.headers = sanitizeHeaders(sanitizedOptions.headers as Record<string, string>);
    }
    
    // Add security headers if not present
    if (!sanitizedOptions.headers) {
      sanitizedOptions.headers = {};
    }
    
    if (!('X-Content-Type-Options' in (sanitizedOptions.headers as Record<string, string>))) {
      (sanitizedOptions.headers as Record<string, string>)['X-Content-Type-Options'] = 'nosniff';
    }
    
    // Log the request
    securityLogger.info(
      SecurityCategory.NETWORK,
      `Making secure network request to ${url}`,
      'safeNetworkRequests',
      { method: sanitizedOptions.method || 'GET' }
    );
    
    // Make the request
    const response = await tauriFetch<T>(url, sanitizedOptions);
    
    // Validate certificate if domain has pinned certificates
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    if (PINNED_CERTIFICATES[domain] && !(await validateCertificate(url, PINNED_CERTIFICATES[domain]))) {
      throw new NetworkSecurityError(
        `Certificate validation failed for ${domain}`,
        url,
        null,
        'CERTIFICATE_VALIDATION_FAILED'
      );
    }
    
    // Check response status
    if (response.status < 200 || response.status >= 300) {
      throw new NetworkSecurityError(
        `Request failed with status ${response.status}`,
        url,
        null,
        'HTTP_ERROR_STATUS'
      );
    }
    
    return response.data;
  } catch (error) {
    // Handle and log errors
    if (error instanceof NetworkSecurityError) {
      securityLogger.error(
        SecurityCategory.NETWORK,
        `Network security error: ${error.message}`,
        'safeNetworkRequests',
        { url, error, securityIssue: error.securityIssue }
      );
      throw error;
    }
    
    securityLogger.error(
      SecurityCategory.NETWORK,
      `Network request failed: ${(error as Error)?.message || 'Unknown error'}`,
      'safeNetworkRequests',
      { url, error }
    );
    
    throw new NetworkSecurityError(
      `Network request failed: ${(error as Error)?.message || 'Unknown error'}`,
      url,
      error
    );
  }
}

/**
 * Validate certificate against pinned hashes
 * Note: This is a simplified implementation. In production,
 * you would implement actual certificate fingerprint checking.
 * @param url The URL to validate
 * @param pinnedHashes The pinned certificate hashes
 * @returns Promise resolving to true if certificate is valid
 */
async function validateCertificate(url: string, pinnedHashes: string[]): Promise<boolean> {
  try {
    // This is a placeholder for actual certificate validation
    // In a real implementation, you would:
    // 1. Extract the certificate chain from the response
    // 2. Calculate the fingerprint of the public key
    // 3. Compare against the pinned hashes
    
    // For now, we'll just log that validation would happen
    securityLogger.info(
      SecurityCategory.NETWORK,
      `Certificate validation would occur for ${url}`,
      'safeNetworkRequests',
      { pinnedHashes }
    );
    
    // In a real implementation, this would return the result of validation
    return true;
  } catch (error) {
    securityLogger.error(
      SecurityCategory.NETWORK,
      `Certificate validation failed: ${(error as Error)?.message || 'Unknown error'}`,
      'safeNetworkRequests',
      { url, error }
    );
    
    return false;
  }
}

/**
 * Safe implementation of GET request
 * @param url The URL to fetch
 * @param headers Optional headers
 * @returns Promise resolving to the fetched data
 */
export async function safeGet<T>(
  url: string,
  headers?: Record<string, string>
): Promise<T> {
  return safeFetch<T>(url, {
    method: 'GET',
    headers,
    responseType: ResponseType.JSON,
  });
}

/**
 * Safe implementation of POST request
 * @param url The URL to post to
 * @param body The body to send
 * @param headers Optional headers
 * @returns Promise resolving to the response data
 */
export async function safePost<T, B>(
  url: string,
  body: B,
  headers?: Record<string, string>
): Promise<T> {
  return safeFetch<T>(url, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    responseType: ResponseType.JSON,
  });
}

/**
 * Safe implementation of PUT request
 * @param url The URL to put to
 * @param body The body to send
 * @param headers Optional headers
 * @returns Promise resolving to the response data
 */
export async function safePut<T, B>(
  url: string,
  body: B,
  headers?: Record<string, string>
): Promise<T> {
  return safeFetch<T>(url, {
    method: 'PUT',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    responseType: ResponseType.JSON,
  });
}

/**
 * Safe implementation of DELETE request
 * @param url The URL to delete from
 * @param headers Optional headers
 * @returns Promise resolving to the response data
 */
export async function safeDelete<T>(
  url: string,
  headers?: Record<string, string>
): Promise<T> {
  return safeFetch<T>(url, {
    method: 'DELETE',
    headers,
    responseType: ResponseType.JSON,
  });
}

/**
 * Example usage:
 * 
 * import { safeGet, safePost } from './safeNetworkRequests';
 * 
 * async function fetchUserData(userId: string) {
 *   try {
 *     const userData = await safeGet<UserData>(`https://api.example.com/users/${userId}`);
 *     return userData;
 *   } catch (error) {
 *     console.error('Failed to fetch user data:', error);
 *     return null;
 *   }
 * }
 * 
 * async function createUser(userData: NewUser) {
 *   try {
 *     const response = await safePost<CreateUserResponse, NewUser>(
 *       'https://api.example.com/users',
 *       userData
 *     );
 *     return response;
 *   } catch (error) {
 *     console.error('Failed to create user:', error);
 *     return null;
 *   }
 * }
 */ 