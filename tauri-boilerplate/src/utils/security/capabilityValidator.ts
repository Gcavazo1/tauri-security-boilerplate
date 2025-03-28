/**
 * Capability validator utility for Tauri applications
 * 
 * This utility helps ensure that all required capabilities are available
 * before attempting to use them, which prevents runtime security errors
 * and provides better developer and user experience.
 */

import { invoke } from '@tauri-apps/api/core';
import { securityLogger, SecurityCategory, SecurityLevel } from './securityLogger';

// Define known capability categories
export enum CapabilityCategory {
  FS = 'fs',
  SHELL = 'shell',
  HTTP = 'http',
  DIALOG = 'dialog',
  WINDOW = 'window',
  OS = 'os',
  NOTIFICATION = 'notification',
  CLIPBOARD = 'clipboard',
  PATH = 'path',
}

/**
 * Interface for describing a capability requirement
 */
export interface CapabilityRequirement {
  category: CapabilityCategory;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Main capability validator class
 */
export class CapabilityValidator {
  private static instance: CapabilityValidator;
  private validatedCapabilities: Map<string, boolean> = new Map();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): CapabilityValidator {
    if (!CapabilityValidator.instance) {
      CapabilityValidator.instance = new CapabilityValidator();
    }
    return CapabilityValidator.instance;
  }
  
  /**
   * Check if a capability is available
   * @param category Capability category (e.g., 'fs', 'shell')
   * @param name Specific capability name (e.g., 'readFile', 'writeFile')
   * @returns Promise resolving to true if capability is available
   */
  public async checkCapability(category: CapabilityCategory, name: string): Promise<boolean> {
    const key = `${category}:${name}`;
    
    // Return cached result if available
    if (this.validatedCapabilities.has(key)) {
      return this.validatedCapabilities.get(key) || false;
    }
    
    try {
      // Try to check capability using Tauri's API
      const available = await invoke<boolean>('plugin:capability|check', {
        category,
        name,
      });
      
      this.validatedCapabilities.set(key, available);
      
      if (!available) {
        securityLogger.warning(
          SecurityCategory.AUTHORIZATION,
          `Capability not available: ${key}`,
          'CapabilityValidator'
        );
      }
      
      return available;
    } catch (error) {
      // Log the error
      securityLogger.error(
        SecurityCategory.AUTHORIZATION,
        `Failed to check capability: ${key}`,
        'CapabilityValidator',
        { error }
      );
      
      // Assume not available
      this.validatedCapabilities.set(key, false);
      return false;
    }
  }
  
  /**
   * Ensure that all required capabilities are available
   * @param requirements List of required capabilities
   * @returns Promise resolving to object with status and missing capabilities
   */
  public async validateRequirements(
    requirements: CapabilityRequirement[]
  ): Promise<{ valid: boolean; missing: CapabilityRequirement[] }> {
    const missingCapabilities: CapabilityRequirement[] = [];
    
    for (const req of requirements) {
      const available = await this.checkCapability(req.category, req.name);
      
      if (!available) {
        missingCapabilities.push(req);
      }
    }
    
    const valid = missingCapabilities.length === 0;
    
    if (!valid) {
      // Log critical or high severity missing capabilities
      const criticalMissing = missingCapabilities.filter(
        cap => cap.severity === 'critical' || cap.severity === 'high'
      );
      
      if (criticalMissing.length > 0) {
        securityLogger.error(
          SecurityCategory.AUTHORIZATION,
          `Missing critical capabilities: ${criticalMissing.map(c => `${c.category}:${c.name}`).join(', ')}`,
          'CapabilityValidator'
        );
      }
    }
    
    return { valid, missing: missingCapabilities };
  }
  
  /**
   * Clear the cache of validated capabilities
   * Useful when permissions might have changed at runtime
   */
  public clearCache(): void {
    this.validatedCapabilities.clear();
    
    securityLogger.info(
      SecurityCategory.AUTHORIZATION,
      'Cleared capability validation cache',
      'CapabilityValidator'
    );
  }
  
  /**
   * Get all available capabilities
   * @returns Promise resolving to an array of available capability identifiers
   */
  public async getAllAvailableCapabilities(): Promise<string[]> {
    try {
      const capabilities = await invoke<string[]>('plugin:capability|list');
      
      securityLogger.info(
        SecurityCategory.AUTHORIZATION,
        `Retrieved ${capabilities.length} available capabilities`,
        'CapabilityValidator'
      );
      
      return capabilities;
    } catch (error) {
      securityLogger.error(
        SecurityCategory.AUTHORIZATION,
        'Failed to retrieve available capabilities',
        'CapabilityValidator',
        { error }
      );
      
      return [];
    }
  }
}

// Export a default instance for convenience
export const capabilityValidator = CapabilityValidator.getInstance();

/**
 * A higher-order function that wraps a function to validate capabilities
 * before execution
 * 
 * @param requirements Capability requirements
 * @param fn Function to execute if capabilities are available
 * @returns A wrapped function that checks capabilities
 */
export function withCapabilities<T extends (...args: any[]) => Promise<any>>(
  requirements: CapabilityRequirement[],
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const { valid, missing } = await capabilityValidator.validateRequirements(requirements);
    
    if (!valid) {
      const missingCapabilityNames = missing.map(cap => `${cap.category}:${cap.name}`).join(', ');
      
      securityLogger.error(
        SecurityCategory.AUTHORIZATION,
        `Attempted to call function without required capabilities: ${missingCapabilityNames}`,
        'withCapabilities'
      );
      
      throw new Error(`Missing required capabilities: ${missingCapabilityNames}`);
    }
    
    return fn(...args);
  };
}

/**
 * Example usage:
 * 
 * import { withCapabilities, CapabilityCategory } from './capabilityValidator';
 * import { readTextFile } from '@tauri-apps/api/fs';
 * 
 * const secureReadFile = withCapabilities(
 *   [
 *     {
 *       category: CapabilityCategory.FS,
 *       name: 'readFile',
 *       description: 'Ability to read files from the filesystem',
 *       severity: 'high'
 *     }
 *   ],
 *   readTextFile
 * );
 * 
 * // This will check for the fs:readFile capability before executing
 * async function readConfig() {
 *   try {
 *     const content = await secureReadFile('config.json');
 *     return JSON.parse(content);
 *   } catch (error) {
 *     // Handle missing capability or other errors
 *     console.error(error);
 *     return null;
 *   }
 * }
 */ 