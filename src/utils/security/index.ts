/**
 * Security module entry point
 * 
 * Re-exports security utilities for easy access throughout the application.
 */

// Security logging
export {
  securityLogger,
  SecurityLevel,
  SecurityCategory,
  type SecurityEvent
} from './securityLogger';

// Secure storage
export {
  getSecureStorage,
  SecureStorage
} from './secureStorage';

// Safe file handling
export {
  safeReadFile,
  safeWriteFile,
  type SafeDirectoryEntry
} from './safeFileHandling';

// Safe network requests
export {
  secureGet,
  securePut
} from './safeNetworkRequests';

// Resource integrity checking
export {
  verifyResourceIntegrity
} from './resourceIntegrity';

// Re-export capabilities system
export {
  withCapabilities,
  type Capability
} from './capabilityValidator';

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