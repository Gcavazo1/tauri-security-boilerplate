/**
 * Secure storage utility for encrypting sensitive data before storing locally
 * Provides a wrapper around localStorage with encryption for sensitive data
 */

import { securityLogger, SecurityCategory } from './securityLogger';

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
  
  private constructor() {
    this.encryptionKey = KeyManager.getOrCreateKey();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
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
        localStorage.setItem(key, JSON.stringify({
          encrypted: true,
          value: encryptedValue
        }));
        
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Stored encrypted data for key: ${key}`,
          'SecureStorage'
        );
      } else {
        localStorage.setItem(key, JSON.stringify({
          encrypted: false,
          value
        }));
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
      const storedItem = localStorage.getItem(key);
      
      if (!storedItem) {
        return defaultValue;
      }
      
      const parsedItem = JSON.parse(storedItem);
      
      if (parsedItem.encrypted) {
        const decryptedValue = this.decrypt(parsedItem.value);
        
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Retrieved and decrypted data for key: ${key}`,
          'SecureStorage'
        );
        
        return decryptedValue;
      }
      
      return parsedItem.value;
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
      localStorage.removeItem(key);
      
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
      return btoa(String.fromCharCode(...encryptedBytes));
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
        atob(encryptedText).split('').map(c => c.charCodeAt(0))
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

// Export a default instance for convenience
export const secureStorage = SecureStorage.getInstance();

/**
 * Example usage:
 * 
 * import { secureStorage } from './secureStorage';
 * 
 * // Store sensitive data (encrypted)
 * secureStorage.setItem('auth-token', 'my-secret-token', true);
 * 
 * // Store non-sensitive data (not encrypted)
 * secureStorage.setItem('user-theme', 'dark');
 * 
 * // Retrieve data (automatically handles decryption if needed)
 * const token = secureStorage.getItem('auth-token');
 * const theme = secureStorage.getItem('user-theme');
 */ 