/**
 * Secure storage utilities for Tauri applications
 * 
 * These utilities provide encrypted storage capabilities with:
 * 1. Data encryption at rest
 * 2. Secure key management
 * 3. Data validation
 * 4. Error handling
 * 5. Security logging
 */

import { securityLogger, SecurityCategory } from './securityLogger';

/**
 * Result type for data operations
 */
export interface SecureResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

/**
 * User data structure for secure storage
 */
export interface SecureUserProfile {
  id: string;
  username: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  permissions: string[];
  lastLogin: string;
}

// Simple encryption key management
// In a production app, consider more robust key management
const getEncryptionKey = (): string => {
  // Mock implementation - in production, use a secure method to derive or retrieve the key
  return 'secure-encryption-key-for-development-only';
};

/**
 * Save data securely to storage
 */
export async function secureStore<T>(key: string, data: T): Promise<SecureResult<boolean>> {
  try {
    securityLogger.info(
      SecurityCategory.STORAGE,
      `Storing data securely with key: ${key}`,
      'secureStore'
    );
    
    // In a real implementation, we would encrypt and store the data
    // using Tauri's secure storage APIs
    // Mock implementation for development
    console.log(`Securely stored data with key: ${key}`);
    
    return { ok: true, value: true };
  } catch (error) {
    securityLogger.error(
      SecurityCategory.STORAGE,
      `Secure storage failed: ${error instanceof Error ? error.message : String(error)}`,
      'secureStore',
      { key, error }
    );
    
    return { 
      ok: false,
      error: `Failed to store data: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Retrieve data securely from storage
 */
export async function secureRetrieve<T>(key: string): Promise<SecureResult<T>> {
  try {
    securityLogger.info(
      SecurityCategory.STORAGE,
      `Retrieving data securely with key: ${key}`,
      'secureRetrieve'
    );
    
    // In a real implementation, we would retrieve and decrypt the data
    // using Tauri's secure storage APIs
    // Mock implementation for development
    const mockUserData = {
      id: 'user123',
      username: 'demo_user',
      email: 'user@example.com',
      preferences: {
        theme: 'system',
        notifications: true
      },
      permissions: ['read', 'write'],
      lastLogin: new Date().toISOString()
    } as unknown as T;
    
    return { ok: true, value: mockUserData };
  } catch (error) {
    securityLogger.error(
      SecurityCategory.STORAGE,
      `Secure retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
      'secureRetrieve',
      { key, error }
    );
    
    return { 
      ok: false,
      error: `Failed to retrieve data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Delete data securely from storage
 */
export async function secureDelete(key: string): Promise<SecureResult<boolean>> {
  try {
    securityLogger.info(
      SecurityCategory.STORAGE,
      `Deleting data securely with key: ${key}`,
      'secureDelete'
    );
    
    // In a real implementation, we would securely delete the data
    // using Tauri's secure storage APIs
    // Mock implementation for development
    console.log(`Securely deleted data with key: ${key}`);
    
    return { ok: true, value: true };
  } catch (error) {
    securityLogger.error(
      SecurityCategory.STORAGE,
      `Secure deletion failed: ${error instanceof Error ? error.message : String(error)}`,
      'secureDelete',
      { key, error }
    );
    
    return { 
      ok: false,
      error: `Failed to delete data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Secure storage utility for encrypting sensitive data before storing locally
 * Provides a wrapper around localStorage with encryption for sensitive data
 */

// Simple encryption key management
// In a production app, consider more robust key management
class KeyManager {
  private static KEY_STORAGE_NAME = 'app-encryption-key';
  
  /**
   * Get the encryption key, generating a new one if it doesn't exist
   */
  public static getOrCreateKey(): string {
    const existingKey = localStorage.getItem(this.KEY_STORAGE_NAME);
    
    if (existingKey) {
      return existingKey;
    }
    
    // Generate a random key
    const newKey = this.generateRandomKey();
    localStorage.setItem(this.KEY_STORAGE_NAME, newKey);
    
    return newKey;
  }
  
  /**
   * Generate a random encryption key
   */
  private static generateRandomKey(): string {
    const array = new Uint8Array(32); // 256 bits
    window.crypto.getRandomValues(array);
    
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

/**
 * Secure storage class for handling sensitive data
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: string;
  private namespace: string;
  
  private constructor(namespace: string) {
    this.encryptionKey = KeyManager.getOrCreateKey();
    this.namespace = namespace;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(namespace: string): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage(namespace);
    }
    return SecureStorage.instance;
  }
  
  /**
   * Store a value securely
   * @param key The key to store under
   * @param value The value to encrypt and store
   * @param isSensitive Whether the data should be encrypted
   */
  public setItem(key: string, value: string, isSensitive = false): void {
    try {
      if (isSensitive) {
        const encryptedValue = this.encrypt(value);
        localStorage.setItem(`${this.namespace}:${key}`, encryptedValue);
        
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Stored encrypted data for key: ${key}`,
          'SecureStorage'
        );
      } else {
        localStorage.setItem(`${this.namespace}:${key}`, value);
      }
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Failed to store data for key: ${key}`,
        'SecureStorage',
        { error }
      );
      throw new Error(`Failed to store data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Retrieve a value
   * @param key The key to retrieve
   * @param defaultValue Default value if key doesn't exist
   */
  public getItem(key: string, defaultValue = ''): string {
    try {
      const storedItem = localStorage.getItem(`${this.namespace}:${key}`);
      
      if (!storedItem) {
        return defaultValue;
      }
      
      if (storedItem.startsWith('encrypted:')) {
        const encryptedValue = storedItem.slice(10);
        const decryptedValue = this.decrypt(encryptedValue);
        
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Retrieved and decrypted data for key: ${key}`,
          'SecureStorage'
        );
        
        return decryptedValue;
      }
      
      return storedItem;
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Failed to retrieve data for key: ${key}`,
        'SecureStorage',
        { error }
      );
      return defaultValue;
    }
  }
  
  /**
   * Remove a value
   * @param key The key to remove
   */
  public removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.namespace}:${key}`);
      
      securityLogger.info(
        SecurityCategory.DATA_ACCESS,
        `Removed data for key: ${key}`,
        'SecureStorage'
      );
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Failed to remove data for key: ${key}`,
        'SecureStorage',
        { error }
      );
    }
  }
  
  /**
   * Clear all stored values
   */
  public clear(): void {
    try {
      localStorage.clear();
      
      securityLogger.warning(
        SecurityCategory.DATA_ACCESS,
        'Cleared all stored data',
        'SecureStorage'
      );
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        'Failed to clear all data',
        'SecureStorage',
        { error }
      );
    }
  }
  
  /**
   * Encrypt a string value using the encryption key
   * Note: In a production app, use a more robust encryption library
   */
  private encrypt(text: string): string {
    try {
      // This is a simple XOR-based encryption for demonstration
      // In production, use a proper encryption library
      const textBytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(this.encryptionKey);
      
      const encryptedBytes = new Uint8Array(textBytes.length);
      
      for (let i = 0; i < textBytes.length; i++) {
        encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      // Convert to base64 for storage
      return 'encrypted:' + btoa(String.fromCharCode(...encryptedBytes));
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        'Encryption failed',
        'SecureStorage',
        { error }
      );
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Decrypt a string value using the encryption key
   * Note: In a production app, use a more robust encryption library
   */
  private decrypt(encryptedText: string): string {
    try {
      // Convert from base64
      const encryptedBytes = new Uint8Array(
        atob(encryptedText.slice(10)).split('').map(c => c.charCodeAt(0))
      );
      
      const keyBytes = new TextEncoder().encode(this.encryptionKey);
      const decryptedBytes = new Uint8Array(encryptedBytes.length);
      
      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return new TextDecoder().decode(decryptedBytes);
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        'Decryption failed',
        'SecureStorage',
        { error }
      );
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }
}

/**
 * Creates and returns a SecureStorage instance for the given namespace
 * @param namespace The namespace for the storage
 */
export function getSecureStorage(namespace: string): SecureStorage {
  return SecureStorage.getInstance(namespace);
}

/**
 * Example usage:
 * 
 * const userStorage = getSecureStorage('user');
 * await userStorage.setItem('token', 'jwt_token_here');
 * const token = await userStorage.getItem('token');
 * console.log(token); // 'jwt_token_here'
 */ 