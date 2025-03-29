/**
 * Security utilities index file
 * 
 * Re-exports security modules for convenient access
 */

// Re-export security modules
export { securityLogger, SecurityCategory } from './securityLogger';
export { safeReadTextFile, safeWriteTextFile, safeReadBinaryFile, safeWriteBinaryFile, safeRenameFile, safeRemoveFile } from './safeFileHandling';
export { secureGet, securePost, securePut } from './safeNetworkRequests';
export { secureStore, secureRetrieve, secureDelete, secureClear } from './secureStorage';
export { verifyResourceIntegrity } from './resourceIntegrity';
export { listDirectoryFiles, selectFile, selectDirectory } from './tauriApi';
export type { FileEntry, FileResponse } from './tauriApi';
export { withCapability, Capability } from './capabilityValidator';
export type { OperationResult } from './capabilityValidator';

// Re-export type definitions
export type {
  // Secure request types
  SecureRequestOptions,
  SecurePostOptions
} from './safeNetworkRequests';

// Export custom hooks related to security
export { useSecurityContext } from '../../hooks/useSecurityContext';

/**
 * Example of using the security modules:
 * 
 * import { 
 *   securityLogger, 
 *   SecurityCategory,
 *   safeReadTextFile,
 *   secureGet,
 *   withCapability,
 *   Capability
 * } from './utils/security';
 * 
 * // Log security events
 * securityLogger.info(
 *   SecurityCategory.GENERAL, 
 *   'Application started', 
 *   'index.ts'
 * );
 * 
 * // Safely read files
 * const fileContent = await safeReadTextFile('/path/to/file.txt');
 * 
 * // Make secure network requests
 * const data = await secureGet<ResponseType>('https://api.example.com/data');
 * 
 * // Use capability-based security
 * const secureOperation = withCapability(
 *   Capability.READ_FILES,
 *   async (filePath) => {
 *     // Only users with READ_FILES capability can execute this
 *     return await safeReadTextFile(filePath);
 *   }
 * );
 * 
 * const result = await secureOperation('/path/to/sensitive/file.txt');
 */ 