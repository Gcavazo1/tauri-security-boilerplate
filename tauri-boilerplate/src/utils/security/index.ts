/**
 * Security utilities index file
 * 
 * This file exports all security-related utilities to make them easier to import.
 */

// Security logging
export { 
  SecurityLogger, 
  securityLogger, 
  SecurityLevel, 
  SecurityCategory,
  type SecurityEvent
} from './securityLogger';

// Secure storage
export { 
  SecureStorage, 
  secureStorage 
} from './secureStorage';

// Capability validation
export { 
  CapabilityValidator, 
  capabilityValidator, 
  CapabilityCategory,
  withCapabilities, 
  type CapabilityRequirement 
} from './capabilityValidator';

// Safe IPC communication
export { 
  createSafeIpc, 
  SafeIpcError,
  isPrimitive,
  isJsonObject,
  createObjectValidator,
  createSchemaValidator,
  createArrayValidator
} from './safeIpc';

// Safe file handling
export { 
  safeReadTextFile,
  safeWriteTextFile,
  safeReadBinaryFile,
  safeWriteBinaryFile,
  safeReadDir,
  safeCreateDir,
  safeRemoveDir,
  safeRemoveFile,
  FileOperationError,
  type SafeDirectoryEntry
} from './safeFileHandling';

// Safe network requests
export {
  safeFetch,
  safeGet,
  safePost,
  safePut,
  safeDelete,
  NetworkSecurityError
} from './safeNetworkRequests';

// Resource integrity checking
export {
  loadResourceManifest,
  calculateResourceHash,
  verifyResourceIntegrity,
  verifyAllResources,
  generateResourceManifest,
  IntegrityError,
  type ResourceManifest,
  type ResourceEntry
} from './resourceIntegrity';

/**
 * Example usage:
 * 
 * import { 
 *   securityLogger, 
 *   SecurityCategory,
 *   secureStorage,
 *   safeReadTextFile,
 *   safeGet,
 *   verifyResourceIntegrity
 * } from '../../utils/security';
 * 
 * // This makes imports much cleaner than importing from individual files
 */ 