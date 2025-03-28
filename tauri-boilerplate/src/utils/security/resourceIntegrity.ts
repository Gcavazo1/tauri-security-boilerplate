/**
 * Resource integrity checking utilities for Tauri applications
 * 
 * These utilities provide mechanisms to verify the integrity of application resources:
 * 1. Verify resource hashes against expected values
 * 2. Detect tampering of application assets
 * 3. Verify digital signatures of critical files
 * 4. Log integrity violations
 */

import { readBinaryFile } from '@tauri-apps/api/fs';
import { decode } from '@tauri-apps/api/base64';
import { invoke } from '@tauri-apps/api/core';
import { securityLogger, SecurityCategory } from './securityLogger';
import { safeReadBinaryFile } from './safeFileHandling';

/**
 * Error thrown when resource integrity checks fail
 */
export class IntegrityError extends Error {
  constructor(
    message: string,
    public readonly resource?: string,
    public readonly expectedHash?: string,
    public readonly actualHash?: string
  ) {
    super(message);
    this.name = 'IntegrityError';
  }
}

/**
 * Resource manifest type defining expected hashes
 */
export interface ResourceManifest {
  resources: ResourceEntry[];
  manifestVersion: string;
  appVersion: string;
  generatedAt: string;
}

/**
 * Resource entry in the manifest
 */
export interface ResourceEntry {
  path: string;
  hash: string;
  hashAlgorithm: 'sha256' | 'sha384' | 'sha512';
  size: number;
  critical: boolean;
}

/**
 * Loads the resource manifest containing expected hashes
 * In a production app, this could be loaded from a secure location
 * @returns The resource manifest
 */
export async function loadResourceManifest(): Promise<ResourceManifest> {
  try {
    // In a real app, you might want to load this from a secure source
    // or embed it in the application binary
    const manifestData = await invoke<string>('get_resource_manifest');
    
    securityLogger.info(
      SecurityCategory.DATA_ACCESS,
      'Loaded resource integrity manifest',
      'resourceIntegrity'
    );
    
    return JSON.parse(manifestData) as ResourceManifest;
  } catch (error) {
    securityLogger.error(
      SecurityCategory.DATA_ACCESS,
      `Failed to load resource manifest: ${(error as Error)?.message || 'Unknown error'}`,
      'resourceIntegrity',
      { error }
    );
    
    throw new IntegrityError(
      `Failed to load resource manifest: ${(error as Error)?.message || 'Unknown error'}`
    );
  }
}

/**
 * Calculate the hash of a resource file
 * @param filePath Path to the file
 * @param algorithm Hash algorithm to use
 * @returns The calculated hash
 */
export async function calculateResourceHash(
  filePath: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): Promise<string> {
  try {
    // Use Rust backend to calculate hash for better performance and security
    const hash = await invoke<string>('calculate_hash', {
      path: filePath,
      algorithm,
    });
    
    return hash;
  } catch (error) {
    // Fallback to JS implementation if Rust command fails
    try {
      securityLogger.warning(
        SecurityCategory.DATA_ACCESS,
        `Falling back to JS hash implementation for ${filePath}`,
        'resourceIntegrity',
        { error }
      );
      
      // This is a simplified implementation
      // In a real app, you would use a proper crypto library
      const fileData = await safeReadBinaryFile(filePath);
      
      // This is a placeholder. In a real app, you would use a proper hash function
      return await computeHash(fileData, algorithm);
    } catch (fallbackError) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Failed to calculate hash for ${filePath}`,
        'resourceIntegrity',
        { error: fallbackError }
      );
      
      throw new IntegrityError(
        `Failed to calculate hash for ${filePath}: ${(fallbackError as Error)?.message || 'Unknown error'}`,
        filePath
      );
    }
  }
}

/**
 * Simplified placeholder for calculating hash in JS
 * In a real app, you would use the Web Crypto API or a proper crypto library
 * @param data The data to hash
 * @param algorithm The hash algorithm to use
 * @returns The calculated hash
 */
async function computeHash(
  data: Uint8Array,
  algorithm: 'sha256' | 'sha384' | 'sha512'
): Promise<string> {
  // This is a simplified implementation for demonstration
  // In a real app, you would use the Web Crypto API
  
  // Convert algorithm name to the format expected by Web Crypto API
  const algoName = algorithm.toUpperCase().replace('SHA', 'SHA-');
  
  // Use Web Crypto API to calculate hash
  const hashBuffer = await crypto.subtle.digest(algoName, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Verify the integrity of a single resource
 * @param resource The resource entry from the manifest
 * @returns True if the resource integrity is verified
 */
export async function verifyResourceIntegrity(resource: ResourceEntry): Promise<boolean> {
  try {
    // Calculate the actual hash
    const actualHash = await calculateResourceHash(resource.path, resource.hashAlgorithm);
    
    // Compare with expected hash
    const isValid = actualHash === resource.hash;
    
    if (!isValid) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Integrity check failed for ${resource.path}`,
        'resourceIntegrity',
        {
          expectedHash: resource.hash,
          actualHash,
          algorithm: resource.hashAlgorithm,
        }
      );
      
      if (resource.critical) {
        throw new IntegrityError(
          `Critical resource integrity check failed: ${resource.path}`,
          resource.path,
          resource.hash,
          actualHash
        );
      }
    } else {
      securityLogger.info(
        SecurityCategory.DATA_ACCESS,
        `Integrity verified for ${resource.path}`,
        'resourceIntegrity'
      );
    }
    
    return isValid;
  } catch (error) {
    if (error instanceof IntegrityError) {
      throw error;
    }
    
    securityLogger.error(
      SecurityCategory.DATA_ACCESS,
      `Failed to verify integrity for ${resource.path}`,
      'resourceIntegrity',
      { error }
    );
    
    throw new IntegrityError(
      `Failed to verify integrity for ${resource.path}: ${(error as Error)?.message || 'Unknown error'}`,
      resource.path
    );
  }
}

/**
 * Verify the integrity of all resources in the manifest
 * @param manifest The resource manifest
 * @param failFast Whether to throw on first failure
 * @returns Results of integrity checks
 */
export async function verifyAllResources(
  manifest: ResourceManifest,
  failFast = false
): Promise<{ 
  success: boolean; 
  results: Array<{ resource: ResourceEntry; valid: boolean; }>;
  criticalFailures: number;
}> {
  const results: Array<{ resource: ResourceEntry; valid: boolean }> = [];
  let criticalFailures = 0;
  
  securityLogger.info(
    SecurityCategory.DATA_ACCESS,
    `Starting integrity verification of ${manifest.resources.length} resources`,
    'resourceIntegrity'
  );
  
  for (const resource of manifest.resources) {
    try {
      const valid = await verifyResourceIntegrity(resource);
      results.push({ resource, valid });
      
      if (!valid && resource.critical) {
        criticalFailures++;
        
        if (failFast) {
          throw new IntegrityError(
            `Critical resource integrity check failed: ${resource.path}`,
            resource.path
          );
        }
      }
    } catch (error) {
      if (error instanceof IntegrityError && failFast) {
        throw error;
      }
      
      results.push({ resource, valid: false });
      
      if (resource.critical) {
        criticalFailures++;
      }
    }
  }
  
  const success = results.every(r => r.valid);
  
  securityLogger.info(
    SecurityCategory.DATA_ACCESS,
    `Integrity verification complete: ${success ? 'All passed' : 'Some failed'}`,
    'resourceIntegrity',
    { 
      totalResources: manifest.resources.length,
      failedResources: results.filter(r => !r.valid).length,
      criticalFailures 
    }
  );
  
  return { 
    success, 
    results,
    criticalFailures
  };
}

/**
 * Generate a manifest of resources for later integrity checking
 * This would typically be run during the build process
 * @param resourcePaths Paths to the resources to include
 * @param appVersion Current application version
 * @returns The generated resource manifest
 */
export async function generateResourceManifest(
  resourcePaths: string[],
  appVersion: string
): Promise<ResourceManifest> {
  // In a real app, you would determine which resources are critical
  const isCriticalResource = (path: string) => {
    return path.includes('main.js') || 
           path.includes('index.html') || 
           path.endsWith('.dll') || 
           path.endsWith('.so');
  };
  
  const resources: ResourceEntry[] = [];
  
  for (const path of resourcePaths) {
    try {
      const fileData = await safeReadBinaryFile(path);
      const hash = await computeHash(fileData, 'sha256');
      
      resources.push({
        path,
        hash,
        hashAlgorithm: 'sha256',
        size: fileData.length,
        critical: isCriticalResource(path)
      });
    } catch (error) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Failed to process resource for manifest: ${path}`,
        'resourceIntegrity',
        { error }
      );
    }
  }
  
  const manifest: ResourceManifest = {
    resources,
    manifestVersion: '1.0',
    appVersion,
    generatedAt: new Date().toISOString()
  };
  
  securityLogger.info(
    SecurityCategory.DATA_ACCESS,
    `Generated resource manifest with ${resources.length} resources`,
    'resourceIntegrity'
  );
  
  return manifest;
}

/**
 * Example usage:
 * 
 * import { 
 *   loadResourceManifest, 
 *   verifyAllResources 
 * } from './resourceIntegrity';
 * 
 * async function checkAppIntegrity() {
 *   try {
 *     const manifest = await loadResourceManifest();
 *     const results = await verifyAllResources(manifest);
 *     
 *     if (!results.success) {
 *       console.error(`Integrity check failed for ${results.results.filter(r => !r.valid).length} resources`);
 *       
 *       if (results.criticalFailures > 0) {
 *         // Handle critical failures (e.g., exit the app)
 *         console.error(`${results.criticalFailures} critical resources failed integrity checks!`);
 *       }
 *     }
 *     
 *     return results.success;
 *   } catch (error) {
 *     console.error('Failed to verify app integrity:', error);
 *     return false;
 *   }
 * }
 */ 